const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

/**
 * Connect to MongoDB using the URI from environment variables.
 * Prioritizes persistent connection for local and cloud environments.
 */
async function connectDB() {
  const mode = process.env.DB_MODE || 'LOCAL';
  const uri = mode === 'PROD' ? process.env.PROD_MONGO_URI : process.env.LOCAL_MONGO_URI;

  console.log(`🔌 Initializing Real Database in [${mode}] mode...`);
  
  if (!uri) {
    console.error(`❌ FATAL: MONGO_URI for ${mode} is not defined in .env`);
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
    });
    
    console.log(`✅ MongoDB Successfully Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    console.error('❌ FATAL: Database connection failed!');
    console.error('Error details:', err.message);
    
    if (err.message.includes('ECONNREFUSED')) {
      console.warn('💡 Prompt: Make sure your MongoDB Server is RUNNING (Check Services).');
    }
    
    process.exit(1);
  }
}

module.exports = { connectDB };
