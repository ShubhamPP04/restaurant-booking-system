import { NextRequest, NextResponse } from 'next/server';
import { getBookings, createBooking } from '@/app/lib/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    
    const data = await getBookings(date || undefined);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error getting bookings:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get bookings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const bookingData = await request.json();
    const data = await createBooking(bookingData);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create booking' },
      { status: 500 }
    );
  }
} 