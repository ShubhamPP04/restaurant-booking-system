'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

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
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchBooking = async () => {
      const id = searchParams.get('id')
      if (!id) {
        setError('Booking ID not found')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/bookings/${id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch booking details')
        }
        const data = await response.json()
        setBooking(data)
      } catch (err) {
        setError('Could not load booking details')
      } finally {
        setLoading(false)
      }
    }

    fetchBooking()
  }, [searchParams])

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <p className="text-gray-600">Loading your booking details...</p>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Booking Not Found
            </h2>
            <p className="text-gray-600 mb-8">
              {error || 'Sorry, we could not find your booking.'}
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-emerald-600 hover:bg-emerald-700"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-2xl rounded-3xl overflow-hidden print:shadow-none">
          {/* Header Section */}
          <div className="relative bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-12 print:bg-emerald-600">
            <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
            <div className="relative">
              <div className="flex justify-center mb-8">
                <div className="rounded-full bg-white/90 backdrop-blur-sm p-3 shadow-lg">
                  <svg className="h-12 w-12 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h1 className="text-4xl font-bold text-center text-white mb-4">
                Booking Confirmed!
              </h1>
              <p className="text-center text-emerald-50 text-lg">
                Thank you for choosing our restaurant
              </p>
            </div>
          </div>

          {/* Content Section */}
          <div className="px-8 py-10">
            <div className="space-y-8">
              {/* Booking Reference */}
              <div className="flex flex-col items-center gap-2 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <span className="text-sm font-medium text-emerald-600">Booking Reference</span>
                <span className="text-2xl font-bold text-emerald-700 font-mono">{booking.id}</span>
              </div>

              {/* Main Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <span className="text-sm font-medium text-gray-500 block mb-1">Name</span>
                    <span className="text-lg font-semibold text-gray-900">{booking.name}</span>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl">
                    <span className="text-sm font-medium text-gray-500 block mb-1">Date</span>
                    <span className="text-lg font-semibold text-gray-900">{formatDate(booking.date)}</span>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl">
                    <span className="text-sm font-medium text-gray-500 block mb-1">Email</span>
                    <span className="text-lg font-semibold text-gray-900">{booking.email}</span>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <span className="text-sm font-medium text-gray-500 block mb-1">Number of Guests</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'}
                    </span>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl">
                    <span className="text-sm font-medium text-gray-500 block mb-1">Time</span>
                    <span className="text-lg font-semibold text-gray-900">{formatTime(booking.time)}</span>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl">
                    <span className="text-sm font-medium text-gray-500 block mb-1">Phone</span>
                    <span className="text-lg font-semibold text-gray-900">{booking.phone}</span>
                  </div>
                </div>
              </div>

              {/* Footer Section */}
              <div className="border-t border-gray-200 pt-8 mt-8 print:pb-0">
                <div className="bg-gray-50 p-6 rounded-2xl mb-8 print:bg-transparent">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Important Information</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Please arrive 10 minutes before your booking time</li>
                    <li>• Your table will be held for 15 minutes after your booking time</li>
                    <li>• For modifications or cancellations, please contact us at least 2 hours before</li>
                    <li>• A confirmation email has been sent to your email address</li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 print:hidden">
                  <Link
                    href="/"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 transition-all duration-200 transform hover:scale-105"
                  >
                    Return to Home
                  </Link>
                  <button
                    onClick={handlePrint}
                    className="inline-flex items-center px-6 py-3 border-2 border-emerald-600 text-base font-medium rounded-xl text-emerald-700 hover:bg-emerald-50 transition-all duration-200"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print Booking
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print-specific styles */}
      <style jsx global>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:bg-emerald-600 {
            background-color: #059669 !important;
          }
          .print\\:bg-transparent {
            background-color: transparent !important;
          }
          .print\\:pb-0 {
            padding-bottom: 0 !important;
          }
        }
      `}</style>
    </div>
  )
} 