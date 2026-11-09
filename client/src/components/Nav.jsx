import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useStore } from '../context/Store.jsx';

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [q, setQ] = useState('');
  const { count, wishlist } = useStore();
  const navigate = useNavigate();
  const close = () => setOpen(false);

  const submit = (e) => {
    e.preventDefault();
    navigate(`/shop?q=${encodeURIComponent(q.trim())}`);
    setSearching(false);
    setOpen(false);
  };

  return (
    <header className="nav">
      <Link to="/" className="logo" onClick={close}>
        <span className="logo__bars" aria-hidden="true"><i /><i /><i /></span>
        <span className="logo__text">
          <b>RIMS</b>
          <small>DRIVE DIFFERENT</small>
        </span>
      </Link>

      <nav className={`nav__links ${open ? 'open' : ''}`} aria-label="Main">
        <NavLink to="/" end onClick={close}>Home</NavLink>
        <NavLink to="/shop" end onClick={close}>Shop All Rims</NavLink>
        <NavLink to="/fitment" onClick={close}>Find Your Fitment</NavLink>
        <NavLink to="/shop?tag=new" onClick={close}>New Arrivals</NavLink>
        <NavLink to="/shop?tag=bestseller" onClick={close}>Best Sellers</NavLink>
        <NavLink to="/wishlist" className="mobile-only" onClick={close}>Wishlist ({wishlist.length})</NavLink>
        <NavLink to="/cart" className="mobile-only" onClick={close}>Cart ({count})</NavLink>
      </nav>

      <div className="nav__actions">
        {searching ? (
          <form onSubmit={submit} className="searchbar">
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search rims, brands, styles" aria-label="Search" />
            <button type="button" onClick={() => setSearching(false)} aria-label="Close search">×</button>
          </form>
        ) : (
          <button className="icon-btn" onClick={() => setSearching(true)} aria-label="Search">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
          </button>
        )}
        <Link to="/wishlist" className="icon-btn desktop-only" aria-label="Wishlist">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 20s-7-4.5-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.5-9 9-9 9z" /></svg>
          {wishlist.length > 0 && <em className="badge">{wishlist.length}</em>}
        </Link>
        <Link to="/cart" className="icon-btn desktop-only" aria-label="Cart">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 4h3l2.5 11h10L21 7H7" /><circle cx="9.5" cy="19.5" r="1.4" /><circle cx="17.5" cy="19.5" r="1.4" /></svg>
          <em className="badge">{count}</em>
        </Link>
        <button className="icon-btn burger" onClick={() => setOpen((o) => !o)} aria-label="Menu" aria-expanded={open}>
          <span /><span /><span />
        </button>
      </div>
    </header>
  );
}
