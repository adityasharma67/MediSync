# MediSync Backend API Documentation

## Overview

Simplified, production-ready API for telemedicine platform with:
- **Authentication**: JWT-based (access + refresh tokens)
- **Real-time Communication**: Socket.io for WebRTC signaling + chat
- **Core Features**: User management, appointments, video calls

---

## Base URL

```
http://localhost:5000/api
```

---

## Authentication

### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password"
}

Response (200):
{
  "_id": "64f2e3c8b1f4a5c9d2e1f3a4",
  "name": "John Doe",
  "email": "user@example.com",
  "role": "patient",
  "avatar": "https://...",
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "expiresIn": "15m"
}
```

### Signup
```
POST /auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "secure_password",
  "role": "patient"  // or "doctor"
}

Response (201): Same as login
```

### Refresh Token
```
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}

Response (200):
{
  "accessToken": "eyJhbGc...",
  "expiresIn": "15m"
}
```

### Logout
```
POST /auth/logout
Authorization: Bearer <accessToken>

Response (200):
{
  "message": "Logged out successfully"
}
```

---

## Users

### Get Current User
```
GET /users/me
Authorization: Bearer <accessToken>

Response (200):
{
  "_id": "64f2e3c8b1f4a5c9d2e1f3a4",
  "name": "John Doe",
  "email": "user@example.com",
  "role": "patient",
  "avatar": "https://...",
  "createdAt": "2024-05-02T10:30:00Z",
  "updatedAt": "2024-05-02T10:30:00Z"
}
```

### Update Current User
```
PUT /users/me
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "name": "John Updated",
  "avatar": "https://new-avatar.jpg",
  "specialization": "Cardiologist",  // For doctors only
  "consultationFee": 500  // For doctors only
}

Response (200): Updated user object
```

### Get All Doctors
```
GET /users/doctors

Response (200):
[
  {
    "_id": "64f2e3c8b1f4a5c9d2e1f3a4",
    "name": "Dr. Smith",
    "email": "doctor@example.com",
    "avatar": "https://...",
    "specialization": "Cardiologist",
    "doctorProfile": {
      "consultationFee": 500,
      "experienceYears": 10,
      "languages": ["English", "Hindi"]
    }
  }
]
```

### Get Doctor Profile
```
GET /users/doctors/:id

Response (200): Detailed doctor object
```

---

## Appointments

### Book Appointment
```
POST /appointments
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "doctorId": "64f2e3c8b1f4a5c9d2e1f3a4",
  "scheduledAt": "2024-05-15T14:00:00Z",
  "notes": "I have a headache"
}

Response (201):
{
  "_id": "64f3e4d9c2g5b6d0e3f2g4b5",
  "patient": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "doctor": {
    "_id": "...",
    "name": "Dr. Smith"
  },
  "scheduledAt": "2024-05-15T14:00:00Z",
  "status": "pending",
  "notes": "I have a headache",
  "createdAt": "2024-05-02T10:30:00Z"
}
```

### Get My Appointments
```
GET /appointments
Authorization: Bearer <accessToken>

Query Parameters:
- status: pending, confirmed, completed, cancelled (optional)

Response (200):
[
  {
    "_id": "64f3e4d9c2g5b6d0e3f2g4b5",
    "patient": {...},
    "doctor": {...},
    "scheduledAt": "2024-05-15T14:00:00Z",
    "status": "pending",
    "notes": "",
    "createdAt": "2024-05-02T10:30:00Z"
  }
]
```

### Get Appointment Details
```
GET /appointments/:id
Authorization: Bearer <accessToken>

Response (200): Appointment object (see above)
```

### Update Appointment Status
```
PATCH /appointments/:id
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "status": "confirmed",  // or completed, cancelled
  "notes": "Optional notes"
}

Response (200): Updated appointment
```

### Cancel Appointment
```
DELETE /appointments/:id
Authorization: Bearer <accessToken>

Response (200):
{
  "message": "Appointment cancelled successfully"
}
```

---

## WebSocket Events (Socket.io)

### Connection & Identification

**Client → Server:**
```javascript
// After connecting via Socket.io, identify user
socket.emit('identify-user', {
  userId: 'user_id',
  userName: 'John Doe',
  role: 'patient'  // or 'doctor'
});
```

### Video Call Signaling

**Join Room:**
```javascript
// Client sends
socket.emit('join-room', {
  appointmentId: 'appointment_id',
  userId: 'user_id',
  userName: 'John Doe',
  role: 'patient'
});

// Server responds
socket.on('room-joined', {
  participants: [
    { userId: '...', userName: 'Dr. Smith', role: 'doctor' }
  ],
  appointmentId: 'appointment_id'
});

