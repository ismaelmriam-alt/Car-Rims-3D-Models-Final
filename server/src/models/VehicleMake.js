import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true, index: true },
  },
  { timestamps: true }
);

export default mongoose.model('VehicleMake', schema);
