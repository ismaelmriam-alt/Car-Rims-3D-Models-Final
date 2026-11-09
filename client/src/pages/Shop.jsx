import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { fetchFilters, fetchProducts, fetchRecommendations } from '../api.js';
import ProductCard from '../components/ProductCard.jsx';
import { useStore } from '../context/Store.jsx';

const csv = (v) => (v ? v.split(',').filter(Boolean) : []);

function Group({ title, children }) {
  return (
    <fieldset className="fgroup">
      <legend>{title}</legend>
      {children}
    </fieldset>
  );
}

export default function Shop() {
  const [sp, setSp] = useSearchParams();
  const [meta, setMeta] = useState(null);
  const [products, setProducts] = useState(null);
  const [error, setError] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const { vehicle } = useStore();
  const [fitMap, setFitMap] = useState(null); // slug -> fit info for the chosen vehicle (verified vehicles only)
  const [onlyFit, setOnlyFit] = useState(false);

  // optional vehicle awareness: which rims are verified for the vehicle picked on Find Your Fitment
  useEffect(() => {
    setFitMap(null);
    if (!vehicle?.fitmentKey) return undefined;
    let alive = true;
    fetchRecommendations(vehicle, vehicle.color || 'black')
      .then((r) => {
        if (!alive) return;
        const m = {};
        [...r.topPicks, ...r.moreRims].forEach((p) => { m[p.slug] = p.fit; });
        setFitMap(m);
      })
      .catch(() => alive && setFitMap(null));
    return () => { alive = false; };
  }, [vehicle]);

  const f = useMemo(
    () => ({
      q: sp.get('q') || '',
      tag: sp.get('tag') || '',
      brand: csv(sp.get('brand')),
      style: csv(sp.get('style')),
      color: csv(sp.get('color')),
      diameter: csv(sp.get('diameter')),
      minPrice: sp.get('minPrice') || '',
      maxPrice: sp.get('maxPrice') || '',
      sort: sp.get('sort') || 'newest',
    }),
    [sp]
  );

  useEffect(() => { fetchFilters().then(setMeta).catch(() => setError(true)); }, []);
  useEffect(() => {
    setProducts(null);
    fetchProducts(f).then(setProducts).catch(() => setError(true));
  }, [f]);

  const update = (patch) => {
    const next = { ...f, ...patch };
    const p = new URLSearchParams();
    Object.entries(next).forEach(([k, v]) => {
      const val = Array.isArray(v) ? v.join(',') : v;
      if (val && !(k === 'sort' && val === 'newest')) p.set(k, val);
    });
    setSp(p, { replace: true });
  };
  const toggle = (key, val) =>
    update({ [key]: f[key].includes(val) ? f[key].filter((x) => x !== val) : [...f[key], val] });

  const shown = (products || []).filter((p) => !(onlyFit && fitMap) || fitMap[p.slug]);
  const active = f.brand.length + f.style.length + f.color.length + f.diameter.length + (f.minPrice || f.maxPrice ? 1 : 0);
  const title = f.tag === 'new' ? 'NEW ARRIVALS' : f.tag === 'bestseller' ? 'BEST SELLERS' : 'SHOP ALL RIMS';

  const Check = ({ k, v, label }) => (
    <label className="check">
      <input type="checkbox" checked={f[k].includes(String(v))} onChange={() => toggle(k, String(v))} />
      <span>{label ?? v}</span>
    </label>
  );

  return (
    <section className="section shop">
      <div className="section__head">
        <h2>{title.split(' ').slice(0, -1).join(' ')} <em>{title.split(' ').slice(-1)}</em></h2>
        <div className="shop__tabs">
          {[['', 'All'], ['new', 'New Arrivals'], ['bestseller', 'Best Sellers']].map(([t, l]) => (
            <button key={t} className={f.tag === t ? 'on' : ''} onClick={() => update({ tag: t })}>{l}</button>
          ))}
        </div>
      </div>
      {f.q && (
        <p className="muted">Results for “{f.q}” <button className="link-red" onClick={() => update({ q: '' })}>clear</button></p>
      )}

      {vehicle && (
        <div className="notice shop__vehicle">
          <span>
            Your vehicle: <b>{vehicle.label}</b>.{' '}
            {vehicle.fitmentKey
              ? fitMap
                ? `${Object.keys(fitMap).length} rims are verified compatible.`
                : 'Checking compatibility…'
              : 'No verified fitment data for it yet.'}
          </span>
          {fitMap && (
            <label className="check">
              <input type="checkbox" checked={onlyFit} onChange={(e) => setOnlyFit(e.target.checked)} />
              <span>Only rims verified for my vehicle</span>
            </label>
          )}
          <Link to="/fitment" className="link-red">Change</Link>
        </div>
      )}

      <div className="shop__bar">
        <button className="btn-ghost filters-toggle" onClick={() => setShowFilters((s) => !s)}>
          Filters{active ? ` (${active})` : ''}
        </button>
        <span className="muted">{products ? `${shown.length} rims` : 'Loading…'}</span>
        <label className="sort">
          Sort
          <select value={f.sort} onChange={(e) => update({ sort: e.target.value })}>
            <option value="newest">Newest arrivals</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="name">Name</option>
          </select>
        </label>
      </div>

      <div className="shop__layout">
        <aside className={`filters ${showFilters ? 'open' : ''}`}>
          {meta && (
            <>
              <Group title="Brand">{meta.brands.map((b) => <Check key={b} k="brand" v={b} />)}</Group>
              <Group title="Style">{meta.styles.map((s) => <Check key={s} k="style" v={s} />)}</Group>
              <Group title="Colour">{meta.colors.map((c) => <Check key={c} k="color" v={c} />)}</Group>
              <Group title="Diameter">{meta.diameters.map((d) => <Check key={d} k="diameter" v={d} label={`${d}"`} />)}</Group>
              <Group title="Price per wheel ($)">
                <div className="range">
                  <input type="number" min="0" placeholder={meta.price.min} value={f.minPrice} onChange={(e) => update({ minPrice: e.target.value })} aria-label="Minimum price" />
                  <span>—</span>
                  <input type="number" min="0" placeholder={meta.price.max} value={f.maxPrice} onChange={(e) => update({ maxPrice: e.target.value })} aria-label="Maximum price" />
                </div>
              </Group>
              {active > 0 && (
                <button className="btn-ghost" onClick={() => update({ brand: [], style: [], color: [], diameter: [], minPrice: '', maxPrice: '' })}>
                  Reset filters
                </button>
              )}
            </>
          )}
        </aside>

        <div className="shop__results">
          {error && <div className="empty"><h3>Could not load rims</h3><p>Check that the API and MongoDB are running, and that you ran the seed script.</p></div>}
          {!error && products === null && (
            <div className="grid">{[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="pcard skeleton" />)}</div>
          )}
          {products && shown.length === 0 && (
            <div className="empty"><h3>No rims match</h3><p>Try removing a filter or searching for something else.</p></div>
          )}
          {products && shown.length > 0 && (
            <div className="grid">
              {shown.map((p) => <ProductCard key={p.slug} product={p} fit={fitMap?.[p.slug]} />)}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
