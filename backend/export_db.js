const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const backupDir = path.join(__dirname, 'db_backup');
if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);

async function exportDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to DB');

        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();

        for (const col of collections) {
            const name = col.name;
            const data = await db.collection(name).find({}).toArray();
            fs.writeFileSync(path.join(backupDir, `${name}.json`), JSON.stringify(data, null, 2));
            console.log(`Exported ${name} (${data.length} documents)`);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

exportDB();
