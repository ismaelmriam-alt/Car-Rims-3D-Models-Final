import { useEffect, useRef, useState } from 'react';
import { fetchMakes, fetchModels, fetchTrims, fetchYears } from '../api.js';
import { CAR_COLOR_NAMES, CAR_PAINT } from '../vehicleColors.js';

// Make -> Model -> Year -> Trim -> Colour. Every list comes from MongoDB via the API.
// Models without verified data are still selectable but are labelled and handled honestly.
export default function VehicleSelector({ initial, onSubmit, busy }) {
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [years, setYears] = useState([]);
  const [yearsVerified, setYearsVerified] = useState(true);
  const [trims, setTrims] = useState([]);

  const [make, setMake] = useState(initial?.makeSlug || '');
  const [model, setModel] = useState(initial?.modelSlug || '');
  const [year, setYear] = useState(initial?.year ? String(initial.year) : '');
  const [trimKey, setTrimKey] = useState(initial?.fitmentKey ? `${initial.fitmentKey}::${initial.trimIndex}` : '');
  const [color, setColor] = useState(initial?.color || 'black');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState('');
  const seq = useRef(0);

  const guard = async (label, fn) => {
    const id = ++seq.current;
    setLoading(label);
    setError('');
    try {
      const r = await fn();
      return id === seq.current ? r : null;
    } catch (e) {
      if (id === seq.current) setError(e.message);
      return null;
    } finally {
      if (id === seq.current) setLoading('');
    }
  };

  // initial load (and restore a previously chosen vehicle)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const m = await fetchMakes();
        if (!alive) return;
        setMakes(m);
        if (initial?.makeSlug) {
          const mods = await fetchModels(initial.makeSlug);
          if (!alive) return;
          setModels(mods);
          if (initial.modelSlug) {
            const ys = await fetchYears(initial.makeSlug, initial.modelSlug);
            if (!alive) return;
            setYears(ys.years);
            setYearsVerified(ys.verified);
            if (initial.year && ys.verified) {
              const t = await fetchTrims(initial.makeSlug, initial.modelSlug, initial.year);
              if (alive) setTrims(t.options);
            }
          }
        }
      } catch (e) {
        if (alive) setError(`Could not load vehicles: ${e.message}. Is the API running and seeded?`);
      }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetFrom = (level) => {
    if (level <= 1) { setModel(''); setModels([]); }
    if (level <= 2) { setYear(''); setYears([]); }
    if (level <= 3) { setTrimKey(''); setTrims([]); }
  };

  const onMake = async (slug) => {
    setMake(slug); resetFrom(1);
    if (!slug) return;
    const r = await guard('models', () => fetchModels(slug));
    if (r) setModels(r);
  };
  const onModel = async (slug) => {
    setModel(slug); resetFrom(2);
    if (!slug) return;
    const r = await guard('years', () => fetchYears(make, slug));
    if (r) { setYears(r.years); setYearsVerified(r.verified); }
  };
  const onYear = async (y) => {
    setYear(y); resetFrom(3);
    if (!y) return;
    if (!yearsVerified) return;
    const r = await guard('trims', () => fetchTrims(make, model, y));
    if (r) {
      setTrims(r.options);
      if (r.options.length === 1) setTrimKey(`${r.options[0].fitmentKey}::${r.options[0].trimIndex}`);
    }
  };

  const selModel = models.find((m) => m.slug === model);
  const unverified = selModel && !selModel.verified;
  const noTrimsForYear = !!year && yearsVerified && !unverified && trims.length === 0 && !loading;
  const canSubmit = make && model && year && (unverified || trimKey) && !loading && !busy;

  const submit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    const mk = makes.find((m) => m.slug === make);
    const base = { makeSlug: make, modelSlug: model, make: mk.name, model: selModel.name, year: Number(year), color };
    if (unverified) {
      onSubmit({ ...base, unverified: true, label: `${year} ${mk.name} ${selModel.name}` });
    } else {
      const [fitmentKey, ti] = trimKey.split('::');
      const opt = trims.find((t) => t.fitmentKey === fitmentKey && String(t.trimIndex) === ti);
      onSubmit({ ...base, fitmentKey, trimIndex: Number(ti), label: `${year} ${mk.name} ${selModel.name} · ${opt?.label || ''}` });
    }
  };

  return (
    <form className="vsel" onSubmit={submit} aria-label="Vehicle selector">
      <div className="vsel__grid">
        <label>
          <span>01 · Make</span>
          <select value={make} onChange={(e) => onMake(e.target.value)}>
            <option value="">Select make</option>
            {makes.map((m) => <option key={m.slug} value={m.slug}>{m.name}</option>)}
          </select>
        </label>
        <label>
          <span>02 · Model</span>
          <select value={model} onChange={(e) => onModel(e.target.value)} disabled={!make}>
            <option value="">{loading === 'models' ? 'Loading…' : 'Select model'}</option>
            {models.map((m) => (
              <option key={m.slug} value={m.slug}>{m.name}{m.verified ? '' : ' (fitment unverified)'}</option>
            ))}
          </select>
        </label>
        <label>
          <span>03 · Year</span>
          <select value={year} onChange={(e) => onYear(e.target.value)} disabled={!model}>
            <option value="">{loading === 'years' ? 'Loading…' : 'Select year'}</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </label>
        <label className="vsel__trim">
          <span>04 · Trim / version</span>
          <select value={trimKey} onChange={(e) => setTrimKey(e.target.value)} disabled={!year || unverified || trims.length === 0}>
            <option value="">
              {loading === 'trims' ? 'Loading…' : unverified ? 'No verified trims for this model' : 'Select trim'}
            </option>
            {trims.map((t) => (
              <option key={`${t.fitmentKey}::${t.trimIndex}`} value={`${t.fitmentKey}::${t.trimIndex}`}>{t.label}</option>
            ))}
          </select>
        </label>
      </div>

      <fieldset className="vsel__colors">
        <legend>05 · Vehicle colour</legend>
        <div className="swatches big">
          {CAR_COLOR_NAMES.map((c) => (
            <button
              key={c} type="button"
              className={`swatch ${c === color ? 'on' : ''}`} style={{ background: CAR_PAINT[c] }}
              onClick={() => setColor(c)} title={c} aria-label={c} aria-pressed={c === color}
            />
          ))}
          <em className="vsel__colorname">{color}</em>
        </div>
      </fieldset>

      {unverified && year && (
        <p className="notice notice--warn">
          We have no verified fitment data for this model yet, so we cannot say which rims fit. You can still browse the
          catalogue, but compatibility must be verified before ordering.
        </p>
      )}
      {noTrimsForYear && (
        <p className="notice notice--warn">
          No verified fitment records cover a {year} {selModel?.name}. Try another year, or pick a different model.
        </p>
      )}
      {error && <p className="notice notice--err" role="alert">{error}</p>}

      <button className="cta-btn" disabled={!canSubmit}>{busy ? 'LOADING…' : "LET'S FIND YOUR RIMS"}</button>
    </form>
  );
}
