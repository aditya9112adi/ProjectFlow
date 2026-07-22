import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });
import { getPendingReviews } from './src/services/project.service.js';

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const reviews = await getPendingReviews('fake-admin-id');
  console.log(JSON.stringify(reviews, null, 2));
  process.exit(0);
});
