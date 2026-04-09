const mongoose = require('mongoose');

async function listUsers() {
  const uri = 'mongodb://127.0.0.1:27017/greenie';
  try {
    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    const users = await db.collection('users').find({}).toArray();
    console.log('TOTAL_USERS:', users.length);
    users.forEach(u => {
      console.log(`- ${u.email} (Role: ${u.role}, Password: ${u.password})`);
    });
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error connecting to DB:', err.message);
  }
  process.exit(0);
}

listUsers();
