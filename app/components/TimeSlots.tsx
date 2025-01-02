'use client'

import { useEffect, useState } from 'react'

interface Props {
  selectedDate: string
  selectedTime: string
  onTimeSelect: (time: string) => void
}

interface Availability {
  date: string
  hasSlots: boolean
  availableSlots: number
  availableTimes: string[]
}

export default function TimeSlots({ selectedDate, selectedTime, onTimeSelect }: Props) {
  const [availability, setAvailability] = useState<Availability | null>(null)
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
    const fetchAvailability = async () => {
      if (!selectedDate) return

      try {
        setLoading(true)
        setError('')

        console.log('Fetching availability for date:', selectedDate)
        const response = await fetch(`/api/availability?start=${selectedDate}&end=${selectedDate}`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          method: 'GET'
        })

        console.log('Response status:', response.status)

        if (!response.ok) {
          let errorMessage = 'Failed to fetch availability'
          try {
            const errorData = await response.json()
            errorMessage = errorData.error || errorMessage
          } catch (e) {
            console.error('Error parsing error response:', e)
          }
          throw new Error(errorMessage)
        }

        const data = await response.json()
        console.log('Received availability:', data)
        setAvailability(data[0]) // Get first day's availability since we're only requesting one day
      } catch (err) {
        console.error('Error fetching availability:', err)
        setError(err instanceof Error ? err.message : 'Failed to load available time slots')
      } finally {
        setLoading(false)
      }
    }

    fetchAvailability()
  }, [selectedDate])

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
    if (!availability) return false
    const isToday = selectedDate === currentTime.toISOString().split('T')[0]
    if (isToday) {
      const [hours, minutes] = time.split(':')
      const slotTime = new Date(selectedDate)
      slotTime.setHours(parseInt(hours), parseInt(minutes))
      if (slotTime <= currentTime) return false
    }
    return availability.availableTimes.includes(time)
  }

  const getTimeSlotsByPeriod = () => {
    const allTimes = availability?.availableTimes || []
    const slots = {
      morning: allTimes.filter(time => {
        const hour = parseInt(time.split(':')[0])
        return hour >= 11 && hour < 15 && isTimeSlotAvailable(time)
      }),
      afternoon: allTimes.filter(time => {
        const hour = parseInt(time.split(':')[0])
        return hour >= 15 && hour < 18 && isTimeSlotAvailable(time)
      }),
      evening: allTimes.filter(time => {
        const hour = parseInt(time.split(':')[0])
        return hour >= 18 && hour <= 21 && isTimeSlotAvailable(time)
      })
    }
    return slots
  }

  const getSlotStats = (slots: string[]) => {
    const total = slots.length
    const available = slots.filter(time => isTimeSlotAvailable(time)).length
    const booked = total - available
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
                const isAvailable = isTimeSlotAvailable(time)

                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => isAvailable && onTimeSelect(time)}
                    disabled={!isAvailable}
                    className={`
                      relative px-4 py-3.5 text-sm rounded-xl transition-all duration-300
                      ${!isAvailable 
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
                      {isAvailable && !isSelected && (
                        <span className="text-[10px] text-gray-500 group-hover:text-emerald-500">
                          Available
                        </span>
                      )}
                    </div>
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