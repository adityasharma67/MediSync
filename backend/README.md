# MediSync Backend API

This is the backend API for the MediSync Telemedicine Platform. Built with Node.js, Express, TypeScript, and MongoDB.

## Tech Stack
- Node.js & Express
- TypeScript
- MongoDB & Mongoose
- JWT Authentication
- Socket.io (Realtime)
- Redis (Caching - boilerplate added)
- Winston (Logging)

## Setup Instructions

1. **Install dependencies:**
   Make sure you have Node.js installed.
   ```bash
   cd backend
   npm install
   ```

2. **Environment Variables:**
   A `.env` file is already created. Update `MONGODB_URI` or `REDIS_URL` if you are using hosted instances instead of localhost.

3. **Running the Server:**
   - Development Mode (with hot-reload):
     ```bash
     npm run dev
     ```
   - Production Build:
     ```bash
     npm run build
     npm start
     ```

## API Endpoints

- `POST /api/auth/signup` - Register a new user (patient or doctor)
- `POST /api/auth/login` - Authenticate user & get token
- `GET /api/users/profile` - Get logged in user profile
- `GET /api/users/doctors` - Get list of doctors
- `POST /api/appointments` - Book an appointment
- `GET /api/appointments` - Get my appointments
- `POST /api/prescriptions` - Create a prescription (Doctor only)
- `GET /api/prescriptions` - Get my prescriptions
