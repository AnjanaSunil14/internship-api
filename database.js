const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

// 1. Connect to SQLite database
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// 2. Create the internships table if it does not exist
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS internships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      company TEXT NOT NULL,
      domain TEXT NOT NULL,
      location TEXT,
      stipend TEXT,
      description TEXT
    )
  `, (err) => {
    if (err) {
      console.error('Table creation error:', err.message);
      return;
    }

    // 3. Check if the table is empty, then seed data from the JSON file
    db.get("SELECT COUNT(*) AS count FROM internships", (err, row) => {
      if (err) {
        console.error('Error checking count:', err.message);
        return;
      }
      
      if (row.count === 0) {
        console.log('Database is empty. Seeding records from JSON...');
        
        const rawData = fs.readFileSync('./internship-records.json', 'utf8');
        const parsedData = JSON.parse(rawData);

        const internships = Array.isArray(parsedData) 
          ? parsedData 
          : (parsedData.internships || Object.values(parsedData).find(Array.isArray) || []);

        const stmt = db.prepare(`
          INSERT INTO internships (title, company, domain, location, stipend, description) 
          VALUES (?, ?, ?, ?, ?, ?)
        `);

        internships.forEach(item => {
          stmt.run(
            item.title || 'Untitled Internship', 
            item.company || item.company_name || 'Unknown Company', 
            item.domain || 'General', 
            item.location || 'Remote', 
            item.stipend || 'Unpaid', 
            item.description || ''
          );
        });

        stmt.finalize();
        console.log('Seed records inserted successfully!');
      } else {
        console.log('Database already has records. Skipping seed.');
      }
    });
  });
});

module.exports = db;