# Restaurant Booking System

A modern restaurant table booking system built with Next.js and Express.js.

## Features

- Real-time availability checking
- Interactive calendar and time slot selection
- Booking confirmation system
- Print-friendly booking confirmations
- Responsive design for all devices
- Automatic time slot updates based on current time

## Tech Stack

- Frontend: Next.js 13+ with App Router
- Backend: Express.js
- Styling: Tailwind CSS
- State Management: React Hooks
- Database: File-based JSON storage

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/ShubhamPP04/restaurant-booking-system.git
cd restaurant-booking-system
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5001
```

4. Start the development servers:

For backend:

```bash
cd backend
npm install
npm run dev
```

For frontend:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

- `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:5001)
- `PORT`: Backend server port (default: 5001)
- `CORS_ORIGIN`: Frontend URL for CORS (default: http://localhost:3000)

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── components/         # React components
│   ├── book/              # Booking page
│   └── booking-confirmation/ # Confirmation page
├── backend/               # Express.js backend
│   ├── routes/           # API routes
│   └── server.js         # Server configuration
└── public/               # Static assets
```

## API Endpoints

- `GET /api/bookings`: Get all bookings or filter by date
- `POST /api/bookings`: Create a new booking
- `GET /api/bookings/:id`: Get booking by ID
- `DELETE /api/bookings/:id`: Delete a booking

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
