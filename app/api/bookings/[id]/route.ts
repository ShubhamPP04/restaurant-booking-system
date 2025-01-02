import { NextRequest, NextResponse } from 'next/server'
import { getBooking, deleteBooking } from '@/app/lib/api'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!params.id) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    const data = await getBooking(params.id)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error getting booking:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get booking' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!params.id) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    const data = await deleteBooking(params.id)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error deleting booking:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete booking' },
      { status: 500 }
    )
  }
} 