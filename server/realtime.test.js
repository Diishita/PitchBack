import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import test from 'node:test';
import { io as connectClient } from 'socket.io-client';
import { createApp } from './app.js';
import {
  attachRealtime,
  notifyEnrollmentsChanged,
  notifyMatchesChanged,
} from './realtime.js';

test('connected visitors receive match-change events without data payloads', async (t) => {
  const app = createApp();
  const httpServer = createServer(app);
  const realtime = attachRealtime(httpServer, app.get('sessionMiddleware'));
  await new Promise((resolve) => httpServer.listen(0, '127.0.0.1', resolve));
  const address = httpServer.address();
  const client = connectClient(`http://127.0.0.1:${address.port}`, {
    autoConnect: false,
    transports: ['websocket'],
  });
  t.after(() => new Promise((resolve) => {
    client.disconnect();
    realtime.close(resolve);
  }));

  await new Promise((resolve, reject) => {
    client.once('connect', resolve);
    client.once('connect_error', reject);
    client.connect();
  });

  const event = new Promise((resolve) => {
    client.once('matches:changed', (...payload) => resolve(payload));
  });
  notifyMatchesChanged(realtime);

  assert.deepEqual(await event, []);
});

test('enrollment notifications target authenticated clients and contain no private data', () => {
  const notifications = [];
  const realtime = {
    to(room) {
      return {
        emit(event, ...payload) {
          notifications.push({ room, event, payload });
        },
      };
    },
  };

  notifyEnrollmentsChanged(realtime);

  assert.deepEqual(notifications, [{
    room: 'authenticated',
    event: 'enrollments:changed',
    payload: [],
  }]);
});
