// Parses the compact wheel tokens used in data/vehicles.js, e.g. "17x7.5@41F*"
// and turns raw vehicle records into normalised fitment documents.
import { slugify } from './slug.js';

const TOKEN = /^(\d{2}(?:\.\d)?)x(\d{1,2}(?:\.\d)?)@(\d{1,3}(?:\.\d)?)([FR])?(\*)?$/;

export function parseWheels(str, context = '') {
  return str
    .trim()
    .split(/\s+/)
    .map((tok) => {
      const m = TOKEN.exec(tok);
      if (!m) throw new Error(`Bad wheel token "${tok}" ${context}`);
      const wheel = { diameter: Number(m[1]), width: Number(m[2]), offset: Number(m[3]) };
      if (m[4]) wheel.axle = m[4] === 'F' ? 'front' : 'rear';
      // oem: true only when the source marks it OEM; otherwise null = "source does not say"
      wheel.oem = m[5] ? true : null;
      return wheel;
    });
}

export function fitmentKey(f) {
  const market = f.market ? slugify(f.market) : 'std';
  return [slugify(f.make), slugify(f.model), slugify(f.generation), f.yearFrom, f.yearTo, market].join('-');
}

export function buildFitment(raw) {
  const key = fitmentKey(raw);
  return {
    key,
    make: raw.make,
    makeSlug: slugify(raw.make),
    model: raw.model,
    modelSlug: slugify(raw.model),
    generation: raw.generation,
    market: raw.market || null,
    yearFrom: raw.yearFrom,
    yearTo: raw.yearTo,
    pcd: raw.pcd,
    hubBore: raw.hubBore,
    status: 'verified',
    source: raw.source,
    trims: raw.trims.map((t) => ({
      name: t.name,
      trimLevels: t.trimLevels || [],
      wheels: parseWheels(t.wheels, `(${key} / ${t.name})`),
    })),
  };
}
