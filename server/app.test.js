import assert from 'node:assert/strict';
import { once } from 'node:events';
import test from 'node:test';
import app from './app.js';

test('health reports when MongoDB is not connected', async (t) => {
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }));

  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/health`);
  const payload = await response.json();

  assert.equal(response.status, 503);
  assert.equal(payload.data.database, 'disconnected');
});

test('unknown API routes return a JSON 404', async (t) => {
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }));

  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/not-a-route`);
  const payload = await response.json();

  assert.equal(response.status, 404);
  assert.equal(payload.error.code, 'NOT_FOUND');
});
