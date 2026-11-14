import { z } from 'zod';

const matchIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'A valid match ID is required.');
const dateSchema = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year
      && date.getUTCMonth() === month - 1
      && date.getUTCDate() === day;
  }, 'Enter a real calendar date.');

export const matchCreateSchema = z.object({
  title: z.string().trim().min(2).max(120),
  date: dateSchema,
  time: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/),
  place: z.string().trim().min(2).max(120),
});

export const matchUpdateSchema = matchCreateSchema.partial().refine(
  (match) => Object.keys(match).length > 0,
  'At least one match field is required.',
);

export const enrollmentCreateSchema = z.object({
  matchId: matchIdSchema,
  userId: z.string().trim().min(1).max(100),
  playerName: z.string().trim().min(2).max(100),
  contactNumber: z.string().trim().min(6).max(25),
  dob: dateSchema,
  emergencyName: z.string().trim().min(2).max(100),
  emergencyAge: z.preprocess(
    (value) => typeof value === 'string' && value.trim() === '' ? Number.NaN : value,
    z.coerce.number().int().min(0).max(120),
  ),
  emergencyRelation: z.string().trim().min(2).max(60),
  emergencyContact: z.string().trim().min(6).max(25),
  medicalInfo: z.string().trim().max(2000).optional().default(''),
  requirements: z.string().trim().max(2000).optional().default(''),
  address: z.string().trim().min(3).max(300),
});

export const enrollmentUpdateSchema = enrollmentCreateSchema
  .omit({ matchId: true, userId: true })
  .partial()
  .refine(
    (enrollment) => Object.keys(enrollment).length > 0,
    'At least one enrollment field is required.',
  );
