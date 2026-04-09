require('dotenv').config();
const { connectDB } = require('./utils/db');
const mongoose = require('mongoose');

async function test() {
  console.log('🧪 Testing Database Connection Fallback...');
  await connectDB();
  console.log('🏁 Test completed. Connection status:', mongoose.connection.readyState);
  process.exit(0);
}

test();
