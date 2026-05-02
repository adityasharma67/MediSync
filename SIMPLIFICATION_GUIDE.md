# MediSync Simplification & Stabilization Guide

## Project Scope

**Keep (Core Features):**
- ✅ User Authentication (login/signup)
- ✅ Role-based access (doctor/patient)
- ✅ Appointment booking
- ✅ Simple dashboard
- ✅ WebRTC video call (doctor ↔ patient)
- ✅ Real-time text chat during call

**Remove (Unnecessary Complexity):**
- ❌ Three.js / 3D Hero components
- ❌ AI/OpenAI integration
- ❌ Heavy animations (framer-motion over-usage)
- ❌ Discovery/recommendation algorithms
- ❌ Timeline features
- ❌ Medical report generation
- ❌ Security features (2FA, device tracking)
- ❌ Analytics & metrics
- ❌ Advanced messaging system
- ❌ Prescription management (initial version)

---

## Backend Architecture

### Simplified Data Models

```
User
├── _id (ObjectId)
├── name (String)
├── email (String)
├── password (String, hashed)
├── role (enum: patient, doctor)
├── avatar (String, optional)
└── For doctors only:
    ├── specialization (String)
    ├── consultationFee (Number)
    └── availableSlots (Array)

Appointment
├── _id (ObjectId)
├── doctorId (ObjectId)
├── patientId (ObjectId)
├── scheduledAt (Date)
├── status (enum: pending, confirmed, completed, cancelled)
├── notes (String, optional)
└── callRoomId (String)

Chat Message
├── _id (ObjectId)
├── appointmentId (ObjectId)
├── senderId (ObjectId)
├── message (String)
├── createdAt (Date)
└── isRead (Boolean)
```

### Simplified API Routes

**Authentication:**
- `POST /api/auth/signup` - Register
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh token

**Users:**
- `GET /api/users/me` - Get current user
- `GET /api/users/doctors` - List all doctors
- `PUT /api/users/me` - Update profile

**Appointments:**
- `POST /api/appointments` - Create appointment
- `GET /api/appointments` - List user appointments
- `GET /api/appointments/:id` - Get appointment details
- `PATCH /api/appointments/:id` - Update appointment status
- `DELETE /api/appointments/:id` - Cancel appointment

---

## Real-time Communication (Socket.io + WebRTC)

### Socket Events

**Video Call Signaling:**
```
Client → Server:
  - join-room: { appointmentId, userId }
  - webrtc-offer: { to, offer }
  - webrtc-answer: { to, answer }
  - webrtc-ice-candidate: { to, candidate }
  - leave-room: { appointmentId }

Server → Client:
  - room-joined: { users }
  - user-joined: { userId }
  - webrtc-offer: { from, offer }
  - webrtc-answer: { from, answer }
  - webrtc-ice-candidate: { from, candidate }
  - user-left: { userId }
```

**Chat Signaling:**
```
Client → Server:
  - send-chat: { appointmentId, message }

Server → Client:
  - receive-chat: { userId, message, timestamp }
```

---

## Frontend Architecture

### Simplified Page Structure

```
pages/
├── page.tsx (Landing)
├── login/
├── signup/
├── dashboard/
│   ├── page.tsx (Dashboard home)
│   └── appointments/
│       ├── page.tsx (List appointments)
│       ├── [id].tsx (Appointment details)
│       └── new.tsx (Create appointment)
└── consultation/
    └── [id].tsx (Video call page)
```

### WebRTC Implementation

**Use `simple-peer` library:**
```tsx
import SimplePeer from 'simple-peer';
import io from 'socket.io-client';

// Socket.io for signaling
// SimplePeer for peer connection
// Native WebRTC APIs for media

// No need for complex SFU/MCU setup
// Direct peer-to-peer connection
```

---

## Deployment

### Backend (Render)
- Remove unnecessary env vars
- Use PostgreSQL or MongoDB Atlas
- Redis for session only

### Frontend (Vercel)
- Build: `npm run build`
- Start: `npm start`
- Env vars: API_URL, NEXT_PUBLIC_SOCKET_URL

---

## Database Cleanup

Remove collections:
- analytics_events
- conversations (use simpler chat)
- medical_reports
- notifications (simplify)
- timeline
- waitlists

---

## Build Process

```bash
# Backend
cd backend
npm install
npm run build

# Frontend
cd frontend
npm install
npm run build

# Docker
docker-compose up
```

---

## Testing Strategy

1. **Authentication:** Login/signup flow
2. **Appointments:** Create, read, update, cancel
3. **Video Call:** Join room, exchange SDP, ICE candidates, disconnect
4. **Chat:** Send/receive messages during call
5. **Error Handling:** Network failures, timeouts, invalid inputs
