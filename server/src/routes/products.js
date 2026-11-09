import { Router } from 'express';

const list = (v) => (v ? String(v).split(',').filter(Boolean) : []);

export function productRouter(repo) {
  const router = Router();

  router.get('/', async (req, res, next) => {
    try {
      const { q, minPrice, maxPrice, tag, sort } = req.query;
      const brands = list(req.query.brand);
      const styles = list(req.query.style);
      const colors = list(req.query.color);
      const diameters = list(req.query.diameter).map(Number).filter(Boolean);
      const query = String(q || '').trim().toLowerCase();
      const products = (await repo.listProducts()).filter((p) =>
        (!brands.length || brands.includes(p.brand)) &&
        (!styles.length || styles.includes(p.style)) &&
        (!colors.length || p.colors.some((c) => colors.includes(c.name))) &&
        (!diameters.length || p.sizes.some((s) => diameters.includes(s.diameter))) &&
        (!minPrice || p.price >= Number(minPrice)) &&
        (!maxPrice || p.price <= Number(maxPrice)) &&
        (tag !== 'new' || p.isNewArrival) &&
        (tag !== 'bestseller' || p.isBestSeller) &&
        (!query || `${p.name} ${p.brand} ${p.style} ${p.colors.map((c) => c.name).join(' ')}`.toLowerCase().includes(query))
      );
      const by = {
        newest: (a, b) => new Date(b.releasedAt) - new Date(a.releasedAt),
        'price-asc': (a, b) => a.price - b.price,
        'price-desc': (a, b) => b.price - a.price,
        name: (a, b) => a.name.localeCompare(b.name),
      };
      res.json(products.sort(by[sort] || by.newest));
    } catch (e) {
      next(e);
    }
  });

  router.get('/meta/filters', async (_req, res, next) => {
    try {
      const products = await repo.listProducts();
      const unique = (values) => [...new Set(values)].sort();
      res.json({
        brands: unique(products.map((p) => p.brand)),
        styles: unique(products.map((p) => p.style)),
        colors: unique(products.flatMap((p) => p.colors.map((c) => c.name))),
        diameters: unique(products.flatMap((p) => p.sizes.map((s) => s.diameter))).sort((a, b) => a - b),
        price: products.length
          ? { min: Math.min(...products.map((p) => p.price)), max: Math.max(...products.map((p) => p.price)) }
          : { min: 0, max: 0 },
      });
    } catch (e) {
      next(e);
    }
  });

  router.get('/:slug', async (req, res, next) => {
    try {
      const product = await repo.getProduct(req.params.slug);
      if (!product) return res.status(404).json({ error: 'Product not found' });
      res.json(product);
    } catch (e) {
      next(e);
    }
  });

  return router;
}
