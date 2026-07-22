import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const collection = mongoose.connection.collection('projects');
  const project = await collection.findOne({ prototypeId: { $exists: true, $ne: null } });
  console.log(JSON.stringify(project.phases));
  process.exit(0);
});
