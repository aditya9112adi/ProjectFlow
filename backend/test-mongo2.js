import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const collection = mongoose.connection.collection('projects');
  const docs = await collection.find({ prototypeId: { $exists: true, $ne: null } }).toArray();
  docs.forEach(d => console.log(d._id, JSON.stringify(d.phases)));
  process.exit(0);
});
