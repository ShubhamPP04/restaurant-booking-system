import { NextResponse } from 'next/server'

let bookings: any[] = []

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
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    )
  }
} 