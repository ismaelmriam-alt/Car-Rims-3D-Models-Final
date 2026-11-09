import mongoose from 'mongoose';

const wheelSchema = new mongoose.Schema(
  {
    diameter: { type: Number, required: true },
    width: { type: Number, required: true },
    offset: { type: Number, required: true }, // ET, mm
    axle: { type: String, enum: ['front', 'rear', null], default: null },
    oem: { type: Boolean, default: null }, // true only when the source marks it OEM; null = source does not say
  },
  { _id: false }
);

const trimSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    trimLevels: [String],
    wheels: { type: [wheelSchema], validate: (v) => v.length > 0 },
  },
  { _id: false }
);

// One document per vehicle generation (+ market) with its verified wheel data.
const schema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    make: { type: String, required: true },
    makeSlug: { type: String, required: true, index: true },
    model: { type: String, required: true },
    modelSlug: { type: String, required: true, index: true },
    generation: { type: String, required: true },
    market: { type: String, default: null },
    yearFrom: { type: Number, required: true },
    yearTo: { type: Number, required: true },
    pcd: { type: String, required: true }, // bolt pattern
    hubBore: { type: Number, required: true }, // centre bore, mm
    status: { type: String, enum: ['verified'], default: 'verified' },
    source: {
      name: { type: String, required: true },
      url: { type: String, required: true },
      retrieved: String,
    },
    trims: { type: [trimSchema], validate: (v) => v.length > 0 },
  },
  { timestamps: true }
);

schema.index({ makeSlug: 1, modelSlug: 1, yearFrom: 1, yearTo: 1 });

export default mongoose.model('VehicleFitment', schema);
