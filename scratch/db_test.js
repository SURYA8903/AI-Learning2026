const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');
db.all('SELECT * FROM courses LIMIT 1', (err, rows) => {
  if (err) console.error(err);
  else console.log('Success:', rows);
  db.close();
});
