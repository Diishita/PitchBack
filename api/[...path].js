import { createVercelApiApp } from '../server/vercel-runtime.js';

let appPromise;

const getApp = () => {
  if (!appPromise) {
    appPromise = createVercelApiApp().catch((error) => {
      appPromise = undefined;
      throw error;
    });
  }
  return appPromise;
};

export default async function handler(request, response) {
  try {
    const app = await getApp();
    app(request, response);
  } catch (error) {
    console.error('[Vercel API] Could not initialize:', error.message);
    if (response.headersSent) return;

    response.statusCode = 503;
    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    response.end(JSON.stringify({
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'API unavailable. Check its environment variables and MongoDB connection.',
      },
    }));
  }
}
