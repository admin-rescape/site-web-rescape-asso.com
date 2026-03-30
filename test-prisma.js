const Database = require('better-sqlite3');

const db = new Database('./prisma/dev.db');

const tables = ['User', 'Stat', 'Action', 'TimelineEntry', 'TeamMember', 'SocialLink'];
for (const table of tables) {
	const row = db.prepare('SELECT COUNT(*) AS count FROM ' + table).get();
	console.log(table + ': ' + row.count);
}

const users = db.prepare('SELECT email, role FROM User ORDER BY email').all();
console.log('USERS', users);

db.close();
