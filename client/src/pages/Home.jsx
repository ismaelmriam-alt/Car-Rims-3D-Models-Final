import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts } from '../api.js';
import ProductCard from '../components/ProductCard.jsx';

function HeroVideo() {
  const [failed, setFailed] = useState(false);
  const ref = useRef(null);
  // Skip the video on small screens / data-saver to save bandwidth; show the fallback image.
  const skip =
    typeof window !== 'undefined' &&
    (window.matchMedia('(max-width: 700px)').matches || navigator.connection?.saveData);

  useEffect(() => {
    ref.current?.play?.().catch(() => setFailed(true));
  }, []);

  return (
    <div className="hero__media">
      <img className="hero__fallback" src="/media/home-racing-scene.jpg" alt="" />
      {!failed && !skip && (
        <video
          ref={ref}
          className="hero__video"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/media/home-racing-scene.jpg"
          onError={() => setFailed(true)}
        >
          <source src="/media/hero.mp4" type="video/mp4" />
        </video>
      )}
      <div className="hero__overlay" />
    </div>
  );
}

export default function Home() {
  const [best, setBest] = useState([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchProducts({ tag: 'bestseller' }).then((d) => setBest(d.slice(0, 4))).catch(() => setError(true));
  }, []);

  return (
    <>
      <section className="hero">
        <HeroVideo />
        <div className="hero__content">
          <h1 className="hero__title">
            <span className="chrome">YOUR WHEELS.</span>
            <span className="red">YOUR IDENTITY.</span>
          </h1>
          <p className="hero__tag"><i>///</i> Find the rims that define your ride.</p>

          <div className="hero__ctas">
            <div className="cta-wrap">
              <small>01</small>
              <Link to="/shop" className="cta cta--explore">
                <span>EXPLORE<br />RIMS</span>
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#E31B23" strokeWidth="3"><path d="M8 3l9 9-9 9" /></svg>
              </Link>
            </div>
            <div className="cta-wrap">
              <small>02</small>
              <Link to="/fitment" className="cta cta--fit">
                <span>FIND YOUR<br />FITMENT</span>
                <svg width="46" height="46" viewBox="0 0 48 48" fill="none" stroke="#E31B23" strokeWidth="2"><circle cx="24" cy="24" r="18" /><circle cx="24" cy="24" r="9" /><path d="M24 2v10M24 36v10M2 24h10M36 24h10" /><circle cx="24" cy="24" r="2" fill="#E31B23" /></svg>
              </Link>
            </div>
          </div>
        </div>

        <ol className="hero__steps" aria-hidden="true"><li className="on">01</li><li>02</li><li>03</li></ol>
        <div className="hero__scroll">
          <span className="mouse"><i /></span>
          <small>SCROLL DOWN</small>
        </div>
        <div className="hero__foot">RACING · STYLE · PERFORMANCE <b className="logo__bars"><i /><i /><i /></b></div>
      </section>

      <section className="section">
        <div className="section__head">
          <h2>BEST <em>SELLERS</em></h2>
          <Link to="/shop?tag=bestseller" className="link-red">View all →</Link>
        </div>
        {error && <p className="muted">Could not load products. Is the API running?</p>}
        <div className="grid">
          {best.map((p) => <ProductCard key={p.slug} product={p} />)}
        </div>
      </section>
    </>
  );
}
