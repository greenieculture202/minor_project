const fs = require('fs');
const path = require('path');
const Plant = require('../models/Plant');
const User = require('../models/User');
const CareTip = require('../models/CareTip');

async function seedData() {
  const BACKUP_DIR = path.join(__dirname, '../db_backup');

  try {
    // 1. Seed Plants
    if (await Plant.countDocuments() === 0) {
      const filePath = path.join(BACKUP_DIR, 'plants.json');
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        await Plant.insertMany(data);
        console.log(`✅ Seeded ${data.length} plants from backup.`);
      } else {
        console.log('🌱 Seeding sample plant data...');
        const sample = [
          { name: "Snake Plant", price: 499, discountPrice: 399, category: 'Indoor', description: "Air purifying." },
          { name: "Monstera", price: 899, discountPrice: 749, category: 'Indoor', description: "Tropical vibes." }
        ];
        await Plant.insertMany(sample);
        console.log('✅ Sample plants seeded.');
      }
    }

    // 2. Seed Users
    if (await User.countDocuments() === 0) {
      const filePath = path.join(BACKUP_DIR, 'users.json');
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        await User.insertMany(data);
        console.log(`✅ Seeded ${data.length} users from backup.`);
      } else {
        await User.create({ name: 'Admin', email: 'admin@culture.com', password: 'radheradhe', role: 'admin' });
        console.log('✅ Default admin created.');
      }
    }

    // 3. Seed Care Tips
    if (await CareTip.countDocuments() === 0) {
      const filePath = path.join(BACKUP_DIR, 'caretips.json');
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        await CareTip.insertMany(data);
        console.log(`✅ Seeded ${data.length} care tips from backup.`);
      }
    }

  } catch (err) {
    console.error('❌ Seeding error:', err.message);
  }
}

module.exports = { seedData };
