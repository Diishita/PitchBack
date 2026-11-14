import { Router } from 'express';
import mongoose from 'mongoose';
import { Match } from '../models/Match.js';
import { Enrollment } from '../models/Enrollment.js';
import { matchCreateSchema, matchUpdateSchema } from '../validation.js';
import { validateBody } from '../middleware/validateBody.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import { notifyEnrollmentsChanged, notifyMatchesChanged } from '../realtime.js';

const router = Router();

const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

const toMatchDto = (match) => ({
  id: match._id.toString(),
  title: match.title,
  date: match.date,
  time: match.time,
  place: match.place,
  createdAt: match.createdAt,
  updatedAt: match.updatedAt,
});

router.get('/', asyncHandler(async (_req, res) => {
  const matches = await Match.find().sort({ date: 1, time: 1 });
  res.json({ data: matches.map(toMatchDto) });
}));

router.post('/', requireAuth, requireAdmin, validateBody(matchCreateSchema), asyncHandler(async (req, res) => {
  const match = await Match.create(req.validatedBody);
  notifyMatchesChanged(req.app.get('io'));
  res.status(201).json({ data: toMatchDto(match) });
}));

router.get('/:id', asyncHandler(async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return next(Object.assign(new Error('Match ID is invalid.'), {
      statusCode: 400,
      code: 'INVALID_ID',
    }));
  }

  const match = await Match.findById(req.params.id);
  if (!match) {
    return next(Object.assign(new Error('Match not found.'), {
      statusCode: 404,
      code: 'NOT_FOUND',
    }));
  }

  return res.json({ data: toMatchDto(match) });
}));

router.patch('/:id', requireAuth, requireAdmin, validateBody(matchUpdateSchema), asyncHandler(async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return next(Object.assign(new Error('Match ID is invalid.'), {
      statusCode: 400,
      code: 'INVALID_ID',
    }));
  }

  const match = await Match.findByIdAndUpdate(req.params.id, req.validatedBody, {
    new: true,
    runValidators: true,
  });
  if (!match) {
    return next(Object.assign(new Error('Match not found.'), {
      statusCode: 404,
      code: 'NOT_FOUND',
    }));
  }

  notifyMatchesChanged(req.app.get('io'));
  return res.json({ data: toMatchDto(match) });
}));

router.delete('/:id', requireAuth, requireAdmin, asyncHandler(async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return next(Object.assign(new Error('Match ID is invalid.'), {
      statusCode: 400,
      code: 'INVALID_ID',
    }));
  }

  const match = await Match.findByIdAndDelete(req.params.id);
  if (!match) {
    return next(Object.assign(new Error('Match not found.'), {
      statusCode: 404,
      code: 'NOT_FOUND',
    }));
  }

  await Enrollment.deleteMany({ matchId: match._id });
  notifyMatchesChanged(req.app.get('io'));
  notifyEnrollmentsChanged(req.app.get('io'));
  return res.json({ data: { id: match._id.toString(), deleted: true } });
}));

export default router;