// Other participants are notified
socket.on('user-joined', {
  userId: 'new_user_id',
  userName: 'New User',
  role: 'patient'
});
```

**WebRTC Offer:**
```javascript
// Client sends offer to other participant
socket.emit('webrtc-offer', {
  to: 'recipient_id',
  from: 'sender_id',
  offer: { type: 'offer', sdp: '...' }  // RTCSessionDescriptionInit
});

// Recipient receives
socket.on('webrtc-offer', {
  from: 'sender_id',
  offer: { type: 'offer', sdp: '...' }
});
```

**WebRTC Answer:**
```javascript
// Client sends answer
socket.emit('webrtc-answer', {
  to: 'recipient_id',
  from: 'sender_id',
  answer: { type: 'answer', sdp: '...' }
});

// Recipient receives
socket.on('webrtc-answer', {
  from: 'sender_id',
  answer: { type: 'answer', sdp: '...' }
});
```

**ICE Candidates:**
```javascript
// Send candidate
socket.emit('webrtc-ice-candidate', {
  to: 'recipient_id',
  from: 'sender_id',
  candidate: { /* RTCIceCandidateInit */ }
});

// Receive candidate
socket.on('webrtc-ice-candidate', {
  from: 'sender_id',
  candidate: { /* RTCIceCandidateInit */ }
});
```

**Leave Room:**
```javascript
// Client leaves
socket.emit('leave-room', {
  appointmentId: 'appointment_id',
  userId: 'user_id'
});

// Others notified
socket.on('user-left', {
  userId: 'departing_user_id'
});
```

### Chat Messaging

**Send Message:**
```javascript
socket.emit('send-chat', {
  appointmentId: 'appointment_id',
  userId: 'user_id',
  userName: 'John Doe',
  message: 'How are you feeling today?'
});
```

**Receive Message:**
```javascript
socket.on('receive-chat', {
  senderId: 'sender_id',
  senderName: 'Dr. Smith',
  message: 'I am doing well, thank you for asking',
  timestamp: '2024-05-15T14:00:00Z'
});
```

---

## Error Handling

All errors follow standard HTTP status codes:

```json
{
  "error": "Error message",
  "statusCode": 400
}
```

### Common Status Codes

- **400**: Bad Request (invalid input)
- **401**: Unauthorized (missing/invalid token)
- **403**: Forbidden (permission denied)
- **404**: Not Found
- **409**: Conflict (email exists, slot booked, etc.)
- **500**: Internal Server Error

---

## Rate Limiting

API endpoints are rate-limited:
- Auth endpoints: 5 requests per 15 minutes per IP
- General API: 100 requests per 15 minutes per IP

Headers include:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1234567890
```

---

## Environment Variables

```env
# Database
MONGODB_URI=mongodb://user:pass@host:port/medisync

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=15m
REFRESH_SECRET=your_refresh_secret
REFRESH_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://medisync-frontend.vercel.app

# Redis (optional, for session management)
REDIS_URL=redis://localhost:6379
```

---

## Example: Complete Video Call Flow

1. **Patient books appointment** → Backend stores in DB
2. **At appointment time, both join video room:**
   - Patient connects to Socket.io
   - Patient sends `join-room` event
   - Doctor connects and sends `join-room` event
   - Both receive `room-joined` + `user-joined` events
3. **Establish WebRTC connection:**
   - Patient sends `webrtc-offer`
   - Doctor receives, sends `webrtc-answer`
   - Both exchange `webrtc-ice-candidate` events
   - Direct P2P connection establishes
4. **During call:**
   - Both exchange audio/video via WebRTC
   - Both can send chat messages via Socket.io
5. **End call:**
   - One sends `leave-room`
   - Other receives `user-left`
   - WebRTC connections close

---

## Database Schema

### User
```
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: 'patient' | 'doctor',
  avatar: String,
  specialization: String (doctors),
  doctorProfile: {
    consultationFee: Number,
    experienceYears: Number,
    languages: [String]
  },
  refreshToken: String (hashed),
  refreshTokenExpires: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Appointment
```
{
  _id: ObjectId,
  patient: ObjectId (ref: User),
  doctor: ObjectId (ref: User),
  scheduledAt: Date,
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled',
  notes: String,
  callRoomId: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Testing

### Create Test User (Patient)
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Patient",
    "email": "patient@test.com",
    "password": "password123",
    "role": "patient"
  }'
```

### Create Test User (Doctor)
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Doctor",
    "email": "doctor@test.com",
    "password": "password123",
    "role": "doctor"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@test.com",
    "password": "password123"
  }'
```

Use the `accessToken` from response in subsequent requests with:
```
Authorization: Bearer <accessToken>
```
