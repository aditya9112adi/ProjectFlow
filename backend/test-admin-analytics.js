import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });
import { getAdminAnalytics } from './src/services/analytics.service.js';

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const analytics = await getAdminAnalytics();
  console.log("Analytics pendingItems:");
  console.log(JSON.stringify(analytics.pendingItems, null, 2));
  process.exit(0);
});
