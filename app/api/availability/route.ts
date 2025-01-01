import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const BOOKINGS_FILE = path.join(process.cwd(), 'data', 'bookings.json');

const getBookings = () => {
  try {
    if (fs.existsSync(BOOKINGS_FILE)) {
      const data = fs.readFileSync(BOOKINGS_FILE, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (err) {
    console.error('Error loading bookings:', err);
    return [];
  }
};

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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 });
    }

    const bookings = getBookings();
    const bookedTimes = bookings
      .filter((booking: any) => booking.date === date)
      .map((booking: any) => booking.time);

    const availableTimes = AVAILABLE_TIMES.filter(time => !bookedTimes.includes(time));

    return NextResponse.json({
      date,
      availableTimes
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get availability' }, { status: 500 });
  }
} 