# MediSync Implementation Guide

## Project Overview

MediSync is a production-ready full-stack telemedicine platform designed for seamless healthcare delivery. This guide provides comprehensive instructions for understanding and extending the codebase.

## Architecture

### Frontend (Next.js 14)
- **Location**: `./frontend/`
- **Port**: 3000
- **Key Technologies**: TypeScript, Tailwind CSS, Framer Motion, React Three Fiber
- **State Management**: Zustand
- **HTTP Client**: Axios with custom API client

### Backend (Express.js)
- **Location**: `./backend/`
- **Port**: 5000
- **Key Technologies**: Node.js, TypeScript, MongoDB, Redis
- **Authentication**: JWT + bcrypt
- **Real-time**: Socket.io

## Key Features Implementation

### 1. Authentication System

**Signup/Login Flow**:
```
Frontend → API POST /api/auth/signup → MongoDB → JWT Token → Local Storage
```

**Files**:
- Frontend: `src/app/signup/page.tsx`, `src/app/login/page.tsx`
- Backend: `src/routes/auth.routes.ts`, `src/controllers/auth.controller.ts`
- Store: `src/store/authStore.ts`

### 2. Appointment Booking

**Booking Process**:
1. Fetch available doctors: GET `/api/users/doctors`
2. Select date and time slots
3. Submit booking: POST `/api/appointments`
4. Real-time updates via Socket.io

**Files**:
- Frontend: `src/app/appointments/book/page.tsx`
- Backend: `src/controllers/appointment.controller.ts`
- Validation: Zod schemas in API client

### 3. Video Consultation

**WebRTC Implementation**:
- Uses SimplePeer for P2P connections
- Socket.io for signaling
- Real-time chat during call

**Files**:
- Frontend: `src/app/consultation/video/page.tsx`
- Backend: Socket.io events in `src/index.ts`

### 4. Prescription Module

**PDF Generation**:
- Uses jsPDF library
- Server-side generation with patient details
- Client-side download

**Files**:
- Frontend: `src/app/prescriptions/page.tsx`
- Backend: `src/controllers/prescription.controller.ts`

### 5. AI Symptom Checker

**OpenAI Integration**:
- Uses GPT-3.5-turbo model
- Streaming responses
- Context-aware conversations

**Files**:
- Frontend: `src/app/symptom-checker/page.tsx`
- API: `src/app/api/chat/route.ts`

## Database Schema

### Collections

1. **users** - User profiles with roles
2. **appointments** - Booking records with status tracking
3. **prescriptions** - Medical prescriptions with medications
4. **notifications** - User notifications

## API Endpoints

### Auth
- `POST /api/auth/signup` - Register
- `POST /api/auth/login` - Login
- `POST /api/auth/google` - Google OAuth

### Users
- `GET /api/users/me` - Current user
- `PUT /api/users/me` - Update profile
- `GET /api/users/doctors` - List doctors

### Appointments
- `POST /api/appointments` - Book
- `GET /api/appointments` - List
- `PUT /api/appointments/:id` - Update
- `DELETE /api/appointments/:id` - Cancel

### Prescriptions
- `POST /api/prescriptions` - Create
- `GET /api/prescriptions` - List
- `GET /api/prescriptions/:id/pdf` - Download PDF

### Notifications
- `GET /api/notifications` - List
- `PUT /api/notifications/:id` - Mark read
- `DELETE /api/notifications` - Clear all

## Development Guide

### Adding a New Feature

1. **Create Database Model** (Backend)
   ```typescript
   // src/models/feature.model.ts
   interface IFeature extends Document {
     // fields
   }
   ```

2. **Create Controller** (Backend)
   ```typescript
   // src/controllers/feature.controller.ts
   export const featureAction = async (req: AuthRequest, res: Response) => {
     // implementation
   };
   ```

3. **Create Routes** (Backend)
   ```typescript
   // src/routes/feature.routes.ts
   router.post('/', protect, asyncHandler(featureAction));
   ```

4. **Create Frontend Page/Component** (Frontend)
   ```typescript
   'use client';
   
   import { apiClient } from '@/lib/api';
   
   export default function FeaturePage() {
     // implementation
   }
   ```

5. **Add Types** (Frontend)
   ```typescript
   // src/types/index.ts
   export interface IFeature {
     // fields
   }
   ```

### Environment Variables

#### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/medisync
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_secret_key
OPENAI_API_KEY=sk-...
NODE_ENV=development
PORT=5000
```

#### Frontend (.env.local)
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_OPENAI_API_KEY=sk-...
```

## Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Deployment

### Docker Deployment
```bash
docker-compose up -d
```

### Manual Deployment
1. Build backend: `npm run build`
2. Build frontend: `npm run build`
3. Start services: `npm start`

## Troubleshooting

### Backend Issues
- **MongoDB Connection**: Check MONGODB_URI
- **Redis Connection**: Check REDIS_URL
- **JWT Error**: Verify JWT_SECRET is set

### Frontend Issues
- **API Timeout**: Check NEXT_PUBLIC_BACKEND_URL
- **Socket Connection**: Verify NEXT_PUBLIC_SOCKET_URL
- **Auth Issues**: Clear localStorage and login again

## Performance Tips

1. **Caching**: Use Redis for frequently accessed data
2. **Database**: Add indexes for common queries
3. **Frontend**: Lazy load components with dynamic imports
4. **Images**: Optimize with Next.js Image component

## Security Best Practices

1. Use HTTPS in production
2. Keep JWT_SECRET strong
3. Validate all inputs on backend
4. Use CORS carefully
5. Update dependencies regularly

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [Socket.io Guide](https://socket.io/docs/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)

## Support

For issues or questions:
1. Check GitHub Issues
2. Review documentation
3. Contact support team

---

**Last Updated**: April 2026
**Version**: 1.0.0
