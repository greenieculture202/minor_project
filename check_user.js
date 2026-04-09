require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');
const { connectDB } = require('./backend/utils/db');
const User = require('./backend/models/User');

async function check() {
  console.log('🔍 Checking user in MongoDB...');
  await connectDB();
  const u = await User.findOne({ email: 'nobita@gmail.com' });
  if (u) {
    console.log('✅ Found User:', JSON.stringify(u, null, 2));
  } else {
    console.log('❌ User NOT found in MongoDB.');
  }
  process.exit(0);
}

check();
