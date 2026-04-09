const mongoose = require('mongoose');
require('dotenv').config();
const Order = require('./models/Order');

async function cleanup() {
    try {
        await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to DB');

        const orders = await Order.find().sort({ createdAt: -1 }).limit(10);
        console.log('Recent Orders:');
        orders.forEach(o => {
            console.log(`ID: ${o._id}, CreatedAt: ${o.createdAt}, Total: ${o.totalAmount}, Suffix: ${o._id.toString().slice(-6)}`);
        });

        // Find duplicates (identical user, items, total, and created within 10 seconds)
        // For now, I'll manually target the ones from the screenshot if they exist.
        // User saw #62605 and #726887
        
        const targetSuffixes = ['62605', '726887'];
        const found = orders.filter(o => targetSuffixes.includes(o._id.toString().slice(-6)));
        
        if (found.length >= 2) {
            console.log('Found duplicate orders. Deleting the newer one (or one of them).');
            // Keep the earliest one
            const sorted = found.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            const toDelete = sorted.slice(1);
            
            for (const order of toDelete) {
                await Order.deleteOne({ _id: order._id });
                console.log(`Deleted order: ${order._id}`);
            }
        } else {
            console.log('No duplicates found with those suffixes in the last 10 orders.');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

cleanup();
