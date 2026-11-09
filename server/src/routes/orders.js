import { Router } from 'express';
import { buildOrder, publicOrder } from '../lib/orders.js';

export function orderRouter(repo) {
  const r = Router();

  // Demo checkout: validates everything server-side, saves a demo order. No payment is taken.
  r.post('/', async (req, res, next) => {
    try {
      const { order, errors } = await buildOrder(req.body, (slug) => repo.getProduct(slug));
      if (errors) return res.status(422).json({ error: 'Please fix the highlighted problems.', errors });
      const saved = await repo.createOrder(order);
      res.status(201).json(publicOrder(saved));
    } catch (e) { next(e); }
  });

  r.get('/:orderNumber', async (req, res, next) => {
    try {
      const order = await repo.getOrder(String(req.params.orderNumber).toUpperCase());
      if (!order) return res.status(404).json({ error: 'Order not found' });
      res.json(publicOrder(order));
    } catch (e) { next(e); }
  });

  return r;
}
