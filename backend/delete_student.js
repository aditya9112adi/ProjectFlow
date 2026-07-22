import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { StudentData } from './src/models/StudentData.model.js';

async function deleteStudent() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const result = await StudentData.deleteOne({ prn: '252129001@sguk.ac.in' });
    console.log(`Deleted ${result.deletedCount} record(s).`);
  } catch (error) {
    console.error('Error deleting student:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

deleteStudent();
