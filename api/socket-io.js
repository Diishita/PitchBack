import { createVercelSocketServer } from '../server/vercel-runtime.js';

const server = await createVercelSocketServer();

export default server;
