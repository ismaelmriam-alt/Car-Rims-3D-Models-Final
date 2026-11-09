import 'dotenv/config';
import mongoose from 'mongoose';
import Product from './models/Product.js';
import VehicleMake from './models/VehicleMake.js';
import VehicleModel from './models/VehicleModel.js';
import VehicleFitment from './models/VehicleFitment.js';
import { products } from './data/products.js';
import { buildCatalog } from './lib/catalog.js';

async function run() {
  // Build + validate everything BEFORE touching the database.
  const catalog = buildCatalog();
  const docs = products.map((p) => ({ ...p, releasedAt: new Date(p.releasedAt) }));
  for (const d of docs) {
    const err = new Product(d).validateSync();
    if (err) throw new Error(`Invalid product ${d.slug}: ${err.message}`);
  }
  for (const f of catalog.fitments) {
    const err = new VehicleFitment(f).validateSync();
    if (err) throw new Error(`Invalid fitment ${f.key}: ${err.message}`);
  }

  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rims');

  // NOTE: Orders are NOT touched by the seed, so demo orders survive a reseed.
  await Promise.all([Product.deleteMany({}), VehicleMake.deleteMany({}), VehicleModel.deleteMany({}), VehicleFitment.deleteMany({})]);
  await Product.insertMany(docs);
  await VehicleMake.insertMany(catalog.makes);
  await VehicleModel.insertMany(catalog.models);
  await VehicleFitment.insertMany(catalog.fitments);

  const verified = catalog.models.filter((m) => m.verified).length;
  console.log(
    `Seeded ${docs.length} products, ${catalog.makes.length} makes, ${catalog.models.length} models ` +
      `(${verified} with verified fitment, ${catalog.models.length - verified} unverified), ${catalog.fitments.length} fitment records`
  );
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
