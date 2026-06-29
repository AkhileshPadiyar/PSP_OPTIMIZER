const express = require('express');
const cors = require('cors');
const dashboardRoutes = require('./routes/dashboardRoutes');
const marketRoutes = require('./routes/marketRoutes');
const optimizerRoutes = require('./routes/optimizerRoutes');
const db = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend dev server
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

app.use(express.json());

// Mount routes
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/market', marketRoutes);
app.use('/api/v1/optimizer', optimizerRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'PSP Optimizer API is running.' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Test connection to DB on startup
db.getConnection()
  .then(conn => {
    console.log('Database connected successfully.');
    conn.release();
    
    // Start Server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });
