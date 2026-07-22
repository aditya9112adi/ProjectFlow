import mongoose from 'mongoose';
import { Project } from './src/models/Project.model.js';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const project = await Project.findOne();
  if (!project.phases.prototype) project.phases.prototype = {};
  project.phases.prototype.status = 'submitted';
  console.log("project.phases.prototype:", project.phases.prototype);
  console.log("Is prototype property enumerable?", Object.prototype.propertyIsEnumerable.call(project.phases, 'prototype'));
  process.exit(0);
});
