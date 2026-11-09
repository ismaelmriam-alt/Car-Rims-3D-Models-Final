import 'dotenv/config';
import mongoose from 'mongoose';
import { createApp } from './app.js';
import { mongoRepo } from './repo.js';
import { createMemoryRepo } from './memoryRepo.js';

const PORT = process.env.PORT || 5000;

async function start() {
  let repo = createMemoryRepo();
  if (process.env.MONGO_URI) {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
    repo = mongoRepo;
  } else {
    console.log('Using in-memory catalog; set MONGO_URI to enable MongoDB persistence');
  }

  createApp(repo).listen(PORT, () => console.log(`RIMS API on http://localhost:${PORT}`));
}

start().catch((e) => {
  console.error('API startup failed:', e.message);
  process.exit(1);
});
