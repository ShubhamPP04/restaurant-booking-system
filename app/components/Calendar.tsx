'use client'

import { useEffect, useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns'

interface Props {
  selectedDate: string
  onDateSelect: (date: string) => void
}

interface Availability {
  date: string
  hasSlots: boolean
  availableSlots: number
  availableTimes: string[]
}

export default function Calendar({ selectedDate, onDateSelect }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [availabilities, setAvailabilities] = useState<Availability[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchMonthAvailability = async () => {
      try {
        setLoading(true)
        setError('')

        const startDate = startOfMonth(currentMonth)
        const endDate = endOfMonth(currentMonth)

        console.log('Fetching availability:', {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        })

        const response = await fetch(
          `/api/availability?start=${startDate.toISOString().split('T')[0]}&end=${endDate.toISOString().split('T')[0]}`,
          {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          }
        )

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
        console.log('Received availability data:', data)
        setAvailabilities(data)
      } catch (err) {
        console.error('Error fetching availability:', err)
        setError(err instanceof Error ? err.message : 'Failed to load availability')
      } finally {
        setLoading(false)
      }
    }

    fetchMonthAvailability()
  }, [currentMonth])

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  })

  const previousMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() - 1)
      return newDate
    })
  }

  const nextMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + 1)
      return newDate
    })
  }

  const isDateAvailable = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    const availability = availabilities.find(a => a.date === dateStr)
    return availability?.hasSlots || false
  }

  const getAvailableSlots = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    const availability = availabilities.find(a => a.date === dateStr)
    return availability?.availableSlots || 0
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={previousMonth}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextMonth}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}

        {days.map(day => {
          const dateString = format(day, 'yyyy-MM-dd')
          const isSelected = dateString === selectedDate
          const available = isDateAvailable(day)
          const availableSlots = getAvailableSlots(day)
          const isCurrentMonth = isSameMonth(day, currentMonth)
          const isCurrentDay = isToday(day)

          return (
            <button
              key={day.toString()}
              onClick={() => isCurrentMonth && available && onDateSelect(dateString)}
              disabled={!isCurrentMonth || !available || loading}
              className={`
                relative p-3 w-full aspect-square flex flex-col items-center justify-center
                rounded-lg transition-all duration-200
                ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-900'}
                ${isSelected ? 'bg-emerald-500 text-white' : ''}
                ${!isSelected && isCurrentMonth && available ? 'hover:bg-emerald-50' : ''}
                ${loading ? 'cursor-wait' : !available ? 'cursor-not-allowed' : ''}
                ${isCurrentDay ? 'border-2 border-emerald-500' : ''}
              `}
            >
              <span className={`text-sm ${isSelected ? 'font-bold' : ''}`}>
                {format(day, 'd')}
              </span>
              {isCurrentMonth && available && (
                <span className="text-[10px] mt-0.5">
                  {availableSlots} {availableSlots === 1 ? 'slot' : 'slots'}
                </span>
              )}
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50">
                  <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
} 