import { Link } from 'react-router-dom';
import RimImage from '../components/RimImage.jsx';
import SpeedoPrice from '../components/SpeedoPrice.jsx';
import { useStore } from '../context/Store.jsx';

export default function Wishlist() {
  const { wishlist, toggleWishlist, addToCart } = useStore();

  if (wishlist.length === 0) {
    return (
      <div className="empty">
        <h2>NO SAVED <em>RIMS</em></h2>
        <p>Tap the heart on any rim to keep it here.</p>
        <Link to="/shop" className="cta-btn">EXPLORE RIMS</Link>
      </div>
    );
  }

  return (
    <section className="section">
      <div className="section__head"><h2>YOUR <em>WISHLIST</em></h2></div>
      <div className="grid">
        {wishlist.map((p) => {
          const color = p.colors[0];
          const size = p.sizes.find((s) => s.stock > 0) || p.sizes[0];
          return (
            <article key={p.slug} className="pcard">
              <Link to={`/rims/${p.slug}`} className="pcard__img"><RimImage productSlug={p.slug} productName={p.name} showCaption size={260} /></Link>
              <div className="pcard__body">
                <p className="pcard__brand">{p.brand}</p>
                <h3 className="pcard__name"><Link to={`/rims/${p.slug}`}>{p.name}</Link></h3>
                <p className="pcard__spec">{p.style} · {color.name} · {size.diameter}x{size.width}</p>
                <SpeedoPrice value={p.price} size="sm" />
                <div className="pdp__buttons">
                  <button className="cta-btn small" disabled={size.stock < 1} onClick={() => addToCart(p, color, size, 1)}>ADD TO CART</button>
                  <button className="btn-ghost" onClick={() => toggleWishlist(p)}>Remove</button>
                </div>
                <p className="muted small">Adds {color.name}, {size.diameter}x{size.width}. Change options on the product page.</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
