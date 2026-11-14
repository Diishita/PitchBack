import assert from 'node:assert/strict';
import { once } from 'node:events';
import test from 'node:test';
import app from './app.js';
import { Suggestion } from './models/Suggestion.js';
import { User } from './models/User.js';

test('public suggestion submission validates input before calling the MongoDB model', async (t) => {
  let savedSuggestion;
  t.mock.method(Suggestion, 'create', async (suggestion) => {
    savedSuggestion = suggestion;
    return {
      _id: { toString: () => '507f1f77bcf86cd799439011' },
      createdAt: new Date('2026-11-14T10:00:00.000Z'),
    };
  });
  t.mock.method(User, 'find', () => ({
    select: () => ({
      lean: async () => [],
    }),
  }));
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }));

  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/suggestions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: '  Cricket fan  ',
      message: '  Please add a weekend match.  ',
    }),
  });
  const payload = await response.json();

  assert.equal(response.status, 201);
  assert.deepEqual(savedSuggestion, {
    name: 'Cricket fan',
    message: 'Please add a weekend match.',
  });
  assert.equal(payload.data.id, '507f1f77bcf86cd799439011');
});
