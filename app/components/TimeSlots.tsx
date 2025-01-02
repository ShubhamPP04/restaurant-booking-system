'use client'

import { useEffect, useState } from 'react'

interface Props {
  selectedDate: string
  selectedTime: string
  onTimeSelect: (time: string) => void
}

interface Booking {
  id: string
  time: string
  guests: number
}

export default function TimeSlots({ selectedDate, selectedTime, onTimeSelect }: Props) {
  const [bookedSlots, setBookedSlots] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    // Update current time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // 60000 ms = 1 minute

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const fetchBookings = async () => {
      if (!selectedDate) return

      try {
        setLoading(true)
        setError('')

        console.log('Fetching bookings for date:', selectedDate)
        const response = await fetch(`/api/bookings?date=${selectedDate}`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          method: 'GET'
        })

        console.log('Response status:', response.status)

        if (!response.ok) {
          let errorMessage = 'Failed to fetch bookings'
          try {
            const errorData = await response.json()
            errorMessage = errorData.error || errorMessage
          } catch (e) {
            console.error('Error parsing error response:', e)
          }
          throw new Error(errorMessage)
        }

        const bookings = await response.json()
        console.log('Received bookings:', bookings)
        setBookedSlots(bookings)
      } catch (err) {
        console.error('Error fetching bookings:', err)
        setError(err instanceof Error ? err.message : 'Failed to load available time slots')
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [selectedDate])

  const generateTimeSlots = () => {
    const slots: string[] = []
    for (let hour = 11; hour <= 21; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        slots.push(time)
      }
    }
    return slots
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

  const isTimeSlotAvailable = (time: string) => {
    const [hours, minutes] = time.split(':')
    const slotTime = new Date(selectedDate)
    slotTime.setHours(parseInt(hours), parseInt(minutes))

    const isToday = selectedDate === currentTime.toISOString().split('T')[0]
    if (isToday && slotTime <= currentTime) {
      return false
    }
    return true
  }

  const getTimeSlotsByPeriod = () => {
    const allSlots = generateTimeSlots()
    const slots = {
      morning: allSlots.filter(time => {
        const hour = parseInt(time.split(':')[0])
        return hour >= 11 && hour < 15 && isTimeSlotAvailable(time)
      }),
      afternoon: allSlots.filter(time => {
        const hour = parseInt(time.split(':')[0])
        return hour >= 15 && hour < 18 && isTimeSlotAvailable(time)
      }),
      evening: allSlots.filter(time => {
        const hour = parseInt(time.split(':')[0])
        return hour >= 18 && hour <= 21 && isTimeSlotAvailable(time)
      })
    }
    return slots
  }

  const getSlotStats = (slots: string[]) => {
    const total = slots.length
    const booked = slots.filter(time => bookedSlots.some(booking => booking.time === time)).length
    const available = total - booked
    return { total, booked, available }
  }

  if (!selectedDate) {
    return (
      <div className="text-gray-500 text-sm mt-2 text-center p-6 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
        <p className="font-medium">Please select a date to view available time slots</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
          <p className="text-sm text-gray-600 animate-pulse">Loading available time slots...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-600 text-sm mt-2 text-center p-6 border border-red-200 rounded-xl bg-red-50">
        <div className="flex flex-col items-center gap-2">
          <svg className="h-6 w-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="font-medium">{error}</p>
        </div>
      </div>
    )
  }

  const periods = getTimeSlotsByPeriod()
  const isToday = selectedDate === currentTime.toISOString().split('T')[0]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-sm"></span>
            <span className="text-sm font-medium text-gray-600">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-gradient-to-r from-gray-300 to-gray-400 shadow-sm"></span>
            <span className="text-sm font-medium text-gray-600">Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 shadow-sm"></span>
            <span className="text-sm font-medium text-gray-600">Selected</span>
          </div>
        </div>
        {isToday && (
          <div className="text-sm font-medium text-gray-600">
            Current Time: {currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
          </div>
        )}
      </div>

      {Object.entries({
        'Morning (11 AM - 3 PM)': periods.morning,
        'Afternoon (3 PM - 6 PM)': periods.afternoon,
        'Evening (6 PM - 9 PM)': periods.evening
      }).map(([title, slots]) => {
        const stats = getSlotStats(slots)
        return slots.length > 0 && (
          <div key={title} className="space-y-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                {title}
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                  {stats.available} available
                </span>
                <span className="text-xs font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                  {stats.booked} booked
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {slots.map((time) => {
                const isSelected = time === selectedTime
                const isBooked = bookedSlots.some(booking => booking.time === time)
                const booking = bookedSlots.find(b => b.time === time)

                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => !isBooked && onTimeSelect(time)}
                    disabled={isBooked}
                    className={`
                      relative px-4 py-3.5 text-sm rounded-xl transition-all duration-300
                      ${isBooked 
                        ? 'bg-gray-50 border-2 border-gray-200 text-gray-400 cursor-not-allowed'
                        : isSelected 
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg transform hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] border-2 border-transparent' 
                          : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-emerald-500 hover:text-emerald-600 hover:shadow-md active:scale-[0.98] hover:bg-emerald-50/30'
                      }
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500
                      group
                    `}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className={`font-semibold ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                        {formatTime(time)}
                      </span>
                      {!isBooked && !isSelected && (
                        <span className="text-[10px] text-gray-500 group-hover:text-emerald-500">
                          Available
                        </span>
                      )}
                    </div>
                    {isBooked && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-gray-50/95 backdrop-blur-[2px] border-2 border-gray-200">
                        <div className="flex flex-col items-center gap-1">
                          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          <span className="text-[10px] font-medium text-gray-500">
                            Booked
                            {booking && ` (${booking.guests} guest${booking.guests > 1 ? 's' : ''})`}
                          </span>
                        </div>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
} 