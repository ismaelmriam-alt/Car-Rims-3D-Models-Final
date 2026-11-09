import mongoose from 'mongoose';

const colorSchema = new mongoose.Schema(
  { name: String, hex: String },
  { _id: false }
);

const sizeSchema = new mongoose.Schema(
  {
    diameter: Number, // inches
    width: Number, // inches
    pcd: String, // bolt pattern, e.g. "5x112"
    offset: Number, // ET in mm
    centerBore: Number, // mm
    stock: { type: Number, default: 0 },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    slug: { type: String, unique: true, index: true },
    name: { type: String, required: true },
    brand: { type: String, required: true, index: true },
    style: {
      type: String,
      enum: ['Multi-Spoke', 'Mesh', 'Split-Spoke', 'Deep Dish', 'Sport'],
      index: true,
    },
    description: String,
    price: { type: Number, required: true }, // per wheel, USD
    colors: [colorSchema],
    sizes: [sizeSchema],
    material: String,
    finishNote: String,
    // NOTE: not called "isNew" - that is a reserved Mongoose document property.
    isNewArrival: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    releasedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('Product', productSchema);
