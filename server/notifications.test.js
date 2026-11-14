import assert from 'node:assert/strict';
import test from 'node:test';
import { Notification } from './models/Notification.js';
import { createNotifications } from './notifications.js';

test('notification creation persists one safe summary per recipient and sends private signals', async (t) => {
  let inserted;
  t.mock.method(Notification, 'insertMany', async (documents) => {
    inserted = documents;
    return documents;
  });
  const emitted = [];
  const io = {
    to(room) {
      return {
        emit(event, ...payload) {
          emitted.push({ room, event, payload });
        },
      };
    },
  };

  await createNotifications(io, ['player-1', 'player-1', 'player-2'], {
    type: 'enrollment',
    title: 'Enrollment updated',
    message: 'Your match enrollment details have been updated.',
  });

  assert.deepEqual(inserted, [
    {
      type: 'enrollment',
      title: 'Enrollment updated',
      message: 'Your match enrollment details have been updated.',
      recipientId: 'player-1',
    },
    {
      type: 'enrollment',
      title: 'Enrollment updated',
      message: 'Your match enrollment details have been updated.',
      recipientId: 'player-2',
    },
  ]);
  assert.deepEqual(emitted, [
    { room: 'user:player-1', event: 'notifications:changed', payload: [] },
    { room: 'user:player-2', event: 'notifications:changed', payload: [] },
  ]);
});

test('notification creation does not write or emit when there are no recipients', async (t) => {
  t.mock.method(Notification, 'insertMany', async () => {
    assert.fail('No notification documents should be inserted.');
  });

  await createNotifications(undefined, [], {
    type: 'match',
    title: 'Match updated',
    message: 'A match was updated.',
  });
});
