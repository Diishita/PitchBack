import { Router } from 'express';
import mongoose from 'mongoose';
import { Enrollment } from '../models/Enrollment.js';
import { Match } from '../models/Match.js';
import { enrollmentCreateSchema, enrollmentUpdateSchema } from '../validation.js';
import { validateBody } from '../middleware/validateBody.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = Router();

const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

const toEnrollmentDto = (enrollment) => ({
  id: enrollment._id.toString(),
  matchId: enrollment.matchId.toString(),
  userId: enrollment.userId,
  playerName: enrollment.playerName,
  contactNumber: enrollment.contactNumber,
  dob: enrollment.dob,
  emergencyName: enrollment.emergencyName,
  emergencyAge: enrollment.emergencyAge,
  emergencyRelation: enrollment.emergencyRelation,
  emergencyContact: enrollment.emergencyContact,
  medicalInfo: enrollment.medicalInfo,
  requirements: enrollment.requirements,
  address: enrollment.address,
  createdAt: enrollment.createdAt,
  updatedAt: enrollment.updatedAt,
});

router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { userId: req.user._id };
  const enrollments = await Enrollment.find(filter).sort({ createdAt: -1 });
  res.json({ data: enrollments.map(toEnrollmentDto) });
}));

router.post('/', requireAuth, validateBody(enrollmentCreateSchema), asyncHandler(async (req, res, next) => {
  const match = await Match.findById(req.validatedBody.matchId);
  if (!match) {
    return next(Object.assign(new Error('The selected match does not exist.'), {
      statusCode: 404,
      code: 'MATCH_NOT_FOUND',
    }));
  }

  const enrollment = await Enrollment.create({
    ...req.validatedBody,
    userId: req.user._id,
  });
  return res.status(201).json({ data: toEnrollmentDto(enrollment) });
}));

router.patch('/:id', requireAuth, requireAdmin, validateBody(enrollmentUpdateSchema), asyncHandler(async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return next(Object.assign(new Error('Enrollment ID is invalid.'), {
      statusCode: 400,
      code: 'INVALID_ID',
    }));
  }

  const enrollment = await Enrollment.findByIdAndUpdate(req.params.id, req.validatedBody, {
    new: true,
    runValidators: true,
  });
  if (!enrollment) {
    return next(Object.assign(new Error('Enrollment not found.'), {
      statusCode: 404,
      code: 'NOT_FOUND',
    }));
  }

  return res.json({ data: toEnrollmentDto(enrollment) });
}));

router.delete('/by-user/:userId', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const result = await Enrollment.deleteMany({ userId: req.params.userId });
  res.json({ data: { deletedCount: result.deletedCount } });
}));

router.delete('/:id', requireAuth, requireAdmin, asyncHandler(async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return next(Object.assign(new Error('Enrollment ID is invalid.'), {
      statusCode: 400,
      code: 'INVALID_ID',
    }));
  }

  const enrollment = await Enrollment.findByIdAndDelete(req.params.id);
  if (!enrollment) {
    return next(Object.assign(new Error('Enrollment not found.'), {
      statusCode: 404,
      code: 'NOT_FOUND',
    }));
  }

  return res.json({ data: { id: enrollment._id.toString(), deleted: true } });
}));

export default router;
