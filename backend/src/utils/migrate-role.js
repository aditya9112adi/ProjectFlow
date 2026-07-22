import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';

// Connect using native mongodb driver or mongoose model
// Let's connect and update the DB using mongoose connection
const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    const result = await usersCollection.updateMany(
      { role: 'instructor' },
      { $set: { role: 'admin' } }
    );

    console.log(`Migration complete. Modified ${result.modifiedCount} documents.`);
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

migrate();
