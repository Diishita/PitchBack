import { GoogleGenAI } from '@google/genai';

// Initialize the AI, securely pulling the key from your local .env file
const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY
});

export const getMatchRecommendation = async (userProfile) => {
  try {
    const prompt = `You are a helpful sports assistant for the PitchBack platform. Based on this retired player's profile: "${userProfile}", recommend the safest, most suitable cricket match format (e.g., Walking Cricket, Soft-ball, T20). Keep the response brief, respectful, and encouraging.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("AI Matchmaker Error:", error);
    return "We couldn't generate a personalized recommendation right now, but there are plenty of great matches available!";
  }
};

export const getFitnessSafetyAdvisor = async (matchFormat, physicalConstraints) => {
  try {
    const prompt = `You are a Senior Fitness & Safety Advisor for PitchBack, a cricket platform for retired players. 
    
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

Keep it senior-friendly, low-impact, and encouraging. Use simple language.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("AI Fitness Advisor Error:", error);
    return "We couldn't generate a personalized fitness routine right now. Please consult with a healthcare professional before any physical activity.";
  }
};