const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Path to store bookings data
const BOOKINGS_FILE = path.join(__dirname, '..', 'bookings.json');

// Load existing bookings from file
let bookings = [];
try {
  if (fs.existsSync(BOOKINGS_FILE)) {
    const data = fs.readFileSync(BOOKINGS_FILE, 'utf8');
    bookings = JSON.parse(data);
    console.log('Loaded existing bookings:', bookings);
  }
} catch (err) {
  console.error('Error loading bookings:', err);
}

// Save bookings to file
const saveBookings = () => {
  try {
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
    console.log('Bookings saved successfully');
  } catch (err) {
    console.error('Error saving bookings:', err);
  }
};

// Get all bookings or filter by date
router.get('/', (req, res) => {
  try {
    const { date } = req.query;
    console.log('Getting bookings for date:', date);

    if (date) {
      // Filter bookings by date
      const dateBookings = bookings.filter(booking => booking.date === date);
      console.log('Found bookings:', dateBookings);
      return res.json(dateBookings);
    }

    // Return all bookings if no date specified
    res.json(bookings);
  } catch (err) {
    console.error('Error getting bookings:', err);
    res.status(500).json({ error: 'Failed to get bookings' });
  }
});

// Get booking by ID
router.get('/:id', (req, res) => {
  try {
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

// Create new booking
router.post('/', (req, res) => {
  try {
    const { name, email, phone, date, time, guests } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !date || !time || !guests) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if slot is already booked
    const isBooked = bookings.some(booking => 
      booking.date === date && booking.time === time
    );

    if (isBooked) {
      return res.status(400).json({ error: 'This time slot is already booked' });
    }

    // Create new booking
    const booking = {
      id: Date.now().toString(),
      name,
      email,
      phone,
      date,
      time,
      guests: Number(guests),
      createdAt: new Date().toISOString()
    };

    bookings.push(booking);
    saveBookings();

    res.status(201).json(booking);
  } catch (err) {
    console.error('Error creating booking:', err);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Delete booking
router.delete('/:id', (req, res) => {
  try {
    const index = bookings.findIndex(b => b.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    bookings.splice(index, 1);
    saveBookings();

    res.json({ message: 'Booking deleted successfully' });
  } catch (err) {
    console.error('Error deleting booking:', err);
    res.status(500).json({ error: 'Failed to delete booking' });
  }
});

module.exports = router; 