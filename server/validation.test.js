import assert from 'node:assert/strict';
import test from 'node:test';
import {
  enrollmentCreateSchema,
  fitnessAdviceSchema,
  loginSchema,
  matchCreateSchema,
  matchRecommendationSchema,
  matchUpdateSchema,
  registerSchema,
} from './validation.js';

test('accepts a valid match and trims its text fields', () => {
  const result = matchCreateSchema.parse({
    title: '  Walking Cricket  ',
    date: '2026-12-10',
    time: '09:30',
    place: '  Andheri  ',
  });

  assert.equal(result.title, 'Walking Cricket');
  assert.equal(result.place, 'Andheri');
});

test('rejects invalid calendar dates and empty match updates', () => {
  assert.equal(matchCreateSchema.safeParse({
    title: 'Friendly Match',
    date: '2026-02-30',
    time: '09:30',
    place: 'Andheri',
  }).success, false);
  assert.equal(matchUpdateSchema.safeParse({}).success, false);
});

test('coerces emergency age and rejects malformed enrollment data', () => {
  const valid = enrollmentCreateSchema.parse({
    matchId: '0123456789abcdef01234567',
    userId: 'legacy-user-id',
    playerName: 'Player One',
    contactNumber: '9876543210',
    dob: '1958-04-22',
    emergencyName: 'Contact Person',
    emergencyAge: '45',
    emergencyRelation: 'Child',
    emergencyContact: '9876501234',
    address: 'Mumbai',
  });

  assert.equal(valid.emergencyAge, 45);
  assert.equal('userId' in valid, false);
  assert.equal(enrollmentCreateSchema.safeParse({ ...valid, emergencyAge: '' }).success, false);
});

test('allows short non-empty passwords, normalizes email, and strips client-supplied roles', () => {
  const registration = registerSchema.safeParse({
    username: 'Player One',
    email: 'PLAYER@EXAMPLE.COM',
    password: 'x',
    contactNumber: '9876543210',
    city: 'Mumbai',
    role: 'admin',
  });

  test('validates AI inputs and trims user-provided text', () => {
    assert.deepEqual(matchRecommendationSchema.parse({ userProfile: '  Former player  ' }), {
      userProfile: 'Former player',
    });
    assert.equal(matchRecommendationSchema.safeParse({ userProfile: ' ' }).success, false);
    assert.equal(fitnessAdviceSchema.safeParse({
      matchFormat: 'Walking Cricket',
      physicalConstraints: 'x'.repeat(2001),
    }).success, false);
  });
  assert.equal(registration.success, true);
  assert.equal(registration.data.email, 'player@example.com');
  assert.equal('role' in registration.data, false);
  assert.equal(registerSchema.safeParse({
    username: 'Player One',
    email: 'player@example.com',
    password: '',
    contactNumber: '9876543210',
    city: 'Mumbai',
  }).success, false);
  assert.equal(registerSchema.safeParse({
    username: 'Player One',
    email: 'player@example.com',
    password: 'x'.repeat(73),
    contactNumber: '9876543210',
    city: 'Mumbai',
  }).success, false);
  assert.equal(loginSchema.safeParse({ email: 'not-an-email', password: 'whatever' }).success, false);
});
