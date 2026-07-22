import mongoose from 'mongoose';
import { Project } from './src/models/Project.model.js';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const collection = mongoose.connection.collection('projects');
  
  // Find all projects that have a prototypeId but no phases.prototype or status != submitted/approved
  const projects = await collection.find({ prototypeId: { $exists: true, $ne: null } }).toArray();
  for (const project of projects) {
    if (!project.phases || !project.phases.prototype || project.phases.prototype.status === 'not_started') {
      console.log(`Fixing project ${project._id}`);
      await collection.updateOne(
        { _id: project._id },
        {
          $set: {
            'phases.prototype': { status: 'submitted', submittedAt: new Date(), version: 1, reviews: [] }
          }
        }
      );
    }
  }
  
  console.log("Done");
  process.exit(0);
});
