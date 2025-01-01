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

const saveBookings = (bookings: any[]) => {
  try {
    const dir = path.dirname(BOOKINGS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
  } catch (err) {
    console.error('Error saving bookings:', err);
  }
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const bookings = getBookings();

    if (date) {
      const dateBookings = bookings.filter((booking: any) => booking.date === date);
      return NextResponse.json(dateBookings);
    }

    return NextResponse.json(bookings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get bookings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, date, time, guests } = body;

    if (!name || !email || !phone || !date || !time || !guests) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const bookings = getBookings();
    const isBooked = bookings.some((booking: any) => 
      booking.date === date && booking.time === time
    );

    if (isBooked) {
      return NextResponse.json({ error: 'This time slot is already booked' }, { status: 400 });
    }

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
    saveBookings(bookings);

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
} 