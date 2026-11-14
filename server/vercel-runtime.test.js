import assert from 'node:assert/strict';
import test from 'node:test';
import handler from '../api/[...path].js';

test('Vercel API returns JSON when required deployment configuration is missing', async (t) => {
  const previous = {
    mongodbUri: process.env.MONGODB_URI,
    sessionSecret: process.env.SESSION_SECRET,
    frontendOrigins: process.env.FRONTEND_ORIGINS,
    vercelUrl: process.env.VERCEL_URL,
    productionUrl: process.env.VERCEL_PROJECT_PRODUCTION_URL,
  };
  delete process.env.MONGODB_URI;
  process.env.SESSION_SECRET = 'test-secret-'.repeat(4);
  process.env.FRONTEND_ORIGINS = 'https://pitchback.vercel.app';
  delete process.env.VERCEL_URL;
  delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
  t.after(() => {
    if (previous.mongodbUri === undefined) delete process.env.MONGODB_URI;
    else process.env.MONGODB_URI = previous.mongodbUri;
    if (previous.sessionSecret === undefined) delete process.env.SESSION_SECRET;
    else process.env.SESSION_SECRET = previous.sessionSecret;
    if (previous.frontendOrigins === undefined) delete process.env.FRONTEND_ORIGINS;
    else process.env.FRONTEND_ORIGINS = previous.frontendOrigins;
    if (previous.vercelUrl === undefined) delete process.env.VERCEL_URL;
    else process.env.VERCEL_URL = previous.vercelUrl;
    if (previous.productionUrl === undefined) delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
    else process.env.VERCEL_PROJECT_PRODUCTION_URL = previous.productionUrl;
  });

  const response = {
    headers: {},
    statusCode: 200,
    setHeader(name, value) {
      this.headers[name] = value;
    },
    end(body) {
      this.body = body;
    },
  };
  await handler({ method: 'GET', url: '/api/health' }, response);

  assert.equal(response.statusCode, 503);
  assert.match(response.headers['Content-Type'], /application\/json/);
  assert.equal(JSON.parse(response.body).error.code, 'SERVICE_UNAVAILABLE');
});
