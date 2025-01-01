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
  console.error('Error loading bookings for availability check:', err);
}

// Get availability for a date range
router.get('/', (req, res) => {
  try {
    const { start, end } = req.query;
    console.log('Checking availability for range:', { start, end });

    if (!start || !end) {
      return res.status(400).json({ error: 'Start and end dates are required' });
    }

    const startDate = new Date(start);
    const endDate = new Date(end);
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const availability = [];

    // Generate dates between start and end
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0];
      const dateBookings = bookings.filter(booking => booking.date === dateStr);
      
      // Get all booked time slots for this date
      const bookedTimeSlots = dateBookings.map(booking => booking.time);
      console.log(`Booked time slots for ${dateStr}:`, bookedTimeSlots);
      
      // For today, only consider future time slots
      let availableSlots = 0;
      if (dateStr === today) {
        // Count available future slots
        for (let hour = 11; hour <= 21; hour++) {
          for (let minute = 0; minute < 60; minute += 30) {
            const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            const isPastTime = hour < currentHour || (hour === currentHour && minute <= currentMinute);
            const isBooked = bookedTimeSlots.includes(time);
            
            if (!isPastTime && !isBooked) {
              availableSlots++;
            }
          }
        }
      } else if (dateStr > today) {
        // For future dates, count all unbooked slots
        const totalSlots = 21; // 11 AM to 9 PM, every 30 minutes
        availableSlots = totalSlots - bookedTimeSlots.length;
      }
      
      // Consider a date as having slots if it has at least one available slot
      const hasSlots = availableSlots > 0;
      availability.push({ 
        date: dateStr, 
        hasSlots, 
        availableSlots 
      });
    }

    console.log('Availability response:', availability);
    res.json(availability);
  } catch (err) {
    console.error('Error checking availability:', err);
    res.status(500).json({ error: 'Failed to check availability' });
  }
});

module.exports = router; 