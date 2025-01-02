import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const BOOKINGS_FILE = path.join(process.cwd(), 'data', 'bookings.json')

const getBookings = () => {
  try {
    if (fs.existsSync(BOOKINGS_FILE)) {
      const data = fs.readFileSync(BOOKINGS_FILE, 'utf8')
      return JSON.parse(data)
    }
    return []
  } catch (err) {
    console.error('Error loading bookings:', err)
    return []
  }
}

const saveBookings = (bookings: any[]) => {
  try {
    const dir = path.dirname(BOOKINGS_FILE)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2))
  } catch (err) {
    console.error('Error saving bookings:', err)
  }
}

type RouteParams = {
  params: {
    id: string
  }
}

export async function GET(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const bookings = getBookings()
    const booking = bookings.find((b: any) => b.id === context.params.id)

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(booking)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get booking' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const bookings = getBookings()
    const index = bookings.findIndex((b: any) => b.id === context.params.id)

    if (index === -1) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    bookings.splice(index, 1)
    saveBookings(bookings)

    return NextResponse.json({ message: 'Booking deleted successfully' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete booking' },
      { status: 500 }
    )
  }
} 