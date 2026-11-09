import { Link } from 'react-router-dom';
import RimImage from '../components/RimImage.jsx';
import SpeedoPrice from '../components/SpeedoPrice.jsx';
import { sizeLabel, useStore } from '../context/Store.jsx';

export default function Cart() {
  const { cart, setQty, removeFromCart, subtotal, total } = useStore();

  if (cart.length === 0) {
    return (
      <div className="empty">
        <h2>YOUR CART IS <em>EMPTY</em></h2>
        <p>Pick a set of rims and they will show up here.</p>
        <Link to="/shop" className="cta-btn">EXPLORE RIMS</Link>
      </div>
    );
  }

  return (
    <section className="section cart">
      <div className="section__head"><h2>YOUR <em>CART</em></h2></div>
      <div className="cart__layout">
        <ul className="cart__list">
          {cart.map((l) => (
            <li key={l.id} className="line">
              <Link to={`/rims/${l.slug}`} className="line__img">
                <RimImage productSlug={l.slug} productName={l.name} size={120} />
              </Link>
              <div className="line__info">
                <p className="pcard__brand">{l.brand}</p>
                <h3><Link to={`/rims/${l.slug}`}>{l.name}</Link></h3>
                <p className="muted small">
                  <span className="dot" style={{ background: l.color.hex }} /> {l.color.name} · {sizeLabel(l.size)}
                </p>
                <p className="muted small">${l.price} each (per wheel)</p>
              </div>
              <div className="qty" role="group" aria-label={`Quantity for ${l.name}`}>
                <button onClick={() => setQty(l.id, l.qty - 1)} aria-label="Decrease quantity">−</button>
                <span aria-live="polite">{l.qty}</span>
                <button onClick={() => setQty(l.id, l.qty + 1)} disabled={l.qty >= l.cap} aria-label="Increase quantity">+</button>
              </div>
              <div className="line__total">${(l.price * l.qty).toLocaleString()}</div>
              <button className="remove" onClick={() => removeFromCart(l.id)} aria-label={`Remove ${l.name}`}>×</button>
            </li>
          ))}
        </ul>

        <aside className="summary">
          <h3>ORDER SUMMARY</h3>
          <div className="summary__row"><span>Subtotal</span><b>${subtotal.toLocaleString()}</b></div>
          <div className="summary__row"><span>Shipping</span><b>Not available</b></div>
          <div className="summary__total"><span>Total</span><SpeedoPrice value={total} size="md" per="" /></div>
          <Link to="/checkout" className="cta-btn">CHECKOUT</Link>
          <p className="muted small">Limited by available stock, max 8 per item. Test orders are not paid or fulfilled.</p>
        </aside>
      </div>
    </section>
  );
}
