import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { createMemoryRepo } from './memoryRepo.js';
import { evaluateSize, RULES } from '../src/lib/fitment.js';
import { parseWheels } from '../src/lib/wheelParse.js';

const repo = createMemoryRepo(2026);
const app = createApp(repo, { currentYear: 2026 });
let base;
let server;
test.before(async () => {
  await new Promise((r) => { server = app.listen(0, r); });
  base = `http://127.0.0.1:${server.address().port}`;
});
test.after(() => server.close());

const get = async (p) => { const r = await fetch(base + p); return { status: r.status, body: await r.json() }; };
const post = async (p, body) => {
  const r = await fetch(base + p, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  return { status: r.status, body: await r.json() };
};

test('product API serves catalog, filters, metadata, and product details', async () => {
  const all = await get('/api/products');
  assert.equal(all.status, 200);
  assert.ok(all.body.length > 0);

  const product = all.body[0];
  const detail = await get(`/api/products/${product.slug}`);
  assert.equal(detail.status, 200);
  assert.equal(detail.body.slug, product.slug);

  const filtered = await get(`/api/products?brand=${encodeURIComponent(product.brand)}&sort=price-asc`);
  assert.ok(filtered.body.length > 0);
  assert.ok(filtered.body.every((p) => p.brand === product.brand));
  assert.ok(filtered.body.every((p, i, rows) => i === 0 || rows[i - 1].price <= p.price));

  const filters = await get('/api/products/meta/filters');
  assert.equal(filters.status, 200);
  assert.ok(filters.body.brands.includes(product.brand));
  assert.ok(filters.body.price.min <= filters.body.price.max);
});

test('verified recommendations explain exact vehicle-specific fitment and select a best match', async () => {
  const makes = await get('/api/vehicles/makes');
  const kia = makes.body.find((m) => m.name === 'Kia');
  const models = await get(`/api/vehicles/models?make=${kia.slug}`);
  const picanto = models.body.find((m) => m.name === 'Picanto');
  const years = await get(`/api/vehicles/years?make=${kia.slug}&model=${picanto.slug}`);
  const year = years.body.years.find((y) => y >= 2017);
  const trims = await get(`/api/vehicles/trims?make=${kia.slug}&model=${picanto.slug}&year=${year}`);
  const trim = trims.body.options[0];
  const result = await get(`/api/fitment/recommend?fitment=${trim.fitmentKey}&trim=${trim.trimIndex}`);

  assert.equal(result.status, 200);
  assert.ok(result.body.topPicks.length > 0);
  assert.equal(result.body.topPicks[0].bestMatch, true);
  for (const product of [...result.body.topPicks, ...result.body.moreRims]) {
    assert.equal(product.fit.compatible, true);
    assert.match(product.recommendationReason, /matches a wheel size listed|within the compatibility tolerance/);
    assert.match(product.recommendationReason, /design|proportions|pattern|profile/i);
    assert.ok(product.fit.matches[0].size);
  }
});

test('unverified showcase vehicles receive distinct design-only suggestions without invented sizes', async () => {
  const cases = [
    ['bmw', 'x3'],
    ['bmw', 'x5'],
    ['bmw', 'x6'],
    ['ferrari', '488'],
    ['porsche', '911'],
    ['mercedes-benz', 'g-class'],
  ];
  const results = await Promise.all(cases.map(async ([make, model]) => {
    const response = await get(`/api/fitment/recommend?make=${make}&model=${model}`);
    assert.equal(response.status, 200);
    assert.equal(response.body.vehicle.status, 'unverified');
    assert.ok(response.body.topPicks.length > 0);
    assert.equal(response.body.topPicks[0].bestMatch, true);
    for (const product of response.body.topPicks) {
      assert.equal(product.fit.compatible, false);
      assert.deepEqual(product.fit.matches, []);
      assert.match(product.recommendationReason, /design suggestion only/i);
      assert.match(product.recommendationReason, /size and compatibility are unverified/i);
    }
    return response.body.topPicks.map((product) => product.slug).join(',');
  }));
  assert.equal(new Set(results).size, cases.length);
});

// ------------------------------------------------------------ data integrity
test('catalogue builds: every fitment has a source URL, years and wheels', () => {
  assert.ok(repo.catalog.fitments.length >= 35);
  for (const f of repo.catalog.fitments) {
    assert.match(f.source.url, /^https:\/\//, f.key);
    assert.equal(f.status, 'verified');
    assert.ok(f.hubBore > 40 && f.hubBore < 90, f.key);
    for (const t of f.trims) assert.ok(t.wheels.length > 0, `${f.key} ${t.name}`);
  }
});

test('unverified models hold NO specs, years or fitments', () => {
  const unverified = repo.catalog.models.filter((m) => !m.verified);
  assert.ok(unverified.length >= 5);
  for (const m of unverified) {
    assert.deepEqual(m.years, []);
    assert.equal(m.fitmentCount, 0);
    assert.ok(!repo.catalog.fitments.some((f) => f.makeSlug === m.makeSlug && f.modelSlug === m.slug));
  }
});

test('requested makes are all present', () => {
  const names = repo.catalog.makes.map((m) => m.name);
  for (const n of ['Kia', 'BMW', 'Mercedes-Benz', 'Audi', 'Toyota', 'Hyundai', 'Volkswagen', 'Honda', 'Nissan']) {
    assert.ok(names.includes(n), n);
  }
});

test('all model years are 2000 or later', () => {
  for (const m of repo.catalog.models) for (const y of m.years) assert.ok(y >= 2000 && y <= 2026);
  const a3 = repo.catalog.models.find((m) => m.slug === 'a3');
  assert.equal(Math.min(...a3.years), 2000); // 8L generation starts 1996 but is clamped
});

test('wheel parser rejects malformed tokens and reads flags', () => {
  assert.throws(() => parseWheels('17x7.5-41'));
  const [w] = parseWheels('17x7.5@41F*');
  assert.deepEqual(w, { diameter: 17, width: 7.5, offset: 41, axle: 'front', oem: true });
  assert.equal(parseWheels('15x6@45')[0].oem, null);
});

// ------------------------------------------------------------------ engine
const picanto = () => repo.catalog.fitments.find((f) => f.key.startsWith('kia-picanto-iii-ja-2017-2022'));

test('engine: bolt pattern mismatch is rejected', () => {
  const f = picanto();
  const r = evaluateSize({ diameter: 15, width: 6, pcd: '5x112', offset: 50, centerBore: 66.6 }, f, f.trims[0]);
  assert.equal(r.ok, false);
  assert.match(r.reason, /bolt pattern/);
});

test('engine: centre bore smaller than hub is rejected', () => {
  const f = picanto();
  const r = evaluateSize({ diameter: 15, width: 6, pcd: '4x100', offset: 50, centerBore: 50 }, f, f.trims[0]);
  assert.equal(r.ok, false);
  assert.match(r.reason, /centre bore/);
});

test('engine: tolerance boundaries are inclusive, just outside is rejected', () => {
  const f = picanto(); // 1.0 MPi has 15x6@51
  const ok = evaluateSize({ diameter: 15, width: 6.5, pcd: '4x100', offset: 48, centerBore: 67.1 }, f, f.trims[0]);
  assert.equal(ok.ok, true);
  const badEt = evaluateSize({ diameter: 15, width: 6, pcd: '4x100', offset: 47, centerBore: 67.1 }, f, f.trims[0]);
  assert.equal(badEt.ok, false);
  const badW = evaluateSize({ diameter: 15, width: 7, pcd: '4x100', offset: 51, centerBore: 67.1 }, f, f.trims[0]);
  assert.equal(badW.ok, false);
  assert.equal(RULES.offsetTolerance, 3);
});

test('engine: oversize centre bore is allowed but flags hub-centric rings', () => {
  const f = picanto();
  const r = evaluateSize({ diameter: 15, width: 6, pcd: '4x100', offset: 50, centerBore: 67.1 }, f, f.trims[0]);
  assert.equal(r.ok, true);
  assert.equal(r.hubRingNeeded, true);
  assert.ok(r.notes.some((n) => /hub-centric/.test(n)));
});

test('engine: diameter not listed for the vehicle is rejected (no 19" on a Picanto)', () => {
  const f = picanto();
  const r = evaluateSize({ diameter: 19, width: 7, pcd: '4x100', offset: 45, centerBore: 67.1 }, f, f.trims[0]);
  assert.equal(r.ok, false);
  assert.match(r.reason, /not a listed wheel diameter/);
});

// -------------------------------------------------------------- vehicle API
test('GET /makes, /models, /years, /trims flow for Kia Picanto 2018', async () => {
  const makes = await get('/api/vehicles/makes');
  assert.equal(makes.status, 200);
  assert.ok(makes.body.find((m) => m.slug === 'kia').verifiedModelCount >= 1);

  const models = await get('/api/vehicles/models?make=kia');
  const pic = models.body.find((m) => m.slug === 'picanto');
  assert.equal(pic.verified, true);
  assert.ok(models.body.find((m) => m.slug === 'rio' && m.verified === false));

  const years = await get('/api/vehicles/years?make=kia&model=picanto');
  assert.equal(years.body.verified, true);
  assert.equal(Math.max(...years.body.years), 2026);
  assert.equal(Math.min(...years.body.years), 2004);

  const trims = await get('/api/vehicles/trims?make=kia&model=picanto&year=2018');
  assert.equal(trims.body.options.length, 3);
  assert.ok(trims.body.options[0].fitmentKey.includes('picanto'));
});

test('overlapping generations both appear (Picanto 2021: JA and JA facelift)', async () => {
  const { body } = await get('/api/vehicles/trims?make=kia&model=picanto&year=2021');
  const gens = new Set(body.options.map((o) => o.generation));
  assert.ok(gens.has('III (JA)') && gens.has('III (JA) Facelift'));
});

test('a year outside verified coverage returns no trims, never invented ones', async () => {
  const { body } = await get('/api/vehicles/trims?make=bmw&model=x1&year=2010');
  assert.deepEqual(body.options, []);
});

test('unverified model: years allowed, trims empty and flagged unverified', async () => {
  const years = await get('/api/vehicles/years?make=kia&model=rio');
  assert.equal(years.body.verified, false);
  const trims = await get('/api/vehicles/trims?make=kia&model=rio&year=2018');
  assert.deepEqual(trims.body, { verified: false, options: [] });
});

test('validation errors: bad year, unknown model', async () => {
  assert.equal((await get('/api/vehicles/trims?make=kia&model=picanto&year=1999')).status, 400);
  assert.equal((await get('/api/vehicles/trims?make=kia&model=picanto&year=abc')).status, 400);
  assert.equal((await get('/api/vehicles/years?make=kia&model=nope')).status, 404);
  assert.equal((await get('/api/vehicles/models')).status, 400);
});

// -------------------------------------------------------- recommendations
async function recommendFor(make, model, year, color = 'black', pick = 0) {
  const { body } = await get(`/api/vehicles/trims?make=${make}&model=${model}&year=${year}`);
  const o = body.options[pick];
  return get(`/api/fitment/recommend?fitment=${encodeURIComponent(o.fitmentKey)}&trim=${o.trimIndex}&color=${color}`);
}

test('Kia Picanto: only 4x100 rims are recommended, each backed by a listed size', async () => {
  const { status, body } = await recommendFor('kia', 'picanto', 2018, 'red');
  assert.equal(status, 200);
  assert.equal(body.vehicle.status, 'verified');
  assert.equal(body.vehicle.pcd, '4x100');
  const all = [...body.topPicks, ...body.moreRims];
  assert.ok(all.length >= 4, 'expected at least 4 compatible rims');
  assert.equal(body.topPicks.length, 2, '4 compatible rims split 2 top picks + 2 more');
  assert.equal(body.moreRims.length, 2);
  // top picks never rank below the "more" rims on style score
  assert.ok(Math.min(...body.topPicks.map((p) => p.styleMatch.score)) >= Math.max(...body.moreRims.map((p) => p.styleMatch.score)));
  for (const p of all) {
    assert.ok(p.fit.compatible);
    for (const m of p.fit.matches) {
      assert.equal(m.size.pcd, '4x100');
      assert.ok(m.size.centerBore >= 54.1);
      assert.ok(body.vehicle.trim.wheels.some((w) => w.diameter === m.size.diameter));
    }
  }
  // stock + incompatible rims land in "others" with a reason
  for (const o of body.others) assert.ok(o.fit.whyNot);
  assert.equal(all.length + body.others.length, 10);
});

test('deep-dish rims are NOT recommended for a Picanto and say why', async () => {
  const { body } = await recommendFor('kia', 'picanto', 2018);
  const deep = body.others.find((p) => p.slug === 'stratos-deep-six');
  assert.ok(deep);
  assert.match(deep.fit.whyNot, /4x100/);
});

test('style colour suggestion follows car colour but never changes compatibility', async () => {
  const red = (await recommendFor('kia', 'picanto', 2018, 'red')).body;
  const black = (await recommendFor('kia', 'picanto', 2018, 'black')).body;
  const ids = (b) => [...b.topPicks, ...b.moreRims].map((p) => p.slug).sort();
  assert.deepEqual(ids(red), ids(black), 'same compatible set regardless of paint colour');
  const row = [...red.topPicks, ...red.moreRims].find((p) => p.slug === 'apex-vortex-10');
  assert.equal(row.colors[row.styleMatch.bestColorIndex].name, 'Gloss Black'); // black wheels on a red car
});

test('BMW 3 Series G20 (5x112) and F30 (5x120) give different compatible sets', async () => {
  const { body: g20 } = await get('/api/vehicles/trims?make=bmw&model=3-series&year=2019');
  const eu = g20.options.find((o) => o.generation.startsWith('VII') && o.market === 'Europe');
  const f30 = g20.options.find((o) => o.generation.startsWith('VI (F30'));
  assert.ok(eu && f30);
  const a = (await get(`/api/fitment/recommend?fitment=${eu.fitmentKey}&trim=${eu.trimIndex}`)).body;
  const b = (await get(`/api/fitment/recommend?fitment=${f30.fitmentKey}&trim=${f30.trimIndex}`)).body;
  assert.equal(a.vehicle.pcd, '5x112');
  assert.equal(b.vehicle.pcd, '5x120');
  for (const p of [...a.topPicks, ...a.moreRims]) assert.ok(p.fit.matches.every((m) => m.size.pcd === '5x112'));
  for (const p of [...b.topPicks, ...b.moreRims]) assert.ok(p.fit.matches.every((m) => m.size.pcd === '5x120'));
});

test('every verified vehicle trim yields a response where recommended rims all pass the engine', async () => {
  let withMatches = 0;
  for (const f of repo.catalog.fitments) {
    for (let t = 0; t < f.trims.length; t++) {
      const { status, body } = await get(`/api/fitment/recommend?fitment=${f.key}&trim=${t}`);
      assert.equal(status, 200, f.key);
      const all = [...body.topPicks, ...body.moreRims];
      if (all.length) withMatches++;
      for (const p of all) for (const m of p.fit.matches) {
        const re = evaluateSize(m.size, f, f.trims[t]);
        assert.ok(re.ok, `${f.key} ${p.slug}`);
      }
    }
  }
  assert.ok(withMatches > 40, `only ${withMatches} trims had matches`);
});

test('unverified vehicle: design suggestions are distinct from fitment claims', async () => {
  const { status, body } = await get('/api/fitment/recommend?make=kia&model=rio&color=blue');
  const products = await repo.listProducts();
  assert.equal(status, 200);
  assert.equal(body.vehicle.status, 'unverified');
  assert.equal(body.topPicks.length, 3);
  assert.equal(body.moreRims.length, 3);
  assert.equal(body.others.length, products.length - 6);
  for (const product of [...body.topPicks, ...body.moreRims, ...body.others]) {
    assert.equal(product.fit.compatible, false);
    assert.deepEqual(product.fit.matches, []);
  }
  assert.match(body.topPicks[0].recommendationReason, /design suggestion only/i);
  assert.match(body.topPicks[0].recommendationReason, /unverified/i);
  assert.match(body.vehicle.message, /verif/i);
});

test('recommend validation', async () => {
  assert.equal((await get('/api/fitment/recommend?make=kia&model=picanto')).status, 400); // verified model needs a trim
  assert.equal((await get('/api/fitment/recommend?fitment=nope&trim=0')).status, 404);
  assert.equal((await get(`/api/fitment/recommend?fitment=${picanto().key}&trim=99`)).status, 404);
  assert.equal((await get(`/api/fitment/recommend?fitment=${picanto().key}&trim=0&color=pink`)).status, 400);
});

test('/check marks sizes per product for a vehicle', async () => {
  const f = picanto();
  const { body } = await get(`/api/fitment/check?fitment=${f.key}&trim=0&product=nightline-spiral-12`);
  assert.equal(body.compatible, true);
  assert.ok(body.sizes.some((s) => s.ok) && body.sizes.some((s) => !s.ok));
  assert.equal((await get(`/api/fitment/check?fitment=${f.key}&trim=0&product=nope`)).status, 404);
});

// ------------------------------------------------------------------ orders
const goodOrder = () => ({
  customer: { fullName: 'Mary Test', phone: '+961 70 123 456', email: 'mary@example.com', address: '12 Hamra Street', city: 'Beirut' },
  paymentMethod: 'cash_on_delivery',
  items: [{ slug: 'apex-vortex-10', color: 'Gunmetal', size: { diameter: 17, width: 7, pcd: '5x114.3', offset: 42 }, qty: 2 }],
});

test('order: valid demo order is saved with SERVER prices', async () => {
  const o = goodOrder();
  o.items[0].unitPrice = 1; // client-supplied price must be ignored
  const { status, body } = await post('/api/orders', o);
  assert.equal(status, 201, JSON.stringify(body));
  assert.match(body.orderNumber, /^RIMS-[0-9A-F]{8}$/);
  assert.equal(body.items[0].unitPrice, 289);
  assert.equal(body.total, 578);
  assert.equal(body.paymentLabel, 'Cash on Delivery');
  assert.equal(body.isDemo, true);
  assert.ok(!('customer' in body) && !JSON.stringify(body).includes('mary@example.com'));
  const saved = repo.orders.at(-1);
  assert.equal(saved.customer.email, 'mary@example.com');
  assert.equal(saved.status, 'pending');
  const fetched = await get(`/api/orders/${body.orderNumber.toLowerCase()}`);
  assert.equal(fetched.status, 200);
  assert.equal(fetched.body.total, 578);
});

test('order: all three payment methods accepted, others rejected', async () => {
  for (const m of ['cash_on_delivery', 'wish', 'bank_transfer']) {
    const o = goodOrder(); o.paymentMethod = m;
    assert.equal((await post('/api/orders', o)).status, 201, m);
  }
  const o = goodOrder(); o.paymentMethod = 'credit_card';
  const r = await post('/api/orders', o);
  assert.equal(r.status, 422);
  assert.ok(r.body.errors.paymentMethod);
});

test('order: customer validation catches each bad field', async () => {
  const o = goodOrder();
  o.customer = { fullName: 'A', phone: '12', email: 'nope', address: 'x', city: '' };
  const r = await post('/api/orders', o);
  assert.equal(r.status, 422);
  assert.deepEqual(Object.keys(r.body.errors.customer).sort(), ['address', 'city', 'email', 'fullName', 'phone']);
});

test('order: invalid quantities, unknown product/colour/size, and stock are rejected', async () => {
  const bad = async (mut) => { const o = goodOrder(); mut(o.items[0]); return post('/api/orders', o); };
  assert.equal((await bad((i) => { i.qty = 0; })).status, 422);
  assert.equal((await bad((i) => { i.qty = 9; })).status, 422);
  assert.equal((await bad((i) => { i.qty = 1.5; })).status, 422);
  assert.equal((await bad((i) => { i.qty = '2'; })).status, 422);
  assert.equal((await bad((i) => { i.slug = 'ghost'; })).status, 422);
  assert.equal((await bad((i) => { i.color = 'Pink'; })).status, 422);
  assert.equal((await bad((i) => { i.size.offset = 99; })).status, 422);
  const stock = repo.catalog && (await repo.getProduct('apex-vortex-10')).sizes.find((s) => s.offset === 42 && s.diameter === 17).stock;
  const over = await bad((i) => { i.qty = Math.min(8, stock + 1); });
  if (stock < 8) assert.equal(over.status, 422);
});

test('order: empty cart and bad JSON are rejected', async () => {
  const o = goodOrder(); o.items = [];
  assert.equal((await post('/api/orders', o)).status, 422);
  const r = await fetch(base + '/api/orders', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{oops' });
  assert.equal(r.status, 400);
  assert.equal((await get('/api/orders/RIMS-00000000')).status, 404);
});

// Regression: the style suggestion must never overwrite the rim's own `style` (e.g. "Sport").
test('recommendation rows keep product.style a string and expose styleMatch separately', async () => {
  const names = new Set(['Multi-Spoke', 'Mesh', 'Split-Spoke', 'Deep Dish', 'Sport']);
  for (const [make, model, year] of [['kia', 'picanto', 2018], ['bmw', '3-series', 2019]]) {
    const { body } = await recommendFor(make, model, year);
    for (const p of [...body.topPicks, ...body.moreRims, ...body.others]) {
      assert.equal(typeof p.style, 'string', p.slug);
      assert.ok(names.has(p.style), `${p.slug} style=${p.style}`);
      assert.equal(typeof p.styleMatch, 'object', p.slug);
      assert.ok(Array.isArray(p.styleMatch.notes));
    }
  }
  const unv = (await get('/api/fitment/recommend?make=kia&model=rio')).body;
  for (const p of unv.others) assert.equal(typeof p.style, 'string');
});
