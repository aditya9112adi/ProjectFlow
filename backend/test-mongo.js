import mongoose from 'mongoose';
import { Project } from './src/models/Project.model.js';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const project = await Project.findOne({});
  const collection = mongoose.connection.collection('projects');
  
  await collection.updateOne(
    { _id: project._id },
    { $set: { 'phases.prototype': { status: 'submitted', submittedAt: new Date() } } }
  );
  
  const doc = await collection.findOne({ _id: project._id });
  console.log("Raw mongo phases:", JSON.stringify(doc.phases));
  
  const savedProject = await Project.findById(project._id).lean();
  console.log("Mongoose phases:", JSON.stringify(savedProject.phases));
  
  process.exit(0);
});
