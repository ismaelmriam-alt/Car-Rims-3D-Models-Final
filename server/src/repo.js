// MongoDB repository: the only place that talks to Mongoose for the Phase 2 routes.
import Product from './models/Product.js';
import VehicleMake from './models/VehicleMake.js';
import VehicleModel from './models/VehicleModel.js';
import VehicleFitment from './models/VehicleFitment.js';
import Order from './models/Order.js';

export const mongoRepo = {
  listMakes: () => VehicleMake.find().sort({ name: 1 }).lean(),
  listAllModels: () => VehicleModel.find().lean(),
  listModels: (makeSlug) => VehicleModel.find({ makeSlug }).sort({ name: 1 }).lean(),
  getModel: (makeSlug, slug) => VehicleModel.findOne({ makeSlug, slug }).lean(),
  listFitmentsForModel: (makeSlug, modelSlug) => VehicleFitment.find({ makeSlug, modelSlug }).lean(),
  getFitment: (key) => VehicleFitment.findOne({ key }).lean(),
  listProducts: () => Product.find().sort({ name: 1 }).lean(),
  getProduct: (slug) => Product.findOne({ slug }).lean(),
  async createOrder(doc) {
    const created = await Order.create(doc);
    return created.toObject();
  },
  getOrder: (orderNumber) => Order.findOne({ orderNumber }).lean(),
};
