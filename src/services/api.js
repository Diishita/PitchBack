const API_BASE = '/api';

const request = async (path, { method = 'GET', body, signal } = {}) => {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });

  const responseText = await response.text();
  let payload = null;
  if (responseText) {
    try {
      payload = JSON.parse(responseText);
    } catch (parseError) {
      console.error('[API] Invalid JSON response', parseError);
      throw new Error('The server returned an invalid response.', { cause: parseError });
    }
  }

  if (!response.ok) {
    throw new Error(payload?.error?.message || `Request failed with status ${response.status}.`);
  }

  return payload?.data;
};

export const api = {
  health: (options) => request('/health', options),
  matches: {
    list: (options) => request('/matches', options),
    create: (match) => request('/matches', { method: 'POST', body: match }),
    update: (id, match) => request(`/matches/${encodeURIComponent(id)}`, { method: 'PATCH', body: match }),
    remove: (id) => request(`/matches/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  },
  enrollments: {
    list: (options) => request('/enrollments', options),
    create: (enrollment) => request('/enrollments', { method: 'POST', body: enrollment }),
    update: (id, enrollment) => request(`/enrollments/${encodeURIComponent(id)}`, { method: 'PATCH', body: enrollment }),
    remove: (id) => request(`/enrollments/${encodeURIComponent(id)}`, { method: 'DELETE' }),
    removeForUser: (userId) => request(`/enrollments/by-user/${encodeURIComponent(userId)}`, { method: 'DELETE' }),
  },
};
