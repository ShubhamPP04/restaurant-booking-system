'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

interface Booking {
  id: string
  name: string
  email: string
  phone: string
  date: string
  time: string
  guests: number
  createdAt: string
}

export default function BookingConfirmation() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const bookingId = searchParams.get('id')
  
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const handlePrint = () => {
    window.print()
  }

  const handleNewBooking = () => {
    router.push('/')
  }

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!bookingId) {
        setError('No booking ID provided')
        setLoading(false)
        return
      }

      try {
        console.log('Fetching booking details for ID:', bookingId)
        const response = await fetch(`${API_URL}/api/bookings/${bookingId}`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          method: 'GET',
          cache: 'no-cache',
          mode: 'cors'
        })
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'Failed to fetch booking details')
        }

        const data = await response.json()
        console.log('Received booking details:', data)
        setBooking(data)
      } catch (err) {
        console.error('Error fetching booking details:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch booking details')
      } finally {
        setLoading(false)
      }
    }

    fetchBookingDetails()
  }, [bookingId])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center print:hidden">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-gray-600 animate-pulse">Loading booking details...</p>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center print:hidden">
        <div className="max-w-md w-full mx-auto p-8 bg-white rounded-2xl shadow-lg border border-red-100">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">Booking Not Found</h2>
            <p className="text-gray-600">{error || 'Unable to find the booking details'}</p>
            <button
              onClick={handleNewBooking}
              className="mt-4 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const timeObj = new Date()
    timeObj.setHours(parseInt(hours), parseInt(minutes))
    return timeObj.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <>
      <style jsx global>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .print-only {
            display: block !important;
          }
          .no-print {
            display: none !important;
          }
          .print-break-inside-avoid {
            break-inside: avoid;
          }
        }
      `}</style>

      <div className="min-h-[60vh] flex items-center justify-center p-4 print:p-0 print:min-h-0">
        <div className="max-w-2xl w-full mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 print:shadow-none print:border-0">
          <div className="p-8 print:p-0">
            <div className="flex flex-col items-center gap-6 text-center mb-8 print:mb-4">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center print:hidden">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="print-break-inside-avoid">
                <h2 className="text-2xl font-semibold text-gray-900">Booking Confirmation</h2>
                <p className="text-gray-600 mt-1">Restaurant Table Reservation</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-4">
                <div className="bg-gray-50 p-4 rounded-xl print:bg-transparent print:p-2 print:border print:border-gray-200">
                  <h3 className="text-sm font-medium text-gray-500">Booking ID</h3>
                  <p className="mt-1 text-lg font-semibold text-gray-900">{booking.id}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl print:bg-transparent print:p-2 print:border print:border-gray-200">
                  <h3 className="text-sm font-medium text-gray-500">Guest Name</h3>
                  <p className="mt-1 text-lg font-semibold text-gray-900">{booking.name}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl print:bg-transparent print:p-2 print:border print:border-gray-200">
                  <h3 className="text-sm font-medium text-gray-500">Date & Time</h3>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {formatDate(booking.date)} at {formatTime(booking.time)}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl print:bg-transparent print:p-2 print:border print:border-gray-200">
                  <h3 className="text-sm font-medium text-gray-500">Number of Guests</h3>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl print:bg-transparent print:p-2 print:border print:border-gray-200">
                  <h3 className="text-sm font-medium text-gray-500">Contact Email</h3>
                  <p className="mt-1 text-lg font-semibold text-gray-900">{booking.email}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl print:bg-transparent print:p-2 print:border print:border-gray-200">
                  <h3 className="text-sm font-medium text-gray-500">Contact Phone</h3>
                  <p className="mt-1 text-lg font-semibold text-gray-900">{booking.phone}</p>
                </div>
              </div>

              <div className="flex justify-center gap-4 pt-6 print:hidden">
                <button
                  onClick={handleNewBooking}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-indigo-600 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Return to Home
                </button>
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print Confirmation
                </button>
              </div>

              <div className="mt-8 text-center text-sm text-gray-500 print:mt-4">
                <p>Please keep this confirmation for your records.</p>
                <p className="mt-1">For any changes or cancellations, please contact us.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 