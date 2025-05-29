const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
nbsp;

const app = express();
const PORT = process.env.PORT || 3000;
nbsp;
nbsp;

// Middleware
app.use(cors());
app.use(express.json());
nbsp;
nbsp;

// Initialize SQLite database (will create file 'contacts.db' if not exists)
const db = new sqlite3.Database(path.resolve(__dirname, 'contacts.db'), (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});
nbsp;
nbsp;

// Create Contact submissions table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
nbsp;
nbsp;

// Endpoint to receive contact form data
app.post('/contact', (req, res) => {
  const { name, email, subject, message } = req.body;
nbsp;
nbsp;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }
nbsp;
nbsp;

  const sql = `INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)`;
  db.run(sql, [name, email, subject || '', message], function(err) {
    if (err) {
      console.error('Database insert error:', err.message);
      return res.status(500).json({ error: 'Failed to save contact submission.' });
    }
    res.status(201).json({ message: 'Contact submission saved.', id: this.lastID });
  });
});
nbsp;
nbsp;

// Optional: Endpoint to retrieve all submissions (for testing)
app.get('/contacts', (req, res) => {
  db.all('SELECT * FROM contacts ORDER BY submitted_at DESC', (err, rows) => {
    if (err) {
      console.error('Database query error:', err.message);
      return res.status(500).json({ error: 'Failed to retrieve contacts.' });
    }
    res.json(rows);
  });
});
nbsp;
nbsp;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});