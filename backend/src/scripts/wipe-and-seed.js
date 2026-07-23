import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

import mongoose from 'mongoose';
import fs from 'fs';

// Import Models
import { StudentData } from '../models/StudentData.model.js';
import { Team } from '../models/Team.model.js';
import { Notification } from '../models/Notification.model.js';
import { PPTSubmission } from '../models/PPTSubmission.model.js';
import { Proposal } from '../models/Proposal.model.js';
import { ReportSubmission } from '../models/ReportSubmission.model.js';
import { StudentMarks } from '../models/StudentMarks.model.js';
import { TeamInvitation } from '../models/TeamInvitation.model.js';
import { TeamMarks } from '../models/TeamMarks.model.js';

const seedDatabase = async () => {
  try {
    console.log('🌱 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('🗑️  Wiping existing student-related data...');
    await Promise.all([
      StudentData.deleteMany({}),
      Team.deleteMany({}),
      Notification.deleteMany({}),
      PPTSubmission.deleteMany({}),
      Proposal.deleteMany({}),
      ReportSubmission.deleteMany({}),
      StudentMarks.deleteMany({}),
      TeamInvitation.deleteMany({}),
      TeamMarks.deleteMany({})
    ]);
    console.log('✅ All student-related dummy data wiped successfully!');

    console.log('📖 Reading original student data from CSV...');
    const csvPath = path.join(__dirname, 'students.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    
    const lines = csvContent.split('\n').map(line => line.trim()).filter(line => line);
    // Remove header row
    const headers = lines.shift(); 
    
    const studentsToInsert = lines.map(line => {
      // Split by comma
      const [name, prn, email] = line.split(',');
      let prnValue = email ? email.trim() : prn.trim();
      if (!prnValue.includes('@')) prnValue = `${prnValue}@sguk.ac.in`;
      
      return {
        studentName: name.trim(),
        prn: prnValue, // e.g. 252921001@sguk.ac.in
        role: 'student',
        isActive: true,
        department: 'General',
        academicYear: '2025'
      };
    });

    console.log(`🚀 Seeding ${studentsToInsert.length} original students...`);
    await StudentData.insertMany(studentsToInsert);
    console.log('✅ Students seeded successfully!');
    
  } catch (error) {
    console.error('❌ Error during wipe and seed:', error);
  } finally {
    console.log('🔌 Disconnecting...');
    await mongoose.disconnect();
    process.exit(0);
  }
};

seedDatabase();
