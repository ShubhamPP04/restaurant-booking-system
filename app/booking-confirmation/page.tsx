import Link from 'next/link'

export default function BookingConfirmation() {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Booking Confirmed!
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Thank you for choosing our restaurant. Your booking has been confirmed.
          </p>
          <div className="inline-flex items-center justify-center">
            <Link
              href="/"
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 