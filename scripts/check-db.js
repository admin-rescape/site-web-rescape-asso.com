const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db');
if (!fs.existsSync(dbPath)) {
    console.error("Database not found at " + dbPath);
    process.exit(1);
}

const db = new Database(dbPath, { fileMustExist: true });

let user = db.prepare("SELECT * FROM User WHERE email = 'direction@rescape-asso.com'").get();
if (!user) {
    console.log("User 'direction@rescape-asso.com' not found. Creating...");
    const hash = bcrypt.hashSync('Rescape2026!', 10);
    const id = 'DIRECTION-' + Date.now();
    db.prepare(`INSERT INTO User (id, name, email, password, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`)
        .run(id, 'Directeur Test', 'direction@rescape-asso.com', hash, 'DIRECTION');
    user = db.prepare("SELECT * FROM User WHERE email = 'direction@rescape-asso.com'").get();
    console.log("User inserted.");
} else {
    console.log("User 'direction@rescape-asso.com' found in Database.");
}

console.log({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    passwordHash: user.password ? user.password.substring(0, 7) + '...' : null
});
db.close();
