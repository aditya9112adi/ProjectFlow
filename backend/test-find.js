import mongoose from 'mongoose';
import { Project } from './src/models/Project.model.js';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const project = await Project.findOne({ prototypeId: { $exists: true } });
  if (project) {
    console.log("Lean:", await Project.findById(project._id).lean().then(d => d.phases.prototype));
    console.log("Document:", project.phases.prototype);
    console.log("JSON:", JSON.stringify(project.phases));
  }
  process.exit(0);
});
