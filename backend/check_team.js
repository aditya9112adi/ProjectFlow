import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { connectDB } from './src/config/database.js';
import { Team } from './src/models/Team.model.js';
import { StudentData } from './src/models/StudentData.model.js';

const run = async () => {
  await connectDB();
  const leader = await StudentData.findOne({ prn: /315/ });
  const team = await Team.findOne({ 'members.user': leader._id });
  console.log('Team:', team);
  process.exit(0);
};
run();
