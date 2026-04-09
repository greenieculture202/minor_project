require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Dynamically select DB URI
const mode = process.env.DB_MODE || 'LOCAL';
const uri = mode === 'PROD' ? process.env.PROD_MONGO_URI : process.env.LOCAL_MONGO_URI;

const BACKUP_DIR = path.join(__dirname, '../db_backup');

// Import all models
const AboutSection = require('../models/CareTip'); // Mapping caretips.json to CareTip model if needed, adjust accordingly
const CareTip = require('../models/CareTip');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Plant = require('../models/Plant');
const User = require('../models/User');
const Visitor = require('../models/Visitor');

const modelMap = {
  'caretips.json': CareTip,
  'carts.json': Cart,
  'orders.json': Order,
  'plants.json': Plant,
  'users.json': User,
  'visitors.json': Visitor
};

async function importData() {
  try {
    console.log(`🚀 Starting data import to mode: ${mode}...`);
    console.log(`🔗 Target URI: ${uri.replace(/:([^@]+)@/, ":****@")}`); // Hide password in logs

    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB.');

    for (const [fileName, Model] of Object.entries(modelMap)) {
      const filePath = path.join(BACKUP_DIR, fileName);

      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        console.log(`📦 Importing ${fileName} (${data.length} records)...`);

        // Optional: clear existing data first
        await Model.deleteMany({});

        // Insert many
        await Model.insertMany(data);
        console.log(`   ✅ Success for ${fileName}`);
      } else {
        console.warn(`⚠️ skipping ${fileName} (File not found)`);
      }
    }

    console.log('🎉 --- ALL DATA IMPORTED SUCCESSFULLY ---');
    process.exit(0);
  } catch (err) {
    console.error('❌ Data import FAILED!');
    console.error(err);
    process.exit(1);
  }
}

importData();
