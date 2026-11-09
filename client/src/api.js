const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
const apiUrl = (path) => `${API_BASE_URL}${path}`;

const get = async (url) => {
  const res = await fetch(apiUrl(url));
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
};

export const fetchProducts = (params = {}) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (Array.isArray(v) ? v.length : v !== '' && v != null) qs.set(k, Array.isArray(v) ? v.join(',') : v);
  });
  return get(`/api/products?${qs}`);
};
export const fetchFilters = () => get('/api/products/meta/filters');
export const fetchProduct = (slug) => get(`/api/products/${slug}`);

// ---- vehicles / fitment
export const fetchMakes = () => get('/api/vehicles/makes');
export const fetchModels = (make) => get(`/api/vehicles/models?make=${encodeURIComponent(make)}`);
export const fetchYears = (make, model) =>
  get(`/api/vehicles/years?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`);
export const fetchTrims = (make, model, year) =>
  get(`/api/vehicles/trims?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&year=${year}`);

export const fetchRecommendations = (v, color) => {
  const qs = new URLSearchParams({ color });
  if (v.fitmentKey) {
    qs.set('fitment', v.fitmentKey);
    qs.set('trim', v.trimIndex);
  } else {
    qs.set('make', v.makeSlug);
    qs.set('model', v.modelSlug);
  }
  return get(`/api/fitment/recommend?${qs}`);
};
export const fetchFitCheck = (v, product) =>
  get(`/api/fitment/check?fitment=${encodeURIComponent(v.fitmentKey)}&trim=${v.trimIndex}&product=${encodeURIComponent(product)}`);

// ---- orders
export const placeOrder = async (payload) => {
  const res = await fetch(apiUrl('/api/orders'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Order failed (${res.status})`);
    err.fieldErrors = data.errors || null;
    throw err;
  }
  return data;
};
export const fetchOrder = (orderNumber) => get(`/api/orders/${encodeURIComponent(orderNumber)}`);
