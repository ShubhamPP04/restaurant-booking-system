import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { eachDayOfInterval, format } from 'date-fns';

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    if (!start || !end) {
      return NextResponse.json({ error: 'Start and end dates are required' }, { status: 400 });
    }

    const startDate = new Date(start);
    const endDate = new Date(end);
    const daysInRange = eachDayOfInterval({ start: startDate, end: endDate });

    const bookings = getBookings();
    const availability = daysInRange.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const bookedTimes = bookings
        .filter((booking: any) => booking.date === dateStr)
        .map((booking: any) => booking.time);

      const availableTimes = AVAILABLE_TIMES.filter(time => !bookedTimes.includes(time));

      return {
        date: dateStr,
        hasSlots: availableTimes.length > 0,
        availableSlots: availableTimes.length,
        availableTimes
      };
    });

    return NextResponse.json(availability);
  } catch (error) {
    console.error('Error getting availability:', error);
    return NextResponse.json({ error: 'Failed to get availability' }, { status: 500 });
  }
} 