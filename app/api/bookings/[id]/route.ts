import { NextResponse } from 'next/server'

interface Booking {
  id: string;
  date: string;
  time: string;
  name: string;
  email: string;
  guests: number;
}

const bookings: Booking[] = []

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const booking = bookings.find(b => b.id === params.id)

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(booking)
  } catch (err) {
    console.error('Error fetching booking:', err)
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const updatedBooking: Booking = await request.json()
    const index = bookings.findIndex(b => b.id === params.id)

    if (index === -1) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    bookings[index] = { ...bookings[index], ...updatedBooking }
    return NextResponse.json(bookings[index])
  } catch (err) {
    console.error('Error updating booking:', err)
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    )
  }
} 