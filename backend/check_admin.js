const mongoose = require('mongoose');
const User = require('./models/User');

async function check() {
    try {
        await mongoose.connect('mongodb://localhost:27017/greenie');
        const user = await User.findOne({ email: 'demo@culture.com' });
        if (user) {
            console.log('User found:', JSON.stringify(user, null, 2));
        } else {
            console.log('User demo@culture.com not found');
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
