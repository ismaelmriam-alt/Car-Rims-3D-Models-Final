import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
  {
    slug: String,
    name: String,
    brand: String,
    style: String,
    color: String,
    size: {
      diameter: Number, width: Number, pcd: String, offset: Number, centerBore: Number,
    },
    qty: Number,
    unitPrice: Number,
    lineTotal: Number,
  },
  { _id: false }
);

const schema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    customer: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
    },
    items: { type: [itemSchema], validate: (v) => v.length > 0 },
    subtotal: { type: Number, required: true },
    shipping: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['cash_on_delivery', 'wish', 'bank_transfer'], required: true },
    status: { type: String, enum: ['pending'], default: 'pending' },
    isDemo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Order', schema);
