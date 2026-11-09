import { Router } from 'express';
import { CAR_COLORS, RULES, evaluateSize, recommend, recommendUnverified, rulesText } from '../lib/fitment.js';

async function resolveTrim(repo, query) {
  const key = String(query.fitment || '');
  const trimIndex = Number(query.trim);
  if (!key || !Number.isInteger(trimIndex) || trimIndex < 0) return { status: 400, error: 'fitment and trim are required' };
  const fitment = await repo.getFitment(key);
  if (!fitment) return { status: 404, error: 'Fitment record not found' };
  const trim = fitment.trims[trimIndex];
  if (!trim) return { status: 404, error: 'Trim not found' };
  return { fitment, trim, trimIndex };
}

export function fitmentRouter(repo) {
  const r = Router();

  r.get('/rules', (_req, res) => res.json({ rules: RULES, text: rulesText() }));

  // Recommendations for a verified vehicle trim, or an honest "unverified" answer.
  r.get('/recommend', async (req, res, next) => {
    try {
      const color = String(req.query.color || 'black').toLowerCase();
      if (!CAR_COLORS.includes(color)) return res.status(400).json({ error: `color must be one of ${CAR_COLORS.join(', ')}` });
      const products = await repo.listProducts();

      // Unverified path: make + model only.
      if (!req.query.fitment) {
        const model = await repo.getModel(String(req.query.make || ''), String(req.query.model || ''));
        if (!model) return res.status(404).json({ error: 'Model not found' });
        if (model.verified) return res.status(400).json({ error: 'Choose a year and trim for this model.' });
        const suggestions = recommendUnverified({
          products,
          color,
          make: model.make,
          model: model.name,
          bodyType: model.bodyType,
        });
        return res.json({
          vehicle: {
            status: 'unverified', make: model.make, model: model.name, bodyType: model.bodyType, color,
            message: 'We do not have verified fitment data for this vehicle yet. Compatibility must be verified before ordering.',
          },
          rules: rulesText(),
          ...suggestions,
        });
      }

      const t = await resolveTrim(repo, req.query);
      if (t.error) return res.status(t.status).json({ error: t.error });
      const model = await repo.getModel(t.fitment.makeSlug, t.fitment.modelSlug);
      const bodyType = model?.bodyType || 'sedan';

      const { topPicks, moreRims, others } = recommend({
        products, fitment: t.fitment, trim: t.trim, color, bodyType,
        make: t.fitment.make, model: t.fitment.model,
      });

      res.json({
        vehicle: {
          status: 'verified', key: t.fitment.key, trimIndex: t.trimIndex,
          make: t.fitment.make, model: t.fitment.model, generation: t.fitment.generation, market: t.fitment.market,
          yearFrom: t.fitment.yearFrom, yearTo: t.fitment.yearTo, bodyType, color,
          pcd: t.fitment.pcd, hubBore: t.fitment.hubBore,
          trim: t.trim, source: t.fitment.source,
        },
        rules: rulesText(),
        topPicks, moreRims, others,
      });
    } catch (e) { next(e); }
  });

  // Per-size compatibility of one product for a verified vehicle trim (used on product pages).
  r.get('/check', async (req, res, next) => {
    try {
      const t = await resolveTrim(repo, req.query);
      if (t.error) return res.status(t.status).json({ error: t.error });
      const product = await repo.getProduct(String(req.query.product || ''));
      if (!product) return res.status(404).json({ error: 'Product not found' });
      const sizes = product.sizes.map((size, sizeIndex) => {
        const e = evaluateSize(size, t.fitment, t.trim);
        return e.ok
          ? { sizeIndex, ok: true, notes: e.notes, hubRingNeeded: e.hubRingNeeded }
          : { sizeIndex, ok: false, reason: e.reason };
      });
      res.json({ status: 'verified', rules: rulesText(), sizes, compatible: sizes.some((s) => s.ok) });
    } catch (e) { next(e); }
  });

  return r;
}
