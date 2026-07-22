import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB for split table migration...');

    const db = mongoose.connection.db;
    
    // Get collections
    const usersCollection = db.collection('users');
    const adminsCollection = db.collection('admins');
    const studentDataCollection = db.collection('studentdatas');

    // Fetch all users
    const allUsers = await usersCollection.find({}).toArray();
    console.log(`Found ${allUsers.length} total users in 'users' collection.`);

    const adminsToInsert = [];
    const studentsToInsert = [];

    for (const user of allUsers) {
      if (user.role === 'admin') {
        adminsToInsert.push({
          ...user,
          role: 'admin'
        });
      } else if (user.role === 'student') {
        const studentName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
        const prn = user.rollNumber ? `${user.rollNumber}@sguk.ac.in` : undefined;
        
        if (!prn) {
          console.warn(`Skipping student ${studentName} due to missing rollNumber.`);
          continue;
        }

        studentsToInsert.push({
          _id: user._id, // Preserve IDs for relationships!
          studentName,
          prn,
          role: 'student',
          team: user.team,
          department: user.department || 'General',
          academicYear: user.academicYear || '2025',
          section: user.section,
          phoneNumber: user.phoneNumber,
          avatar: user.avatar,
          refreshToken: user.refreshToken,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        });
      }
    }

    if (adminsToInsert.length > 0) {
      // Clear existing if any for idempotency (be careful in production, but here it's safe)
      await adminsCollection.deleteMany({});
      await adminsCollection.insertMany(adminsToInsert);
      console.log(`Successfully migrated ${adminsToInsert.length} admins.`);
    }

    if (studentsToInsert.length > 0) {
      // Clear existing if any for idempotency
      await studentDataCollection.deleteMany({});
      // Insert in chunks to avoid max payload issues
      const chunkSize = 1000;
      for (let i = 0; i < studentsToInsert.length; i += chunkSize) {
        const chunk = studentsToInsert.slice(i, i + chunkSize);
        await studentDataCollection.insertMany(chunk);
      }
      console.log(`Successfully migrated ${studentsToInsert.length} students.`);
    }

    // Now delete the old users collection to clean up
    // await usersCollection.drop();
    console.log('Skipping dropping users collection just in case we need to rollback.');

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

migrate();
