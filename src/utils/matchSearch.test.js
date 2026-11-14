import assert from 'node:assert/strict';
import test from 'node:test';
import { filterMatches, normalizeVoiceSearchCommand } from './matchSearch.js';

const matches = [
  { title: 'Walking Cricket', place: 'Andheri' },
  { title: 'Masters T20', place: 'Borivali' },
];

test('filters matches by title without case sensitivity', () => {
  assert.deepEqual(filterMatches(matches, 'WALKING'), [matches[0]]);
});

test('filters matches by venue', () => {
  assert.deepEqual(filterMatches(matches, 'borivali'), [matches[1]]);
});

test('returns every match when the query is blank', () => {
  assert.deepEqual(filterMatches(matches, '  '), matches);
});

test('normalizes a voice command into a match search term', () => {
  assert.equal(normalizeVoiceSearchCommand('Find matches for Andheri'), 'andheri');
});
