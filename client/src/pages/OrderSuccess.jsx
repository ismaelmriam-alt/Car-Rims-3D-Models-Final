import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import SpeedoPrice from '../components/SpeedoPrice.jsx';
import { fetchOrder } from '../api.js';

export default function OrderSuccess() {
  const { orderNumber } = useParams();
  const { state } = useLocation();
  const [order, setOrder] = useState(state?.order?.orderNumber === orderNumber ? state.order : null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (order) return;
    fetchOrder(orderNumber).then(setOrder).catch((e) => setError(e.message));
  }, [orderNumber, order]);

  if (error) {
    return (
      <div className="empty">
        <h2>ORDER NOT <em>FOUND</em></h2>
        <p>We could not find order {orderNumber}.</p>
        <Link to="/shop" className="cta-btn">BACK TO SHOP</Link>
      </div>
    );
  }
  if (!order) return <div className="section"><div className="skeleton" style={{ height: 360 }} /></div>;

  return (
    <section className="success">
      <div className="success__burst" aria-hidden="true"><i /><i /><i /></div>
      <h1>ORDER ADDED <em>SUCCESSFULLY!</em></h1>
      <p className="success__lead">Thank you for choosing RIMS.</p>
      <p>Your order has been submitted successfully.</p>

      <div className="success__card">
        <div className="success__no"><small>ORDER NUMBER</small><b>{order.orderNumber}</b></div>
        <ul className="osum">
          {order.items.map((l, i) => (
            <li key={i}>
              <div>
                <b>{l.brand} {l.name}</b>
                <small>{l.color} · {l.size.diameter}x{l.size.width} ET{l.size.offset} · {l.size.pcd}</small>
                <small>{l.qty} × ${l.unitPrice}</small>
              </div>
              <span>${l.lineTotal.toLocaleString()}</span>
            </li>
          ))}
        </ul>
        <div className="summary__row"><span>Test payment option</span><b>{order.paymentLabel}</b></div>
        <div className="summary__row"><span>Status</span><b className="pill">{order.status}</b></div>
        <div className="summary__total"><span>Total</span><SpeedoPrice value={order.total} size="md" per="" /></div>
      </div>

      <p className="muted">
        This test order was not paid or fulfilled. Shipping, email notifications and order tracking are not connected.
      </p>
      <div className="success__actions">
        <Link to="/shop" className="cta-btn">KEEP EXPLORING</Link>
        <Link to="/" className="btn-ghost">BACK HOME</Link>
      </div>
    </section>
  );
}
