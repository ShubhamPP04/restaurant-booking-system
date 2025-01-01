const express = require('express');
const cors = require('cors');
const bookingsRouter = require('./routes/bookings');
const availabilityRouter = require('./routes/availability');

const app = express();
const port = process.env.PORT || 5001;
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';

// Middleware
app.use(cors({
  origin: [corsOrigin, 'http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Origin', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json());

// Log middleware for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, {
    query: req.query,
    body: req.body,
    headers: req.headers
  });
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Routes
app.use('/api/bookings', bookingsRouter);
app.use('/api/availability', availabilityRouter);

// Log available routes
console.log('Available routes:');
console.log('POST   /api/bookings     - Create booking');
console.log('GET    /api/availability - Check availability');
console.log('GET    /api/bookings/:id - Get booking by ID');
console.log('GET    /api/bookings     - Get all bookings');
console.log('DELETE /api/bookings/:id - Delete booking');

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`CORS enabled for origins: ${corsOrigin}, http://localhost:3000, http://localhost:3001`);
}); 