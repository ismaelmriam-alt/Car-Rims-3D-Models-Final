import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    make: { type: String, required: true },
    makeSlug: { type: String, required: true, index: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    bodyType: { type: String, enum: ['hatchback', 'sedan', 'suv', 'coupe'], required: true },
    // true only when at least one verified fitment record exists for the model
    verified: { type: Boolean, default: false },
    // model years (>= 2000) covered by verified fitments. Empty when unverified.
    years: [Number],
    fitmentCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

schema.index({ makeSlug: 1, slug: 1 }, { unique: true });

export default mongoose.model('VehicleModel', schema);
