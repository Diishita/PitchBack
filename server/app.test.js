import assert from 'node:assert/strict';
import { once } from 'node:events';
import test from 'node:test';
import app from './app.js';

const startTestServer = async (t) => {
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }));
  return `http://127.0.0.1:${server.address().port}`;
};

test('health reports when MongoDB is not connected', async (t) => {
  const baseUrl = await startTestServer(t);
  const response = await fetch(`${baseUrl}/api/health`);
  const payload = await response.json();

  assert.equal(response.status, 503);
  assert.equal(payload.data.database, 'disconnected');
});

test('unknown API routes return a JSON 404', async (t) => {
  const baseUrl = await startTestServer(t);
  const response = await fetch(`${baseUrl}/api/not-a-route`);
  const payload = await response.json();

  assert.equal(response.status, 404);
  assert.equal(payload.error.code, 'NOT_FOUND');
});

test('anonymous sessions can be checked without exposing enrollment data', async (t) => {
  const baseUrl = await startTestServer(t);
  const [sessionResponse, enrollmentResponse] = await Promise.all([
    fetch(`${baseUrl}/api/auth/me`),
    fetch(`${baseUrl}/api/enrollments`),
  ]);
  const sessionPayload = await sessionResponse.json();
  const enrollmentPayload = await enrollmentResponse.json();

  assert.equal(sessionResponse.status, 200);
  assert.equal(sessionPayload.data, null);
  assert.equal(enrollmentResponse.status, 401);
  assert.equal(enrollmentPayload.error.code, 'AUTH_REQUIRED');
});

test('anonymous requests cannot create or manage matches', async (t) => {
  const baseUrl = await startTestServer(t);
  const response = await fetch(`${baseUrl}/api/matches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Test match',
      date: '2026-12-10',
      time: '09:30',
      place: 'Test venue',
    }),
  });
  const payload = await response.json();

  assert.equal(response.status, 401);
  assert.equal(payload.error.code, 'AUTH_REQUIRED');
});
