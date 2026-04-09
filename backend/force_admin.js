const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const User = require('./models/User');

async function forceAdmin() {
  const uri = process.env.LOCAL_MONGO_URI || 'mongodb://127.0.0.1:27017/greenie';
  try {
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB.');

    // 1. Ensure the default hardcoded admin exists
    const adminEmail = 'admin@culture.com';
    const adminPass = 'radheradhe';
    
    await User.findOneAndUpdate(
      { email: adminEmail },
      { name: 'Admin', password: adminPass, role: 'admin' },
      { upsert: true, new: true }
    );
    console.log(`✅ Default Admin ready: ${adminEmail}`);

    // 2. ALSO make nobita@gmail.com an admin (since the user mentioned it)
    const extraEmail = 'nobita@gmail.com';
    const extraUser = await User.findOne({ email: extraEmail });
    if (extraUser) {
      extraUser.role = 'admin';
      await extraUser.save();
      console.log(`✅ User ${extraEmail} has been promoted to ADMIN.`);
    } else {
       // Create it if it doesn't exist, as the user might be trying to login with it
       await User.findOneAndUpdate(
         { email: extraEmail },
         { name: 'Nobita Admin', password: '123', role: 'admin' }, // Default password for now if missing
         { upsert: true, new: true }
       );
       console.log(`✅ Extra Admin ready: ${extraEmail}`);
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error forcing admin:', err.message);
  }
  process.exit(0);
}

forceAdmin();
