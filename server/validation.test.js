import assert from 'node:assert/strict';
import test from 'node:test';
import { enrollmentCreateSchema, matchCreateSchema, matchUpdateSchema } from './validation.js';

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
  assert.equal(enrollmentCreateSchema.safeParse({ ...valid, emergencyAge: '' }).success, false);
});
