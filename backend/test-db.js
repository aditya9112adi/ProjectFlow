import mongoose from 'mongoose';
import { Project } from './src/models/Project.model.js';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const projects = await Project.find({}).lean();
  console.log("ALL PROJECTS:", JSON.stringify(projects, null, 2));
  process.exit(0);
});
