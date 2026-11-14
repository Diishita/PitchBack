import { Router } from 'express';
import mongoose from 'mongoose';
import { Suggestion } from '../models/Suggestion.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validateBody.js';
import { suggestionCreateSchema, suggestionStatusSchema } from '../validation.js';
import { notifyAdmins } from '../notifications.js';
import { notifySuggestionsChanged } from '../realtime.js';

const router = Router();

const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

const toSuggestionDto = (suggestion) => ({
  id: suggestion._id.toString(),
  name: suggestion.name,
  message: suggestion.message,
  status: suggestion.status,
  createdAt: suggestion.createdAt,
});

router.post('/', validateBody(suggestionCreateSchema), asyncHandler(async (req, res) => {
  const suggestion = await Suggestion.create(req.validatedBody);
  const io = req.app.get('io');
  try {
    await notifyAdmins(io, {
      type: 'suggestion',
      title: 'New suggestion received',
      message: 'A visitor shared a suggestion. Review it in the admin panel.',
    });
  } catch (error) {
    console.error('[API] Suggestion saved, but administrator notification failed.', error);
  }
  notifySuggestionsChanged(io);
  return res.status(201).json({ data: { id: suggestion._id.toString(), createdAt: suggestion.createdAt } });
}));

router.get('/', requireAuth, requireAdmin, asyncHandler(async (_req, res) => {
  const suggestions = await Suggestion.find().sort({ status: 1, createdAt: -1 });
  res.json({ data: suggestions.map(toSuggestionDto) });
}));

router.patch('/:id/status', requireAuth, requireAdmin, validateBody(suggestionStatusSchema), asyncHandler(async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return next(Object.assign(new Error('Suggestion ID is invalid.'), {
      statusCode: 400,
      code: 'INVALID_ID',
    }));
  }

  const suggestion = await Suggestion.findByIdAndUpdate(
    req.params.id,
    { status: req.validatedBody.status },
    { new: true, runValidators: true },
  );
  if (!suggestion) {
    return next(Object.assign(new Error('Suggestion not found.'), {
      statusCode: 404,
      code: 'NOT_FOUND',
    }));
  }

  return res.json({ data: toSuggestionDto(suggestion) });
}));

export default router;
