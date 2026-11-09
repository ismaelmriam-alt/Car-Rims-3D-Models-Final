// Builds the vehicle catalogue (makes, models, fitments) from the raw data files
// and validates it, so a typo in the data fails loudly at seed time.
import { FITMENTS, MODELS, UNVERIFIED_MODELS } from '../data/vehicles.js';
import { buildFitment } from './wheelParse.js';
import { slugify } from './slug.js';

export const MIN_YEAR = 2000;

export function buildCatalog(currentYear = new Date().getFullYear()) {
  const fitments = FITMENTS.map(buildFitment);

  const seen = new Set();
  for (const f of fitments) {
    if (seen.has(f.key)) throw new Error(`Duplicate fitment key ${f.key}`);
    seen.add(f.key);
    if (!f.source?.url?.startsWith('https://')) throw new Error(`Fitment ${f.key} has no source URL`);
    if (f.yearFrom > f.yearTo) throw new Error(`Fitment ${f.key} has inverted years`);
  }

  const verifiedModels = MODELS.map((m) => ({ ...m, verified: true }));
  const unverifiedModels = UNVERIFIED_MODELS.map((m) => ({ ...m, verified: false }));

  const models = [...verifiedModels, ...unverifiedModels].map((m) => {
    const makeSlug = slugify(m.make);
    const slug = slugify(m.model);
    const own = fitments.filter((f) => f.makeSlug === makeSlug && f.modelSlug === slug);
    if (m.verified && !own.length) throw new Error(`Model ${m.make} ${m.model} has no fitments`);
    if (!m.verified && own.length) throw new Error(`Model ${m.make} ${m.model} is marked unverified but has fitments`);
    const years = new Set();
    for (const f of own) {
      for (let y = Math.max(f.yearFrom, MIN_YEAR); y <= Math.min(f.yearTo, currentYear); y++) years.add(y);
    }
    return {
      make: m.make, makeSlug, name: m.model, slug, bodyType: m.bodyType,
      verified: own.length > 0,
      years: [...years].sort((a, b) => a - b),
      fitmentCount: own.length,
    };
  });

  for (const f of fitments) {
    if (!models.some((m) => m.makeSlug === f.makeSlug && m.slug === f.modelSlug)) {
      throw new Error(`Fitment ${f.key} has no matching model`);
    }
  }

  const makes = [...new Map(models.map((m) => [m.makeSlug, { name: m.make, slug: m.makeSlug }])).values()].sort(
    (a, b) => a.name.localeCompare(b.name)
  );

  return { makes, models, fitments };
}
