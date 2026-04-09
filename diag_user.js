const path = require('path');
const fs = require('fs');
const envPath = path.join(__dirname, 'backend', '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
console.log('✅ Found .env at:', envPath);

// Manually parse env just in case
const localUriLine = envContent.split('\n').find(l => l.startsWith('LOCAL_MONGO_URI='));
const localUri = localUriLine.split('=')[1].trim();
console.log('🔌 Extracted URI:', localUri);

const mongoose = require('mongoose');
const User = require('./backend/models/User');

async function diag() {
  try {
    await mongoose.connect(localUri);
    console.log('✅ Connected to MongoDB.');
    const u = await User.findOne({ email: 'nobita@gmail.com' });
    if (u) {
      console.log('✅ USER_STATUS: FOUND');
      console.log(JSON.stringify(u, null, 2));
    } else {
      console.log('❌ USER_STATUS: NOT_FOUND');
    }
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Mongoose Connection Error!', err.message);
  }
}

diag();
