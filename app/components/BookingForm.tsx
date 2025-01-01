'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import TimeSlots from './TimeSlots'
import Calendar from './Calendar'

interface ValidationErrors {
  [key: string]: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function BookingForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    guests: 1
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {}
    
    // Name validation
    if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters long'
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }

    // Phone validation
    const phoneRegex = /^\+?[\d\s-]{10,}$/
    if (!phoneRegex.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number (min 10 digits)'
    }

    // Date validation
    const selectedDate = new Date(formData.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (selectedDate < today) {
      errors.date = 'Please select a future date'
    }

    // Time validation
    if (!formData.time) {
      errors.time = 'Please select a time slot'
    }

    // Guests validation
    if (formData.guests < 1 || formData.guests > 10) {
      errors.guests = 'Number of guests must be between 1 and 10'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setValidationErrors(prev => ({
      ...prev,
      [name]: ''
    }))
    setError('')
  }

  const handleDateSelect = (date: string) => {
    setFormData(prev => ({
      ...prev,
      date,
      time: '' // Reset time when date changes
    }))
    setValidationErrors(prev => ({
      ...prev,
      date: '',
      time: ''
    }))
  }

  const handleTimeSelect = (time: string) => {
    setFormData(prev => ({
      ...prev,
      time
    }))
    setValidationErrors(prev => ({
      ...prev,
      time: ''
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      console.log('Submitting booking:', formData);
      const response = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Booking failed')
      }

      const data = await response.json()
      console.log('Booking successful:', data);
      router.push(`/booking-confirmation?id=${data.id}`)
    } catch (error) {
      console.error('Booking error:', error);
      setError(error instanceof Error ? error.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="bg-white shadow-2xl rounded-2xl p-8 space-y-6 transform transition-all duration-300 hover:shadow-3xl">
        {error && (
          <div className="p-4 text-red-700 bg-red-100 rounded-lg mb-6 animate-shake">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className={`block w-full px-4 py-3 rounded-lg border ${
                  validationErrors.name ? 'border-red-500' : 'border-gray-300'
                } shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200`}
                placeholder="Enter your name"
              />
              {validationErrors.name && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`block w-full px-4 py-3 rounded-lg border ${
                  validationErrors.email ? 'border-red-500' : 'border-gray-300'
                } shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200`}
                placeholder="you@example.com"
              />
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className={`block w-full px-4 py-3 rounded-lg border ${
                  validationErrors.phone ? 'border-red-500' : 'border-gray-300'
                } shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200`}
                placeholder="Your phone number"
              />
              {validationErrors.phone && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.phone}</p>
              )}
            </div>

            <div>
              <label htmlFor="guests" className="block text-sm font-semibold text-gray-700 mb-1">Number of Guests</label>
              <input
                type="number"
                id="guests"
                name="guests"
                required
                min="1"
                max="10"
                value={formData.guests}
                onChange={handleChange}
                className={`block w-full px-4 py-3 rounded-lg border ${
                  validationErrors.guests ? 'border-red-500' : 'border-gray-300'
                } shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200`}
              />
              {validationErrors.guests && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.guests}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">Maximum 10 guests per booking</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Select Date</label>
              <Calendar
                selectedDate={formData.date}
                onDateSelect={handleDateSelect}
              />
              {validationErrors.date && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.date}</p>
              )}
            </div>

            {formData.date && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Select Time</label>
                <TimeSlots
                  selectedDate={formData.date}
                  selectedTime={formData.time}
                  onTimeSelect={handleTimeSelect}
                />
                {validationErrors.time && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.time}</p>
                )}
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Booking...
            </span>
          ) : (
            'Book Table'
          )}
        </button>
      </form>
    </div>
  )
} 