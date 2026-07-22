import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const collection = mongoose.connection.collection('projects');
  
  // Find all projects that have a prototypeId
  const projects = await collection.find({ prototypeId: { $exists: true, $ne: null } }).toArray();
  for (const project of projects) {
    let update = {};
    if (project.phases && project.phases.prototype) {
      update['phases.prototypePhase'] = project.phases.prototype;
      // We can optionally unset the old one, but Mongoose drops it anyway. Let's unset it cleanly.
      update['phases.prototype'] = "";
    } else {
      update['phases.prototypePhase'] = { status: 'submitted', submittedAt: new Date(), version: 1, reviews: [] };
    }
    
    console.log(`Fixing project ${project._id}`);
    await collection.updateOne(
      { _id: project._id },
      {
        $set: { 'phases.prototypePhase': update['phases.prototypePhase'] },
        $unset: { 'phases.prototype': "" }
      }
    );
  }
  
  console.log("Done");
  process.exit(0);
});
