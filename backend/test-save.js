import mongoose from 'mongoose';
import { Project } from './src/models/Project.model.js';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const project = await Project.findOne({});
  console.log("Before save:", JSON.stringify(project.phases.prototype));
  
  await Project.updateOne({ _id: project._id }, {
    $set: {
      'phases.prototype': { status: 'submitted', submittedAt: new Date(), version: 0, reviews: [] }
    }
  });
  
  const savedProject = await Project.findById(project._id).lean();
  console.log("After save (lean):", JSON.stringify(savedProject.phases));
  process.exit(0);
});
