const mongoose = require('mongoose');
const User = require('./models/User');

async function seedAdmin() {
    try {
        await mongoose.connect('mongodb://localhost:27017/greenie');
        const email = 'admin@culture.com';
        const password = 'radheradhe';
        const name = 'Admin Culture';

        const existing = await User.findOne({ email });
        if (existing) {
            existing.password = password;
            existing.role = 'admin';
            await existing.save();
            console.log('Admin user updated');
        } else {
            const admin = new User({ name, email, password, role: 'admin' });
            await admin.save();
            console.log('Admin user created');
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seedAdmin();
