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

const emailSchema = z.string().trim().email().max(254).transform((email) => email.toLowerCase());
const passwordSchema = z.string()
  .min(1, 'Password is required.')
  .refine((password) => Buffer.byteLength(password, 'utf8') <= 72, 'Password is too long.');

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

export const registerSchema = z.object({
  username: z.string().trim().min(2).max(100),
  email: emailSchema,
  password: passwordSchema,
  contactNumber: z.string().trim().min(6).max(25),
  city: z.string().trim().min(2).max(100),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const blockUserSchema = z.object({
  isBlocked: z.boolean(),
});

export const suggestionCreateSchema = z.object({
  name: z.string().trim().min(2).max(100),
  message: z.string().trim().min(5).max(2000),
});

export const suggestionStatusSchema = z.object({
  status: z.enum(['new', 'reviewed']),
});

export const matchRecommendationSchema = z.object({
  userProfile: z.string().trim().min(1).max(2000),
});

export const fitnessAdviceSchema = z.object({
  matchFormat: z.enum(['Walking Cricket', 'T20', 'Soft-ball Cricket', 'Friendly Match', 'Masters Cricket']),
  physicalConstraints: z.string().trim().max(2000).optional().default(''),
});

export const enrollmentUpdateSchema = enrollmentCreateSchema
  .omit({ matchId: true })
  .partial()
  .refine(
    (enrollment) => Object.keys(enrollment).length > 0,
    'At least one enrollment field is required.',
  );
