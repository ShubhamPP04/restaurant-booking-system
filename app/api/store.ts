// Shared store for bookings
export const bookings = [
  {
    "name": "Shubham Kumar",
    "email": "shubhampp8001@gmail.com",
    "phone": "08178132741",
    "date": "2025-01-11",
    "time": "16:00",
    "guests": 1,
    "id": "1735831991650",
    "createdAt": "2025-01-02T15:33:11.651Z"
  }
]

export type Booking = {
  id: string
  name: string
  email: string
  phone: string
  date: string
  time: string
  guests: number
  createdAt: string
} 