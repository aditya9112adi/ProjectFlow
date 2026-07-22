import mongoose from 'mongoose';
import { Project } from './src/models/Project.model.js';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const project = await Project.findOne();
  console.log("Transformed output:");
  console.log(JSON.stringify(project.toJSON()));
  process.exit(0);
});
