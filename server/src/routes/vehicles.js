import { Router } from 'express';
import { MIN_YEAR } from '../lib/catalog.js';

const label = (f, t) => {
  const levels = t.trimLevels?.length ? ` (${t.trimLevels.join(', ')})` : '';
  const where = [f.generation, f.market].filter(Boolean).join(' · ');
  return `${where} — ${t.name}${levels}`;
};

export function vehicleRouter(repo, currentYear = new Date().getFullYear()) {
  const r = Router();

  r.get('/makes', async (_req, res, next) => {
    try {
      const [makes, models] = await Promise.all([repo.listMakes(), repo.listAllModels()]);
      res.json(
        makes.map((m) => {
          const own = models.filter((x) => x.makeSlug === m.slug);
          return {
            name: m.name, slug: m.slug,
            modelCount: own.length,
            verifiedModelCount: own.filter((x) => x.verified).length,
          };
        })
      );
    } catch (e) { next(e); }
  });

  r.get('/models', async (req, res, next) => {
    try {
      const make = String(req.query.make || '');
      if (!make) return res.status(400).json({ error: 'make is required' });
      const models = await repo.listModels(make);
      res.json(models.map((m) => ({ name: m.name, slug: m.slug, bodyType: m.bodyType, verified: m.verified })));
    } catch (e) { next(e); }
  });

  r.get('/years', async (req, res, next) => {
    try {
      const model = await repo.getModel(String(req.query.make || ''), String(req.query.model || ''));
      if (!model) return res.status(404).json({ error: 'Model not found' });
      if (model.verified) return res.json({ verified: true, years: [...model.years].sort((a, b) => b - a) });
      // No verified data: the user may still state their year, but nothing is claimed about it.
      const years = [];
      for (let y = currentYear; y >= MIN_YEAR; y--) years.push(y);
      res.json({ verified: false, years });
    } catch (e) { next(e); }
  });

  r.get('/trims', async (req, res, next) => {
    try {
      const make = String(req.query.make || '');
      const modelSlug = String(req.query.model || '');
      const year = Number(req.query.year);
      if (!Number.isInteger(year) || year < MIN_YEAR || year > currentYear) {
        return res.status(400).json({ error: `year must be a whole number from ${MIN_YEAR} to ${currentYear}` });
      }
      const model = await repo.getModel(make, modelSlug);
      if (!model) return res.status(404).json({ error: 'Model not found' });
      if (!model.verified) return res.json({ verified: false, options: [] });

      const fitments = (await repo.listFitmentsForModel(make, modelSlug))
        .filter((f) => f.yearFrom <= year && year <= f.yearTo)
        .sort((a, b) => b.yearFrom - a.yearFrom || a.key.localeCompare(b.key));

      const options = [];
      for (const f of fitments) {
        f.trims.forEach((t, trimIndex) => {
          options.push({
            fitmentKey: f.key, trimIndex, label: label(f, t),
            generation: f.generation, market: f.market, trimName: t.name, trimLevels: t.trimLevels || [],
            pcd: f.pcd, hubBore: f.hubBore, source: f.source.name,
          });
        });
      }
      res.json({ verified: true, options });
    } catch (e) { next(e); }
  });

  return r;
}
