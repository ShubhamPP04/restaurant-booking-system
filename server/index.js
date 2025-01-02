const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5001;

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Data file path
const BOOKINGS_FILE = path.join(__dirname, 'data', 'bookings.json');

// Ensure data directory and file exist
async function ensureDataFile() {
  try {
    await fs.mkdir(path.dirname(BOOKINGS_FILE), { recursive: true });
    try {
      await fs.access(BOOKINGS_FILE);
    } catch {
      await fs.writeFile(BOOKINGS_FILE, '[]');
    }
  } catch (err) {
    console.error('Error ensuring data file exists:', err);
  }
}

// Load bookings
async function loadBookings() {
  try {
    const data = await fs.readFile(BOOKINGS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error loading bookings:', err);
    return [];
  }
}

// Save bookings
async function saveBookings(bookings) {
  try {
    await fs.writeFile(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
    return true;
  } catch (err) {
    console.error('Error saving bookings:', err);
    return false;
  }
}

// Get all bookings or filter by date
app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await loadBookings();
    const { date } = req.query;

    if (date) {
      const filteredBookings = bookings.filter(booking => booking.date === date);
      return res.json(filteredBookings);
    }

    res.json(bookings);
  } catch (err) {
    console.error('Error getting bookings:', err);
    res.status(500).json({ error: 'Failed to get bookings' });
  }
});

// Get a specific booking
app.get('/api/bookings/:id', async (req, res) => {
  try {
    const bookings = await loadBookings();
    const booking = bookings.find(b => b.id === req.params.id);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(booking);
  } catch (err) {
    console.error('Error getting booking:', err);
    res.status(500).json({ error: 'Failed to get booking' });
  }
});

// Create a new booking
app.post('/api/bookings', async (req, res) => {
  try {
    const bookingData = req.body;
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'date', 'time', 'guests'];
    for (const field of requiredFields) {
      if (!bookingData[field]) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }

    const bookings = await loadBookings();

    // Check for existing booking at the same time
    const existingBooking = bookings.find(
      b => b.date === bookingData.date && b.time === bookingData.time
    );

    if (existingBooking) {
      return res.status(400).json({ error: 'This time slot is already booked' });
    }

    // Create new booking
    const booking = {
      ...bookingData,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };

    bookings.push(booking);
    const saved = await saveBookings(bookings);

    if (!saved) {
      return res.status(500).json({ error: 'Failed to save booking' });
    }

    res.status(201).json(booking);
  } catch (err) {
    console.error('Error creating booking:', err);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Delete a booking
app.delete('/api/bookings/:id', async (req, res) => {
  try {
    const bookings = await loadBookings();
    const index = bookings.findIndex(b => b.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    bookings.splice(index, 1);
    const saved = await saveBookings(bookings);

    if (!saved) {
      return res.status(500).json({ error: 'Failed to delete booking' });
    }

    res.json({ message: 'Booking deleted successfully' });
  } catch (err) {
    console.error('Error deleting booking:', err);
    res.status(500).json({ error: 'Failed to delete booking' });
  }
});

// Get availability for a date range
app.get('/api/availability', async (req, res) => {
  try {
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({ error: 'Start and end dates are required' });
    }

    const bookings = await loadBookings();
    const startDate = new Date(start);
    const endDate = new Date(end);
    const daysInRange = [];

    // Generate array of dates in range
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      daysInRange.push(new Date(d));
    }

    const AVAILABLE_TIMES = [
      '11:00', '11:30',
      '12:00', '12:30',
      '13:00', '13:30',
      '14:00', '14:30',
      '15:00', '15:30',
      '16:00', '16:30',
      '17:00', '17:30',
      '18:00', '18:30',
      '19:00', '19:30',
      '20:00', '20:30',
      '21:00', '21:30'
    ];

    const availability = daysInRange.map(date => {
      const dateStr = date.toISOString().split('T')[0];
      const bookedTimes = bookings
        .filter(booking => booking.date === dateStr)
        .map(booking => booking.time);

      const availableTimes = AVAILABLE_TIMES.filter(
        time => !bookedTimes.includes(time)
      );

      return {
        date: dateStr,
        hasSlots: availableTimes.length > 0,
        availableSlots: availableTimes.length,
        availableTimes
      };
    });

    res.json(availability);
  } catch (err) {
    console.error('Error getting availability:', err);
    res.status(500).json({ error: 'Failed to get availability' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Initialize data file and start server
ensureDataFile().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
  });
}); 