import express from 'express';
import cors from 'cors';
import { productRouter } from './routes/products.js';
import { vehicleRouter } from './routes/vehicles.js';
import { fitmentRouter } from './routes/fitment.js';
import { orderRouter } from './routes/orders.js';

export function createApp(repo, { currentYear } = {}) {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '50kb' }));

  app.get('/api/health', (_req, res) => res.json({ ok: true }));
  app.use('/api/products', productRouter(repo));
  app.use('/api/vehicles', vehicleRouter(repo, currentYear));
  app.use('/api/fitment', fitmentRouter(repo));
  app.use('/api/orders', orderRouter(repo));

  app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    if (err?.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  });
  return app;
}
