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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    if (date) {
      const filteredBookings = bookings.filter(booking => booking.date === date)
      return NextResponse.json(filteredBookings)
    }

    return NextResponse.json(bookings)
  } catch (err) {
    console.error('Error fetching bookings:', err)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const booking: Booking = await request.json()
    
    if (!booking.id || !booking.date || !booking.time || !booking.name || !booking.email || !booking.guests) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    bookings.push(booking)
    return NextResponse.json(booking, { status: 201 })
  } catch (err) {
    console.error('Error creating booking:', err)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Missing booking ID' },
        { status: 400 }
      )
    }

    const index = bookings.findIndex(booking => booking.id === id)
    if (index === -1) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    bookings.splice(index, 1)
    return NextResponse.json({ message: 'Booking deleted successfully' })
  } catch (err) {
    console.error('Error deleting booking:', err)
    return NextResponse.json(
      { error: 'Failed to delete booking' },
      { status: 500 }
    )
  }
} 