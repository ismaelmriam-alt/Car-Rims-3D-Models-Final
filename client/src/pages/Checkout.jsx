import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import RimImage from '../components/RimImage.jsx';
import SpeedoPrice from '../components/SpeedoPrice.jsx';
import { placeOrder } from '../api.js';
import { sizeLabel, useStore } from '../context/Store.jsx';

const METHODS = [
  { id: 'cash_on_delivery', label: 'Cash on Delivery', note: 'Test option only. Orders are not fulfilled and no payment is collected.' },
  { id: 'wish', label: 'Wish', note: 'Test option only. No account details or payment are requested or processed.' },
  { id: 'bank_transfer', label: 'Bank Transfer', note: 'Test option only. No bank details are collected and no money moves.' },
];

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export function validate(c) {
  const e = {};
  const t = (v) => v.trim().replace(/\s+/g, ' ');
  if (t(c.fullName).length < 2) e.fullName = 'Enter your full name.';
  const digits = c.phone.replace(/\D/g, '');
  if (!/^\+?[0-9 ()\-]{7,20}$/.test(c.phone.trim()) || digits.length < 7 || digits.length > 15) e.phone = 'Enter a valid phone number.';
  if (!EMAIL.test(c.email.trim())) e.email = 'Enter a valid email address.';
  if (t(c.address).length < 5) e.address = 'Enter your address.';
  if (t(c.city).length < 2) e.city = 'Enter your city.';
  return e;
}

const FIELDS = [
  ['fullName', 'Full name', 'text', 'name'],
  ['phone', 'Phone number', 'tel', 'tel'],
  ['email', 'Email', 'email', 'email'],
  ['address', 'Address', 'text', 'street-address'],
  ['city', 'City', 'text', 'address-level2'],
];

export default function Checkout() {
  const { cart, subtotal, total, clearCart } = useStore();
  const navigate = useNavigate();
  const [c, setC] = useState({ fullName: '', phone: '', email: '', address: '', city: '' });
  const [method, setMethod] = useState('');
  const [errors, setErrors] = useState({});
  const [methodError, setMethodError] = useState('');
  const [serverErrors, setServerErrors] = useState([]);
  const [busy, setBusy] = useState(false);
  const [fatal, setFatal] = useState('');

  if (cart.length === 0) {
    return (
      <div className="empty">
        <h2>NOTHING TO <em>CHECK OUT</em></h2>
        <p>Your cart is empty.</p>
        <Link to="/shop" className="cta-btn">EXPLORE RIMS</Link>
      </div>
    );
  }

  const set = (k) => (e) => {
    setC((p) => ({ ...p, [k]: e.target.value }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: undefined }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    const ve = validate(c);
    setErrors(ve);
    setMethodError(method ? '' : 'Choose a payment method.');
    setServerErrors([]);
    setFatal('');
    if (Object.keys(ve).length || !method) {
      document.querySelector('[aria-invalid="true"], .fieldset--err')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return;
    }
    setBusy(true);
    try {
      const order = await placeOrder({
        customer: c,
        paymentMethod: method,
        items: cart.map((l) => ({
          slug: l.slug, color: l.color.name, qty: l.qty,
          size: { diameter: l.size.diameter, width: l.size.width, pcd: l.size.pcd, offset: l.size.offset },
        })),
      });
      clearCart();
      navigate(`/order-success/${order.orderNumber}`, { state: { order }, replace: true });
    } catch (err) {
      if (err.fieldErrors) {
        if (err.fieldErrors.customer) setErrors(err.fieldErrors.customer);
        if (err.fieldErrors.paymentMethod) setMethodError(err.fieldErrors.paymentMethod);
        const items = err.fieldErrors.items;
        setServerErrors(Array.isArray(items) ? items : items ? [items] : []);
      } else {
        setFatal(err.message || 'Could not place the order. Please try again.');
      }
      setBusy(false);
    }
  };

  return (
    <section className="section checkout">
      <div className="section__head"><h2>TEST <em>CHECKOUT</em></h2></div>
      <p className="notice notice--warn">
        <b>Test order only.</b> Payment is not processed and orders are not fulfilled. Please use placeholder contact details.
      </p>

      <form className="cart__layout" onSubmit={submit} noValidate>
        <div className="checkout__main">
          <fieldset className="cfield">
            <legend>01 · Customer information</legend>
            {FIELDS.map(([k, label, type, ac]) => (
              <label key={k} className={errors[k] ? 'has-err' : ''}>
                <span>{label}</span>
                <input
                  type={type} value={c[k]} onChange={set(k)} autoComplete={ac}
                  aria-invalid={errors[k] ? 'true' : 'false'} aria-describedby={errors[k] ? `${k}-err` : undefined}
                  maxLength={k === 'address' ? 200 : 120}
                />
                {errors[k] && <em id={`${k}-err`} role="alert">{errors[k]}</em>}
              </label>
            ))}
          </fieldset>

          <fieldset className={`cfield ${methodError ? 'fieldset--err' : ''}`}>
            <legend>02 · Test payment option</legend>
            {METHODS.map((m) => (
              <label key={m.id} className={`pay ${method === m.id ? 'on' : ''}`}>
                <input
                  type="radio" name="payment" value={m.id} checked={method === m.id}
                  onChange={() => { setMethod(m.id); setMethodError(''); }}
                />
                <span><b>{m.label}</b><small>{m.note}</small></span>
              </label>
            ))}
            {methodError && <em className="cfield__err" role="alert">{methodError}</em>}
          </fieldset>
        </div>

        <aside className="summary">
          <h3>ORDER SUMMARY</h3>
          <ul className="osum">
            {cart.map((l) => (
              <li key={l.id}>
                <RimImage productSlug={l.slug} productName={l.name} size={64} />
                <div>
                  <b>{l.brand} {l.name}</b>
                  <small>{l.color.name} · {sizeLabel(l.size)}</small>
                  <small>{l.qty} × ${l.price}</small>
                </div>
                <span>${(l.price * l.qty).toLocaleString()}</span>
              </li>
            ))}
          </ul>
          <div className="summary__row"><span>Subtotal</span><b>${subtotal.toLocaleString()}</b></div>
          <div className="summary__row"><span>Shipping</span><b>Not available</b></div>
          <div className="summary__total"><span>Final total</span><SpeedoPrice value={total} size="md" per="" /></div>

          {serverErrors.length > 0 && (
            <div className="notice notice--err" role="alert">
              <b>We could not place your order:</b>
              <ul>{serverErrors.map((m) => <li key={m}>{m}</li>)}</ul>
              <Link to="/cart" className="link-red">Update your cart</Link>
            </div>
          )}
          {fatal && <p className="notice notice--err" role="alert">{fatal}</p>}

          <button className="cta-btn" disabled={busy}>{busy ? 'PLACING ORDER…' : 'CONFIRM ORDER'}</button>
          <Link to="/cart" className="link-red small">← Back to cart</Link>
        </aside>
      </form>
    </section>
  );
}
