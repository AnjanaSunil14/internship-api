const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// 1. GET all internships (with pagination support e.g., ?page=1&limit=5)
app.get('/api/internships', (req, res) => {
  let { page = 1, limit = 10 } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);
  const offset = (page - 1) * limit;

  db.all(`SELECT * FROM internships LIMIT ? OFFSET ?`, [limit, offset], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    db.get(`SELECT COUNT(*) as total FROM internships`, (err, countRow) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({
        total: countRow.total,
        page,
        limit,
        data: rows
      });
    });
  });
});

// 2. GET a single internship by ID
app.get('/api/internships/:id', (req, res) => {
  const { id } = req.params;
  db.get(`SELECT * FROM internships WHERE id = ?`, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Internship not found' });
    }
    res.json(row);
  });
});

// 3. POST create a new internship (with input validation)
app.post('/api/internships', (req, res) => {
  const { title, company, domain, location, stipend, description } = req.body;
  
  if (!title || !company || !domain) {
    return res.status(400).json({ error: 'Missing required fields: title, company, and domain are required.' });
  }

  const query = `INSERT INTO internships (title, company, domain, location, stipend, description) VALUES (?, ?, ?, ?, ?, ?)`;
  db.run(query, [title, company, domain, location || 'Remote', stipend || 'Unpaid', description || ''], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({
      id: this.lastID,
      title,
      company,
      domain,
      location: location || 'Remote',
      stipend: stipend || 'Unpaid',
      description: description || ''
    });
  });
});

// 4. PUT update an existing internship
app.put('/api/internships/:id', (req, res) => {
  const { id } = req.params;
  const { title, company, domain, location, stipend, description } = req.body;

  if (!title || !company || !domain) {
    return res.status(400).json({ error: 'Missing required fields: title, company, and domain are required.' });
  }

  const query = `UPDATE internships SET title = ?, company = ?, domain = ?, location = ?, stipend = ?, description = ? WHERE id = ?`;
  db.run(query, [title, company, domain, location, stipend, description, id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Internship not found' });
    }
    res.json({ message: 'Internship updated successfully', id });
  });
});

// 5. DELETE an internship by ID
app.delete('/api/internships/:id', (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM internships WHERE id = ?`, [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Internship not found' });
    }
    res.json({ message: 'Internship deleted successfully', id });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});