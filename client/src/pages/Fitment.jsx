import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import VehicleSelector from '../components/VehicleSelector.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { fetchRecommendations } from '../api.js';
import { useStore } from '../context/Store.jsx';
import { CAR_COLOR_NAMES, CAR_PAINT } from '../vehicleColors.js';

// three.js is only downloaded when someone opens this page.
const Car3D = lazy(() => import('../components/Car3D.jsx'));
const VIEW_NAMES = ['3/4', 'Front', 'Side', 'Rear', 'Top', 'Wheel'];

export default function Fitment() {
  const { vehicle, setVehicle } = useStore();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(!vehicle);
  const [color, setColor] = useState(vehicle?.color || 'black');
  const [preview, setPreview] = useState({ hex: '#9a9da5', style: 'Sport', name: null });
  const [view, setView] = useState('3/4');
  const [auto, setAuto] = useState(true);
  const stage = useRef(null);
  const req = useRef(0);

  const load = useCallback(async (v, c) => {
    const id = ++req.current;
    setResult(null);
    setLoading(true);
    setError('');
    try {
      const data = await fetchRecommendations(v, c);
      if (id === req.current) setResult(data);
    } catch (e) {
      if (id === req.current) setError(e.message);
    } finally {
      if (id === req.current) setLoading(false);
    }
  }, []);

  // restore the previously chosen vehicle after a refresh
  useEffect(() => {
    if (vehicle) load(vehicle, vehicle.color || 'black');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = (v) => {
    setVehicle(v);
    setColor(v.color);
    setEditing(false);
    setPreview({ hex: '#9a9da5', style: 'Sport', name: null });
    load(v, v.color);
  };

  const changeColor = (c) => {
    setColor(c);
    if (vehicle) {
      setVehicle({ ...vehicle, color: c });
      load({ ...vehicle, color: c }, c);
    }
  };

  const onPreview = (product, c) => {
    setPreview({ hex: c.hex, style: product.style, name: `${product.name} · ${c.name}` });
    stage.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const v = result?.vehicle;
  const verified = v?.status === 'verified';
  const top = result?.topPicks || [];
  const more = result?.moreRims || [];
  const others = result?.others || [];

  return (
    <section className="section fitment">
      <div className="section__head">
        <h2>FIND YOUR <em>FITMENT</em></h2>
        {result && !editing && (
          <button className="btn-ghost" onClick={() => setEditing(true)}>CHANGE VEHICLE</button>
        )}
      </div>

      {(editing || !result) && (
        <div className="fitment__panel">
          <p className="muted">
            Pick your car and we match rims against stored wheel specs: bolt pattern, diameter, width, offset and centre bore.
            Vehicles without verified data are clearly marked.
          </p>
          <VehicleSelector initial={vehicle} onSubmit={submit} busy={loading} />
        </div>
      )}

      {error && <p className="notice notice--err" role="alert">{error}</p>}
      {loading && !result && <div className="skeleton" style={{ height: 420, marginTop: 24 }} />}

      {result && !editing && (
        <>
          <div className="fitment__stage" ref={stage}>
            <div className="car3d">
              <Suspense fallback={<div className="car3d__fallback"><p>Loading 3D viewer…</p></div>}>
                <Car3D
                  vehicle={vehicle}
                  bodyType={v.bodyType} color={color} rimColor={preview.hex} rimStyle={preview.style}
                  autoRotate={auto} view={view}
                />
              </Suspense>
              <div className="car3d__bar">
                {VIEW_NAMES.map((n) => (
                  <button key={n} className={view === n ? 'on' : ''} onClick={() => setView(n)}>{n}</button>
                ))}
                <button className={auto ? 'on' : ''} onClick={() => setAuto((a) => !a)} aria-pressed={auto}>
                  {auto ? 'Auto-rotate: on' : 'Auto-rotate: off'}
                </button>
              </div>
              <p className="car3d__hint">Drag to rotate · scroll to zoom · unbranded 3D body-style preview; not an OEM replica</p>
            </div>

            <aside className="vinfo">
              <span className={`badge-status ${verified ? 'ok' : 'warn'}`}>
                {verified ? 'VERIFIED FITMENT DATA' : 'FITMENT NOT VERIFIED'}
              </span>
              <h3>{vehicle?.label || `${v.make} ${v.model}`}</h3>

              <div className="swatches" role="group" aria-label="Vehicle colour">
                {CAR_COLOR_NAMES.map((c) => (
                  <button
                    key={c} className={`swatch ${c === color ? 'on' : ''}`} style={{ background: CAR_PAINT[c] }}
                    onClick={() => changeColor(c)} title={c} aria-label={`Paint ${c}`} aria-pressed={c === color}
                  />
                ))}
              </div>
              {preview.name && (
                <p className="muted small">Previewing <b>{preview.name}</b> on the car (wheels stay static).</p>
              )}

              {verified ? (
                <>
                  <table className="specs">
                    <caption>Vehicle wheel specs</caption>
                    <tbody>
                      <tr><th>Bolt pattern (PCD)</th><td>{v.pcd}</td></tr>
                      <tr><th>Centre bore (hub)</th><td>{v.hubBore} mm</td></tr>
                      <tr><th>Generation</th><td>{v.generation}{v.market ? ` · ${v.market}` : ''}</td></tr>
                      <tr><th>Trim</th><td>{v.trim.name}</td></tr>
                    </tbody>
                  </table>
                  <div className="wheelchips" aria-label="Wheel sizes listed for this trim">
                    <small>Listed wheel sizes</small>
                    {v.trim.wheels.map((w, i) => (
                      <span key={i} className={w.oem ? 'oem' : ''} title={w.oem ? 'Marked OEM by the source' : 'Listed by the source'}>
                        {w.diameter}x{w.width} ET{w.offset}{w.axle ? ` ${w.axle === 'front' ? 'F' : 'R'}` : ''}{w.oem ? ' · OEM' : ''}
                      </span>
                    ))}
                  </div>
                  <p className="muted small">
                    Source: <a className="link-red" href={v.source.url} target="_blank" rel="noreferrer">{v.source.name}</a>
                    {' '}(retrieved {v.source.retrieved}). Always confirm before ordering.
                  </p>
                </>
              ) : (
                <p className="notice notice--warn">{v.message}</p>
              )}
            </aside>
          </div>

          {verified && (
            <details className="rules">
              <summary>How we check compatibility</summary>
              <p>{result.rules}</p>
              <p>
                <b>Style suggestions</b> (paint-colour pairing and body-style fit) only change the order of rims and the
                preselected colour. They never decide whether a rim fits.
              </p>
            </details>
          )}

          {top.length > 0 && (
            <section className="recs">
              <div className="section__head">
                <h2>{verified ? <>OUR TOP <em>PICKS</em></> : <>PERSONALIZED <em>DESIGN MATCHES</em></>}</h2>
              </div>
              <p className="muted">
                {verified
                  ? `Every pick below passed the selected trim's verified fitment checks, then ranked by design for your ${vehicle?.label || `${v.make} ${v.model}`}.`
                  : `These are design suggestions for your ${vehicle?.label || `${v.make} ${v.model}`} only. Rim sizes and vehicle compatibility are not verified; confirm specifications before ordering.`}
              </p>
              <div className="grid">
                {top.map((p) => (
                  <ProductCard key={p.slug} product={p} fit={p.fit} styleHint={p.styleMatch} onPreview={onPreview} bestMatch={p.bestMatch} notVerified={!verified} />
                ))}
              </div>
            </section>
          )}

          {more.length > 0 && (
            <section className="recs">
              <div className="section__head"><h2>{verified ? <>MORE RIMS TO <em>EXPLORE</em></> : <>ALTERNATIVE <em>DESIGNS</em></>}</h2></div>
              <p className="muted">
                {verified
                  ? 'Alternative designs that also match the selected trim’s verified specifications.'
                  : 'More design options only; fitment and suitable rim sizes remain unverified.'}
              </p>
              <div className="grid">
                {more.map((p) => (
                  <ProductCard key={p.slug} product={p} fit={p.fit} styleHint={p.styleMatch} onPreview={onPreview} notVerified={!verified} />
                ))}
              </div>
            </section>
          )}

          {verified && top.length + more.length === 0 && (
            <div className="empty empty--inline">
              <h3>NO MATCH IN THE CURRENT CATALOGUE</h3>
              <p>
                None of our rims match this trim's verified wheel specs (bolt pattern, diameter, width and offset).
                We will not suggest rims that might not fit.
              </p>
            </div>
          )}

          {!verified && (
            <div className="empty empty--inline">
              <h3>BROWSE WITH CARE</h3>
              <p>
                Because this vehicle's fitment is unverified we cannot recommend rims. Check bolt pattern, offset and centre
                bore on each product page against your owner's manual.
              </p>
            </div>
          )}

          <details className="recs recs--rest" open={!verified}>
            <summary>
              {verified ? `THE REST OF THE CATALOGUE (${others.length}) — NOT VERIFIED FOR THIS VEHICLE` : `OTHER DESIGN IDEAS (${others.length}) — FITMENT UNVERIFIED`}
            </summary>
            <div className="grid">
              {others.map((p) => (
                <ProductCard key={p.slug} product={p} fit={p.fit} notVerified />
              ))}
            </div>
          </details>
          <p className="muted" style={{ marginTop: 24 }}>
            Want everything? <Link to="/shop" className="link-red">Browse the entire catalogue →</Link>
          </p>
        </>
      )}
    </section>
  );
}
