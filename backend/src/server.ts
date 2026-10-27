import { createApp } from './app.js';
import { env } from './config/env.js';
import { installProcessGuards } from './lib/processGuards.js';

installProcessGuards();

const app = createApp();

export default app;

if (process.env.VERCEL === undefined) {
  app.listen(env.port, () => {
    console.log(`backend listening on http://localhost:${env.port}`);
  });
}
