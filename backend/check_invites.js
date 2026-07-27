import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { connectDB } from './src/config/database.js';
import { TeamInvitation } from './src/models/TeamInvitation.model.js';
import { StudentData } from './src/models/StudentData.model.js';

const run = async () => {
  await connectDB();
  const allInvites = await TeamInvitation.find().populate('leader', 'prn').populate('invitee', 'prn');
  console.log('All Invites:', JSON.stringify(allInvites, null, 2));
  process.exit(0);
};
run();
