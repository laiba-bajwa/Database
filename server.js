require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();

// DB Connection Pool
const db = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Test DB connection
db.getConnection((err, connection) => {
  if (err) {
    console.error('❌ DB connection failed:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to MySQL database');
  connection.release();
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Utils
const isValidDate = date => !isNaN(Date.parse(date));



// ========== 📚 Book Management ==========
app.post('/api/books', (req, res) => {
  const { title, author, isbn } = req.body;
  if (!title || !author || !isbn) return res.status(400).json({ error: "All fields required." });

  db.query('INSERT INTO books (title, author, isbn) VALUES (?, ?, ?)', [title, author, isbn], (err) => {
    if (err) return res.status(500).json({ error: "Failed to add book" });
    res.json({ message: "Book added successfully!" });
  });
});

app.get('/api/books', (req, res) => {
  db.query('SELECT * FROM books', (err, results) => {
    if (err) return res.status(500).json({ error: "Failed to fetch books" });
    res.json(results);
  });
});

// ========== 📦 Book Issuing ==========


// ========== 📦 Issue Book ==========
app.post('/api/issue', (req, res) => {
  const { book_id, member_id, issue_date, due_date } = req.body;

  // Validation
  if (!book_id || !member_id || !issue_date || !due_date) {
    return res.status(400).json({ error: 'All fields (book_id, member_id, issue_date, due_date) are required' });
  }

  const query = 'INSERT INTO issued_book (book_id, member_id, issue_date, due_date) VALUES (?, ?, ?, ?)';

  db.query(query, [book_id, member_id, issue_date, due_date], (err, result) => {
    if (err) {
      console.error('Error inserting into issued_book:', err);
      return res.status(500).json({ error: 'Failed to issue book', details: err.message });
    }
    res.json({ message: 'Book issued successfully!' });
  });
});


// ========== 🏢 Book Study Room ==========
app.post('/api/study-rooms', (req, res) => {
  const { room_id, member_id, booking_date, hours } = req.body;

  console.log('Received:', { room_id, member_id, booking_date, hours });

  if (!room_id || !member_id || !booking_date || !hours || !isValidDate(booking_date)) {
    return res.status(400).json({ error: "All fields and valid booking date required" });
  }

  if (hours <= 0 || hours > 8) {
    return res.status(400).json({ error: "Duration must be 1-8 hours" });
  }

  db.query(
    'SELECT * FROM study_rooms_booking WHERE room_id = ? AND booking_date = ?',
    [room_id, booking_date],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });

      if (results.length > 0) {
        return res.status(400).json({ error: "Room already booked for this date" });
      }

      db.query(
        'INSERT INTO study_rooms_booking (room_id, member_id, booking_date, duration_hours) VALUES (?, ?, ?, ?)',
        [room_id, member_id, booking_date, hours],
        (err) => {
          if (err) {
            console.error('Insert error:', err);
            return res.status(500).json({ error: "Failed to book room" });
          }
          res.json({ message: `Room booked for ${hours} hours!` });
        }
      );
    }
  );
});

// // Start server
// app.listen(5002, () => {
//   console.log("Server running on http://localhost:5002");
// });

// ========== 👤 Member Management ==========
app.post('/api/members', (req, res) => {
  const { name, email, contact } = req.body;
  if (!name || !email || !contact) return res.status(400).json({ error: "All fields required" });

  db.query('INSERT INTO members (name, email, contact) VALUES (?, ?, ?)', [name, email, contact], (err) => {
    if (err) return res.status(500).json({ error: "Failed to add member" });
    res.json({ message: "Member added successfully!" });
  });
});

app.get('/api/members', (req, res) => {
  db.query('SELECT * FROM members', (err, results) => {
    if (err) return res.status(500).json({ error: "Failed to fetch members" });
    res.json(results);
  });
});

// ========== 📌 Book Reservation ==========
app.post('/api/reserve', (req, res) => {
  const { book_id, member_id, reserve_date } = req.body;
  if (!book_id || !member_id || !reserve_date || !isValidDate(reserve_date)) {
    return res.status(400).json({ error: "All fields and valid reserve date required" });
  }

  db.query('INSERT INTO reserved_books (book_id, member_id, reserve_date) VALUES (?, ?, ?)',
    [book_id, member_id, reserve_date], (err) => {
      if (err) return res.status(500).json({ error: "Failed to reserve book" });
      res.json({ message: "Book reserved successfully!" });
    });
});

app.get('/api/reserved-books', (req, res) => {
  db.query('SELECT * FROM reserved_books', (err, results) => {
    if (err) return res.status(500).json({ error: "Failed to fetch reserved books" });
    res.json(results);
  });
});

// ========== 💰 Fine Management ==========
app.post('/api/fines', (req, res) => {
  const { member_id, fine_amount } = req.body;
  if (!member_id || fine_amount == null) return res.status(400).json({ error: "All fields required" });

  db.query('UPDATE members SET fine_amount = ? WHERE id = ?', [fine_amount, member_id], (err) => {
    if (err) return res.status(500).json({ error: "Failed to update fine" });
    res.json({ message: "Fine updated successfully!" });
  });
});

// ========== 🏢 Study Room Booking ==========

// Fallbacks
app.use((req, res) => res.status(404).json({ error: "Route not found" }));
app.use((err, req, res, next) => {
  console.error('⚠️ Server error:', err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// Start server
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
