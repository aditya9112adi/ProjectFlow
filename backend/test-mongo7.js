import mongoose from 'mongoose';
import { Project } from './src/models/Project.model.js';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const projects = await Project.find({
    isActive: true,
    $or: [
      { 'phases.proposal.status': 'submitted' },
      { 'phases.ppt.status': 'submitted' },
      { 'phases.report.status': 'submitted' },
      { 'phases.prototypePhase.status': 'submitted' },
    ],
  });
  console.log("Found projects:", projects.length);
  process.exit(0);
});
