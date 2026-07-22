const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({path: './.env'});

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const pass = await bcrypt.hash('admin123', 12);
  await mongoose.connection.db.collection('admins').updateOne(
    {email: 'admin@university.edu'},
    {$set: {firstName: 'System', lastName: 'Admin', email: 'admin@university.edu', password: pass, role: 'admin', isActive: true}},
    {upsert: true}
  );
  console.log('Admin seeded!');
  process.exit(0);
});
