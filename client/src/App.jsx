import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Nav from './components/Nav.jsx';
import Home from './pages/Home.jsx';
import Shop from './pages/Shop.jsx';
import Product from './pages/Product.jsx';
import Cart from './pages/Cart.jsx';
import Wishlist from './pages/Wishlist.jsx';
import Checkout from './pages/Checkout.jsx';
import OrderSuccess from './pages/OrderSuccess.jsx';

// The Fitment page pulls in three.js, so it loads on demand.
const Fitment = lazy(() => import('./pages/Fitment.jsx'));

export default function App() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  return (
    <>
      <Nav />
      <main key={pathname} className="page">
        <Suspense fallback={<div className="section"><div className="skeleton" style={{ height: 420 }} /></div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/rims/:slug" element={<Product />} />
            <Route path="/fitment" element={<Fitment />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-success/:orderNumber" element={<OrderSuccess />} />
            <Route path="*" element={<div className="empty"><h2>404</h2><p>Page not found.</p></div>} />
          </Routes>
        </Suspense>
      </main>
    </>
  );
}
