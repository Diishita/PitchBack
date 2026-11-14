import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { GoogleGenAI } from '@google/genai';
import { validateBody } from '../middleware/validateBody.js';
import { fitnessAdviceSchema, matchRecommendationSchema } from '../validation.js';

const router = Router();

const aiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'AI_RATE_LIMITED',
      message: 'Too many AI requests. Try again later.',
    },
  },
});

const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

let aiClient;
const getAiClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw Object.assign(new Error('The AI service is not configured.'), {
      statusCode: 503,
      code: 'AI_NOT_CONFIGURED',
    });
  }
  aiClient ||= new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return aiClient;
};

const generateContent = async (prompt) => {
  const client = getAiClient();
  let response;
  try {
    response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
  } catch (error) {
    console.error('[AI] Provider request failed', error instanceof Error ? error.name : 'Unknown error');
    throw Object.assign(new Error('The AI request failed.'), {
      statusCode: 502,
      code: 'AI_REQUEST_FAILED',
    });
  }
  if (!response.text?.trim()) {
    throw Object.assign(new Error('The AI service returned no response.'), {
      statusCode: 502,
      code: 'AI_EMPTY_RESPONSE',
    });
  }
  return response.text.trim();
};

router.use(aiRateLimit);

router.post('/match-recommendation', validateBody(matchRecommendationSchema), asyncHandler(async (req, res) => {
  const { userProfile } = req.validatedBody;
  const recommendation = await generateContent(
    `You are a helpful sports assistant for the PitchBack platform. Based on this retired player's profile: "${userProfile}", recommend the safest, most suitable cricket match format (e.g., Walking Cricket, Soft-ball, T20). Keep the response brief, respectful, and encouraging.`,
  );
  return res.json({ data: { recommendation } });
}));

router.post('/fitness-advice', validateBody(fitnessAdviceSchema), asyncHandler(async (req, res) => {
  const { matchFormat, physicalConstraints } = req.validatedBody;
  const routine = await generateContent(`You are a Senior Fitness & Safety Advisor for PitchBack, a cricket platform for retired players.

Match Format: ${matchFormat}
Physical Constraints/Conditions: ${physicalConstraints || 'No specific constraints'}

Generate a SAFE and EASY 5-minute warm-up and cool-down routine specifically tailored for this match format and physical conditions.
Format your response with clear sections:

**WARM-UP (2-3 minutes):**
- List 3-4 gentle movements with brief descriptions and repetitions

**COOL-DOWN (2-3 minutes):**
- List 3-4 gentle stretches with brief descriptions and hold times

**SAFETY TIPS:**
- 2-3 key safety reminders specific to their constraints

Keep it senior-friendly, low-impact, and encouraging. Use simple language.`);
  return res.json({ data: { routine } });
}));

export default router;
