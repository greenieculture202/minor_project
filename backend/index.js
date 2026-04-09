const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { connectDB } = require('./utils/db');
const Plant = require('./models/Plant');

const authRoutes = require('./routes/auth');
const plantRoutes = require('./routes/plants');
const cartRoutes = require('./routes/cart');
const adminRoutes = require('./routes/admin');

const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.set('io', io);

const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/plants', plantRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', require('./routes/orders'));
app.use('/api/care-tips', require('./routes/care'));
app.use('/api/blogs', require('./routes/blogs'));
app.use('/api/faqs', require('./routes/faqs'));

app.get('/', (req, res) => res.json({ ok: true, message: 'Greenie backend running' }));

const CareTip = require('./models/CareTip');
const User = require('./models/User');

connectDB()
  .then(async () => {
    console.log('📦 Database models initialized...');

    // Seed initial data if needed
    try {
      const { seedData } = require('./utils/seeder');
      await seedData();
    } catch (e) {
      console.warn('⚠️ Seeding skipped:', e.message);
    }

    server.listen(PORT, async () => {
      console.log(`🚀 Greenie Backend is live at: http://localhost:${PORT}`);
      console.log('📊 --- DATABASE STATUS REPORT ---');
      try {
        const plantCount = await Plant.countDocuments();
        const userCount = await User.countDocuments();
        const tipCount = await CareTip.countDocuments();
        const orderCount = await require('./models/Order').countDocuments();

        console.log(`   - 🌿 Plants: ${plantCount}`);
        console.log(`   - 👥 Users:  ${userCount}`);
        console.log(`   - 💡 Care Tips: ${tipCount}`);
        console.log(`   - 📦 Orders: ${orderCount}`);
        console.log('   Check MongoDB Compass for the "greenie" database.');
        console.log('---------------------------------');
      } catch (e) {
        console.error('❌ Connection verification error! Models cannot access DB.', e.message);
      }
    });
  })
  .catch((err) => {
    console.error('❌ FATAL: Backend failed to start due to database connection error.');
    console.error(err.message);
    process.exit(1);
  });
