import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { fetchFitCheck, fetchProduct } from '../api.js';
import RimImage from '../components/RimImage.jsx';
import SpeedoPrice from '../components/SpeedoPrice.jsx';
import { useStore } from '../context/Store.jsx';

export default function Product() {
  const { slug } = useParams();
  const [sp] = useSearchParams();
  const [p, setP] = useState(null);
  const [error, setError] = useState(null);
  const [ci, setCi] = useState(0);
  const [si, setSi] = useState(0); // index into p.sizes
  const [added, setAdded] = useState(false);
  const [check, setCheck] = useState(null); // fit check for the selected vehicle
  const { addToCart, toggleWishlist, inWishlist, vehicle } = useStore();

  useEffect(() => {
    setP(null); setError(null); setCheck(null);
    fetchProduct(slug)
      .then((prod) => {
        setP(prod);
        const c = Number(sp.get('color'));
        const s = Number(sp.get('size'));
        setCi(Number.isInteger(c) && c >= 0 && c < prod.colors.length ? c : 0);
        setSi(Number.isInteger(s) && s >= 0 && s < prod.sizes.length ? s : 0);
      })
      .catch((e) => setError(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // per-size fit check against the vehicle chosen on the Find Your Fitment page
  useEffect(() => {
    if (!p || !vehicle?.fitmentKey) { setCheck(null); return undefined; }
    let alive = true;
    fetchFitCheck(vehicle, p.slug).then((c) => alive && setCheck(c)).catch(() => alive && setCheck(null));
    return () => { alive = false; };
  }, [p, vehicle]);

  const pcds = useMemo(() => (p ? [...new Set(p.sizes.map((s) => s.pcd))] : []), [p]);

  if (error) return <div className="empty"><h2>Rim not found</h2><Link to="/shop" className="link-red">Back to shop</Link></div>;
  if (!p) return <div className="section"><div className="skeleton" style={{ height: 480 }} /></div>;

  const color = p.colors[ci];
  const size = p.sizes[si];
  const out = size.stock < 1;
  const stockText = out ? 'Out of stock' : size.stock <= 4 ? `Only ${size.stock} sets left` : 'In stock';
  const saved = inWishlist(p.slug);
  const sizeCheck = check?.sizes?.[si];

  const add = () => {
    addToCart(p, color, size, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <section className="section pdp">
      <p className="crumbs"><Link to="/shop">Shop</Link> / {p.style} / {p.name}</p>
      <div className="pdp__grid">
        <div className="pdp__gallery">
          <div className="pdp__main">
            <RimImage productSlug={p.slug} productName={p.name} showCaption size={520} />
          </div>
        </div>

        <div className="pdp__info">
          <p className="pcard__brand">{p.brand}</p>
          <h1>{p.name}</h1>
          <p className="muted">{p.style} · {p.material}</p>
          <SpeedoPrice value={p.price} size="lg" />
          <p className="pdp__desc">{p.description}</p>

          {vehicle && (
            <div className={`fitbox ${check ? (check.compatible ? 'fitbox--ok' : 'fitbox--no') : 'fitbox--style'}`}>
              <b>YOUR VEHICLE: {vehicle.label}</b>
              {vehicle.unverified && <small>No verified fitment data for this vehicle yet. Verify the specs below before ordering.</small>}
              {check && check.compatible && <small>✓ Sizes marked ✓ below are technically compatible by verified data.</small>}
              {check && !check.compatible && <small>No size of this rim is verified compatible with this vehicle.</small>}
              <Link to="/fitment" className="link-red small">Change vehicle</Link>
            </div>
          )}

          <h4>Colour: <b>{color.name}</b></h4>
          <div className="swatches big">
            {p.colors.map((c, i) => (
              <button key={c.name} className={`swatch ${i === ci ? 'on' : ''}`} style={{ background: c.hex }} onClick={() => setCi(i)} title={c.name} aria-label={c.name} aria-pressed={i === ci} />
            ))}
          </div>

          <h4>Bolt pattern</h4>
          <div className="sizes">
            {pcds.map((pcd) => (
              <button
                key={pcd}
                className={`size ${size.pcd === pcd ? 'on' : ''}`}
                onClick={() => setSi(p.sizes.findIndex((s) => s.pcd === pcd))}
              >
                {pcd}
              </button>
            ))}
          </div>

          <h4>Size</h4>
          <div className="sizes">
            {p.sizes.map((s, i) => {
              if (s.pcd !== size.pcd) return null;
              const c = check?.sizes?.[i];
              return (
                <button key={i} className={`size ${i === si ? 'on' : ''} ${c ? (c.ok ? 'fits' : 'nofit') : ''}`} onClick={() => setSi(i)}>
                  {c?.ok ? '✓ ' : ''}{s.diameter}x{s.width}<small>ET{s.offset} · CB {s.centerBore}</small>
                </button>
              );
            })}
          </div>
          {sizeCheck && (
            <p className={`small ${sizeCheck.ok ? 'fit-yes' : 'muted'}`}>
              {sizeCheck.ok ? `✓ This size is technically compatible. ${sizeCheck.notes.join(' · ')}` : `Not verified for your vehicle: ${sizeCheck.reason}.`}
            </p>
          )}

          <p className={`stock ${out ? 'out' : size.stock <= 4 ? 'low' : ''}`}>{stockText}</p>

          <div className="pdp__buttons">
            <button className="cta-btn" disabled={out} onClick={add}>{added ? 'ADDED ✓' : 'ADD TO CART'}</button>
            <button className={`btn-ghost ${saved ? 'on' : ''}`} onClick={() => toggleWishlist(p)}>
              {saved ? '♥ In wishlist' : '♡ Add to wishlist'}
            </button>
          </div>

          <table className="specs">
            <caption>Technical specifications (selected size)</caption>
            <tbody>
              <tr><th>Diameter</th><td>{size.diameter}"</td></tr>
              <tr><th>Width</th><td>{size.width}"</td></tr>
              <tr><th>Bolt pattern (PCD)</th><td>{size.pcd}</td></tr>
              <tr><th>Offset (ET)</th><td>{size.offset} mm</td></tr>
              <tr><th>Centre bore</th><td>{size.centerBore} mm</td></tr>
              <tr><th>Material</th><td>{p.material}</td></tr>
            </tbody>
          </table>
          <p className="muted small">Price is per wheel. Photos are real-world visual references and may not depict this fictional demo product or its selected finish.</p>
        </div>
      </div>
    </section>
  );
}
