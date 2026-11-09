import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import RimImage from './RimImage.jsx';
import SpeedoPrice from './SpeedoPrice.jsx';
import { useStore } from '../context/Store.jsx';

// Phase 1 card, extended with OPTIONAL fitment info:
//   fit        - { compatible, matches, whyNot } from /api/fitment/recommend (technical fit)
//   styleHint  - { bestColorIndex, notes } (aesthetic suggestion, NOT a compatibility claim)
//   onPreview  - (product, color) => void  shows the rim on the 3D car
export default function ProductCard({ product, fit, styleHint, onPreview, notVerified, bestMatch = false }) {
  const [ci, setCi] = useState(styleHint?.bestColorIndex ?? 0);
  useEffect(() => {
    if (Number.isInteger(styleHint?.bestColorIndex)) setCi(styleHint.bestColorIndex);
  }, [styleHint?.bestColorIndex]);
  const { toggleWishlist, inWishlist, vehicle } = useStore();
  const color = product.colors[ci];
  const diameters = [...new Set(product.sizes.map((s) => s.diameter))].sort((a, b) => a - b);
  const saved = inWishlist(product.slug);

  const best = fit?.compatible ? fit.matches[0] : null;
  const params = new URLSearchParams({ color: String(ci) });
  if (best) params.set('size', String(best.sizeIndex));
  const to = `/rims/${product.slug}?${params}`;
  const fitLabel = best
    ? 'VERIFIED SIZE AVAILABLE'
    : fit || notVerified || vehicle
      ? 'FITMENT NOT VERIFIED'
      : 'FITMENT CHECK AVAILABLE';

  return (
    <article className="pcard">
      {bestMatch && (
        <span className="tag tag--match">
          {fit?.compatible ? 'BEST MATCH FOR YOUR CAR' : 'BEST DESIGN MATCH · FITMENT UNVERIFIED'}
        </span>
      )}
      <button
        className={`heart ${saved ? 'on' : ''}`}
        onClick={() => toggleWishlist(product)}
        aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
        aria-pressed={saved}
      >
        {saved ? '♥' : '♡'}
      </button>
      {!bestMatch && product.isNewArrival && <span className="tag tag--new">NEW</span>}
      {!bestMatch && product.isBestSeller && !product.isNewArrival && <span className="tag">BEST SELLER</span>}

      <Link to={to} className="pcard__img">
        <RimImage productSlug={product.slug} productName={product.name} showCaption size={330} />
      </Link>

      <div className="pcard__body">
        <p className="pcard__brand">{product.brand}</p>
        <h3 className="pcard__name"><Link to={to}>{product.name}</Link></h3>
        <p className="pcard__spec">{product.style} design</p>
        <p className="pcard__finishes"><span>AVAILABLE FINISHES</span>{product.colors.map((c) => c.name).join(' · ')}</p>
        <div className="swatches" role="group" aria-label="Colour options">
          {product.colors.map((c, i) => (
            <button
              key={c.name}
              className={`swatch ${i === ci ? 'on' : ''}`}
              style={{ background: c.hex }}
              onClick={() => setCi(i)}
              title={c.name}
              aria-label={c.name}
              aria-pressed={i === ci}
            />
          ))}
          <span className="pcard__selected-finish">{color.name}</span>
        </div>
        <div className="pcard__price"><SpeedoPrice value={product.price} size="sm" /></div>

        {best && (
          <div className="fitbox fitbox--ok">
            <b>✓ {fitLabel}</b>
            <span>
              {best.size.diameter}x{best.size.width} ET{best.size.offset} · {best.size.pcd}
              {fit.matches.length > 1 ? ` (+${fit.matches.length - 1} more size${fit.matches.length > 2 ? 's' : ''})` : ''}
            </span>
            {best.notes.slice(0, 2).map((n) => <small key={n}>{n}</small>)}
            {product.recommendationReason && <small className="pcard__reason">{product.recommendationReason}</small>}
          </div>
        )}
        {notVerified && fit && !fit.compatible && (
          <div className="fitbox fitbox--no">
            <b>FITMENT NOT VERIFIED</b>
            <small>{product.recommendationReason || fit.whyNot}</small>
          </div>
        )}
        {fit && !fit.compatible && !notVerified && product.recommendationReason && (
          <div className="fitbox fitbox--unknown">
            <b>DESIGN SUGGESTION ONLY</b>
            <small>{product.recommendationReason}</small>
          </div>
        )}
        {!fit && vehicle && (
          <div className="fitbox fitbox--unknown">
            <b>{vehicle.unverified ? 'FITMENT NOT VERIFIED' : 'CHECK FITMENT BEFORE ORDERING'}</b>
            <small>{vehicle.unverified ? 'This vehicle has no verified wheel specifications in our catalog.' : 'Run a trim-level fitment check before ordering.'}</small>
          </div>
        )}
        {!fit && !vehicle && <div className="pcard__fit-label">{fitLabel} · {diameters[0]}"–{diameters[diameters.length - 1]}" catalog range</div>}
        {styleHint?.notes?.length > 0 && (
          <div className="fitbox fitbox--style">
            <b>{fit?.compatible ? 'WHY IT SUITS YOUR CAR' : 'DESIGN RATIONALE'}</b>
            {styleHint.notes.map((n) => <small key={n}>{n}</small>)}
          </div>
        )}
        {onPreview && (
          <button className="btn-ghost small" onClick={() => onPreview(product, color)}>PREVIEW ON CAR</button>
        )}
        <div className="pcard__actions">
          <Link to={to} className="pcard__details">VIEW DETAILS</Link>
          <Link to={to} className="cta-btn small">CHOOSE THIS RIM</Link>
        </div>
      </div>
    </article>
  );
}
