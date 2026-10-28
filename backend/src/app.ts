import express from 'express';
import cors from 'cors';
import { connectDb } from './config/db.js';
import { routes } from './routes/index.js';
import { errorHandler } from './middleware/error-handler.js';
import { notFound } from './middleware/not-found.js';

export function createApp() {
  const app = express();

  app.set('trust proxy', true);
  app.use(cors());
  app.use(
    ['/api/workspaces/:workspaceId/invoices/:id/email', '/api/workspaces/:workspaceId/quotations/:id/email'],
    express.json({ limit: '8mb' })
  );
  app.use('/api/workspaces/:workspaceId/orbit/draft', express.json({ limit: '5mb' }));
  app.use(
    ['/api/workspaces/:workspaceId/invoices', '/api/workspaces/:workspaceId/quotations'],
    express.json({ limit: '4mb' })
  );
  app.use(express.json({ limit: '2mb' }));

  app.use((_req, _res, next) => {
    connectDb().then(
      () => next(),
      (error) => next(error)
    );
  });

  app.use('/api', routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
