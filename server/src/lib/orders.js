// Order validation and pricing. Prices, names and stock ALWAYS come from the
// product catalogue on the server - nothing price-related is trusted from the client.
import crypto from 'node:crypto';

export const PAYMENT_METHODS = {
  cash_on_delivery: 'Cash on Delivery',
  wish: 'Wish',
  bank_transfer: 'Bank Transfer',
};
export const MAX_QTY = 8;
export const MAX_LINES = 20;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^\+?[0-9 ()\-]{7,20}$/;

const clean = (v) => (typeof v === 'string' ? v.trim().replace(/\s+/g, ' ') : '');

export function validateCustomer(input = {}) {
  const c = {
    fullName: clean(input.fullName),
    phone: clean(input.phone),
    email: clean(input.email).toLowerCase(),
    address: clean(input.address),
    city: clean(input.city),
  };
  const errors = {};
  if (c.fullName.length < 2 || c.fullName.length > 80) errors.fullName = 'Enter your full name (2-80 characters).';
  const digits = c.phone.replace(/\D/g, '');
  if (!PHONE.test(c.phone) || digits.length < 7 || digits.length > 15) errors.phone = 'Enter a valid phone number.';
  if (!EMAIL.test(c.email) || c.email.length > 120) errors.email = 'Enter a valid email address.';
  if (c.address.length < 5 || c.address.length > 200) errors.address = 'Enter your address (5-200 characters).';
  if (c.city.length < 2 || c.city.length > 60) errors.city = 'Enter your city.';
  return { customer: c, errors };
}

export function newOrderNumber() {
  return 'RIMS-' + crypto.randomBytes(4).toString('hex').toUpperCase();
}

const sameNum = (a, b) => Math.abs(Number(a) - Number(b)) < 1e-6;

// body: { customer, paymentMethod, items:[{slug, color, size:{diameter,width,pcd,offset}, qty}] }
export async function buildOrder(body, getProduct) {
  const errors = {};
  const { customer, errors: custErrors } = validateCustomer(body?.customer);
  if (Object.keys(custErrors).length) errors.customer = custErrors;

  if (!Object.hasOwn(PAYMENT_METHODS, body?.paymentMethod)) {
    errors.paymentMethod = 'Choose a payment method.';
  }

  const rawItems = Array.isArray(body?.items) ? body.items : [];
  if (!rawItems.length) errors.items = 'Your cart is empty.';
  if (rawItems.length > MAX_LINES) errors.items = `A single order can have at most ${MAX_LINES} lines.`;

  const items = [];
  const lineErrors = [];
  if (!errors.items) {
    for (const [i, raw] of rawItems.entries()) {
      const qty = raw?.qty;
      if (typeof qty !== 'number' || !Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) {
        lineErrors.push(`Line ${i + 1}: quantity must be a whole number from 1 to ${MAX_QTY}.`);
        continue;
      }
      const product = typeof raw?.slug === 'string' ? await getProduct(raw.slug) : null;
      if (!product) {
        lineErrors.push(`Line ${i + 1}: this rim is no longer in the catalogue.`);
        continue;
      }
      const color = product.colors.find((c) => c.name === raw.color);
      if (!color) {
        lineErrors.push(`Line ${i + 1}: ${product.name} is not available in "${raw.color}".`);
        continue;
      }
      const rs = raw.size || {};
      const size = product.sizes.find(
        (s) =>
          sameNum(s.diameter, rs.diameter) && sameNum(s.width, rs.width) &&
          sameNum(s.offset, rs.offset) && s.pcd === rs.pcd
      );
      if (!size) {
        lineErrors.push(`Line ${i + 1}: that size is not offered for ${product.name}.`);
        continue;
      }
      if (qty > size.stock) {
        lineErrors.push(`Line ${i + 1}: only ${size.stock} in stock for ${product.name} ${size.diameter}x${size.width}.`);
        continue;
      }
      items.push({
        slug: product.slug, name: product.name, brand: product.brand, style: product.style,
        color: color.name,
        size: { diameter: size.diameter, width: size.width, pcd: size.pcd, offset: size.offset, centerBore: size.centerBore },
        qty, unitPrice: product.price, lineTotal: product.price * qty,
      });
    }
    if (lineErrors.length) errors.items = lineErrors;
  }

  if (Object.keys(errors).length) return { errors };

  const subtotal = items.reduce((s, l) => s + l.lineTotal, 0);
  const shipping = 0; // demo: free, no shipping integration
  return {
    order: {
      orderNumber: newOrderNumber(),
      customer, items, subtotal, shipping, total: subtotal + shipping,
      paymentMethod: body.paymentMethod, status: 'pending', isDemo: true,
    },
  };
}

// What the success page may show (no phone/email echoed back).
export const publicOrder = (o) => ({
  orderNumber: o.orderNumber,
  items: o.items,
  subtotal: o.subtotal,
  shipping: o.shipping,
  total: o.total,
  paymentMethod: o.paymentMethod,
  paymentLabel: PAYMENT_METHODS[o.paymentMethod],
  status: o.status,
  city: o.customer?.city,
  isDemo: true,
  createdAt: o.createdAt,
});
