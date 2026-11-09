import { products } from './data/products.js';
import { buildCatalog } from './lib/catalog.js';

export function createMemoryRepo(currentYear = new Date().getFullYear()) {
  const catalog = buildCatalog(currentYear);
  const prods = products.map((p) => ({ ...p, releasedAt: new Date(p.releasedAt) }));
  const orders = [];
  const clone = (x) => structuredClone(x);
  return {
    orders,
    catalog,
    listMakes: async () => clone(catalog.makes),
    listAllModels: async () => clone(catalog.models),
    listModels: async (s) => clone(catalog.models.filter((m) => m.makeSlug === s).sort((a, b) => a.name.localeCompare(b.name))),
    getModel: async (ms, s) => clone(catalog.models.find((m) => m.makeSlug === ms && m.slug === s) || null),
    listFitmentsForModel: async (ms, s) => clone(catalog.fitments.filter((f) => f.makeSlug === ms && f.modelSlug === s)),
    getFitment: async (key) => clone(catalog.fitments.find((f) => f.key === key) || null),
    listProducts: async () => clone(prods),
    getProduct: async (slug) => clone(prods.find((p) => p.slug === slug) || null),
    createOrder: async (doc) => {
      const saved = { ...clone(doc), createdAt: new Date() };
      orders.push(saved);
      return clone(saved);
    },
    getOrder: async (n) => clone(orders.find((o) => o.orderNumber === n) || null),
  };
}
