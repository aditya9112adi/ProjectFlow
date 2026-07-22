import mongoose from 'mongoose';
import { Admin } from './src/models/Admin.model.js';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const admin = await Admin.findOne().lean();
  console.log("Admin:", admin);
  process.exit(0);
});
