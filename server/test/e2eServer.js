// TEST-ONLY server for browser tests without MongoDB. Real Phase 2 routers + engine run
// on the in-memory repo. The Phase 1 /api/products endpoints are replaced by a small stub
// with the same shapes (the real ones need MongoDB).
import express from 'express';
import cors from 'cors';
import { vehicleRouter } from '../src/routes/vehicles.js';
import { fitmentRouter } from '../src/routes/fitment.js';
import { orderRouter } from '../src/routes/orders.js';
import { createMemoryRepo } from './memoryRepo.js';

const repo = createMemoryRepo(new Date().getFullYear());
const app = express();
app.use(cors());
app.use(express.json({ limit: '50kb' }));

const list = (v) => (v ? String(v).split(',').filter(Boolean) : []);
app.get('/api/products/meta/filters', async (_req, res) => {
  const ps = await repo.listProducts();
  const uniq = (f) => [...new Set(ps.flatMap(f))];
  res.json({
    brands: uniq((p) => [p.brand]).sort(), styles: uniq((p) => [p.style]).sort(),
    colors: uniq((p) => p.colors.map((c) => c.name)).sort(),
    diameters: uniq((p) => p.sizes.map((s) => s.diameter)).sort((a, b) => a - b),
    price: { min: Math.min(...ps.map((p) => p.price)), max: Math.max(...ps.map((p) => p.price)) },
  });
});
app.get('/api/products/:slug', async (req, res) => {
  const p = await repo.getProduct(req.params.slug);
  return p ? res.json(p) : res.status(404).json({ error: 'Product not found' });
});
app.get('/api/products', async (req, res) => {
  const { q, tag, sort, minPrice, maxPrice } = req.query;
  let ps = await repo.listProducts();
  const b = list(req.query.brand), s = list(req.query.style), c = list(req.query.color), d = list(req.query.diameter).map(Number);
  ps = ps.filter((p) =>
    (!b.length || b.includes(p.brand)) && (!s.length || s.includes(p.style)) &&
    (!c.length || p.colors.some((x) => c.includes(x.name))) && (!d.length || p.sizes.some((x) => d.includes(x.diameter))) &&
    (!minPrice || p.price >= Number(minPrice)) && (!maxPrice || p.price <= Number(maxPrice)) &&
    (tag !== 'new' || p.isNewArrival) && (tag !== 'bestseller' || p.isBestSeller) &&
    (!q || `${p.name} ${p.brand} ${p.style}`.toLowerCase().includes(String(q).toLowerCase())));
  const by = { newest: (x, y) => y.releasedAt - x.releasedAt, 'price-asc': (x, y) => x.price - y.price, 'price-desc': (x, y) => y.price - x.price, name: (x, y) => x.name.localeCompare(y.name) };
  res.json(ps.sort(by[sort] || by.newest));
});

app.use('/api/vehicles', vehicleRouter(repo));
app.use('/api/fitment', fitmentRouter(repo));
app.use('/api/orders', orderRouter(repo));
app.get('/api/_test/orders', (_req, res) => res.json(repo.orders)); // test inspection only

app.listen(5000, () => console.log('e2e API on :5000'));
