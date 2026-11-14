import assert from 'node:assert/strict';
import { once } from 'node:events';
import test from 'node:test';
import app, { createApp } from './app.js';

const startTestServer = async (t, testApp = app) => {
  const server = testApp.listen(0, '127.0.0.1');
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

test('notification records cannot be read or dismissed without authentication', async (t) => {
  const baseUrl = await startTestServer(t);
  const [listResponse, dismissResponse] = await Promise.all([
    fetch(`${baseUrl}/api/notifications`),
    fetch(`${baseUrl}/api/notifications/507f1f77bcf86cd799439011`, { method: 'DELETE' }),
  ]);

  assert.equal(listResponse.status, 401);
  assert.equal(dismissResponse.status, 401);
});

test('invalid public suggestions are rejected before database access', async (t) => {
  const baseUrl = await startTestServer(t);
  const response = await fetch(`${baseUrl}/api/suggestions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'A', message: 'Hi' }),
  });
  const payload = await response.json();

  assert.equal(response.status, 400);
  assert.equal(payload.error.code, 'VALIDATION_ERROR');
});

test('suggestion submissions can be read only by administrators', async (t) => {
  const baseUrl = await startTestServer(t);
  const response = await fetch(`${baseUrl}/api/suggestions`);
  const payload = await response.json();

  assert.equal(response.status, 401);
  assert.equal(payload.error.code, 'AUTH_REQUIRED');
});

test('AI endpoint reports an explicit configuration error when its key is missing', async (t) => {
  const previousKey = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  t.after(() => {
    if (previousKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = previousKey;
  });

  const baseUrl = await startTestServer(t);
  const response = await fetch(`${baseUrl}/api/ai/match-recommendation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userProfile: 'Former cricket player, age 68.' }),
  });
  const payload = await response.json();

  assert.equal(response.status, 503);
  assert.equal(payload.error.code, 'AI_NOT_CONFIGURED');
});

test('configured production CORS allows only the frontend origin', async (t) => {
  const previous = {
    nodeEnv: process.env.NODE_ENV,
    frontendOrigins: process.env.FRONTEND_ORIGINS,
    sessionSecret: process.env.SESSION_SECRET,
  };
  process.env.NODE_ENV = 'production';
  process.env.FRONTEND_ORIGINS = 'https://pitchback.vercel.app';
  process.env.SESSION_SECRET = 'test-secret-'.repeat(4);
  const productionApp = createApp();
  if (previous.nodeEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = previous.nodeEnv;
  if (previous.frontendOrigins === undefined) delete process.env.FRONTEND_ORIGINS;
  else process.env.FRONTEND_ORIGINS = previous.frontendOrigins;
  if (previous.sessionSecret === undefined) delete process.env.SESSION_SECRET;
  else process.env.SESSION_SECRET = previous.sessionSecret;

  const baseUrl = await startTestServer(t, productionApp);
  const allowedResponse = await fetch(`${baseUrl}/api/health`, {
    headers: { Origin: 'https://pitchback.vercel.app' },
  });
  const rejectedResponse = await fetch(`${baseUrl}/api/health`, {
    headers: { Origin: 'https://untrusted.example' },
  });

  assert.equal(allowedResponse.headers.get('access-control-allow-origin'), 'https://pitchback.vercel.app');
  assert.equal(allowedResponse.headers.get('access-control-allow-credentials'), 'true');
  assert.equal(rejectedResponse.status, 403);
});
