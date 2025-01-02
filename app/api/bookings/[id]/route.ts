import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const BOOKINGS_FILE = path.join(process.cwd(), 'data', 'bookings.json')

async function getBookings() {
  try {
    const data = await fs.readFile(BOOKINGS_FILE, 'utf8')
    return JSON.parse(data)
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      // If file doesn't exist, create it with empty array
      await fs.mkdir(path.dirname(BOOKINGS_FILE), { recursive: true })
      await fs.writeFile(BOOKINGS_FILE, '[]')
      return []
    }
    console.error('Error loading bookings:', err)
    return []
  }
}

async function saveBookings(bookings: any[]) {
  try {
    await fs.mkdir(path.dirname(BOOKINGS_FILE), { recursive: true })
    await fs.writeFile(BOOKINGS_FILE, JSON.stringify(bookings, null, 2))
  } catch (err) {
    console.error('Error saving bookings:', err)
    throw err
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookings = await getBookings()
    const booking = bookings.find((b: any) => b.id === params.id)

    if (!booking) {
      console.log('Booking not found:', params.id)
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error('Error getting booking:', error)
    return NextResponse.json(
      { error: 'Failed to get booking' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookings = await getBookings()
    const index = bookings.findIndex((b: any) => b.id === params.id)

    if (index === -1) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    bookings.splice(index, 1)
    await saveBookings(bookings)

    return NextResponse.json({ message: 'Booking deleted successfully' })
  } catch (error) {
    console.error('Error deleting booking:', error)
    return NextResponse.json(
      { error: 'Failed to delete booking' },
      { status: 500 }
    )
  }
} 