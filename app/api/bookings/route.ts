import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const BOOKINGS_FILE = path.join(process.cwd(), 'data', 'bookings.json');

async function getBookings() {
  try {
    const data = await fs.readFile(BOOKINGS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      // If file doesn't exist, create it with empty array
      await fs.mkdir(path.dirname(BOOKINGS_FILE), { recursive: true });
      await fs.writeFile(BOOKINGS_FILE, '[]');
      return [];
    }
    console.error('Error loading bookings:', err);
    return [];
  }
}

async function saveBookings(bookings: any[]) {
  try {
    await fs.mkdir(path.dirname(BOOKINGS_FILE), { recursive: true });
    await fs.writeFile(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
  } catch (err) {
    console.error('Error saving bookings:', err);
    throw err;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    
    const bookings = await getBookings();
    
    if (date) {
      return NextResponse.json(
        bookings.filter((booking: any) => booking.date === date)
      );
    }
    
    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error getting bookings:', error);
    return NextResponse.json(
      { error: 'Failed to get bookings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const bookingData = await request.json();
    const bookings = await getBookings();

    // Generate a unique ID based on timestamp
    const booking = {
      ...bookingData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };

    // Check for existing booking at the same time
    const existingBooking = bookings.find(
      (b: any) => b.date === booking.date && b.time === booking.time
    );

    if (existingBooking) {
      return NextResponse.json(
        { error: 'This time slot is already booked' },
        { status: 400 }
      );
    }

    bookings.push(booking);
    await saveBookings(bookings);

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
} 