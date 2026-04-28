# MediSync - Local Development Setup Guide

## 🚀 Quick Start (5-10 minutes)

### Prerequisites
- Docker and Docker Compose installed
- Node.js 18+ and npm installed (for local dev mode)

---

## Option 1: Full Docker Compose (Recommended for Production Testing)

### Step 1: Start All Services
```bash
cd /workspaces/MediSync
docker-compose up -d
```

**First time?** This will take 3-5 minutes to build the images.

### Step 2: Verify Services Are Running
```bash
docker-compose ps
```

Expected output:
```
NAME               STATUS                    PORTS
medisync-mongodb   Up 2 minutes (healthy)    27017
medisync-redis     Up 2 minutes (healthy)    6379
medisync-backend   Up 1 minute (healthy)     5000
medisync-frontend  Up 1 minute (healthy)     3000
```

### Step 3: Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health**: http://localhost:5000/health

### Step 4: Stop Services
```bash
docker-compose down
```

---

## Option 2: Development Mode (Faster, for Active Development)

### Prerequisites
```bash
# In project root
npm install -g nodemon  # Optional, for backend auto-reload
```

### Step 1: Start Infrastructure (MongoDB & Redis)
```bash
docker run -d --name medisync-mongodb -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo:7.0

docker run -d --name medisync-redis -p 6379:6379 \
  redis:7.0-alpine
```

### Step 2: Start Backend (Terminal 1)
```bash
cd backend
npm install  # First time only
npm run dev
```

Expected output:
```
> nodemon src/index.ts
Server ready on port 5000
MongoDB Connected: localhost
Redis Connected Successfully
```

### Step 3: Start Frontend (Terminal 2)
```bash
cd frontend
npm install  # First time only
npm run dev
```

Expected output:
```
- Local:        http://localhost:3000
- Environments: .env.local
  ▲ Next.js 14.2.3
```

### Step 4: Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

---

## Testing the Application

### 1. Health Check
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-04-28T..."
}
```

### 2. User Registration
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPassword123",
    "role": "patient"
  }'
```

Expected response:
```json
{
  "_id": "...",
  "name": "Test User",
  "email": "test@example.com",
  "role": "patient",
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "expiresIn": "15m"
}
```

### 3. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123"
  }'
```

### 4. Get Profile (Requires Token)
Replace `<TOKEN>` with the `accessToken` from login/signup:
```bash
curl http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer <TOKEN>"
```

---

## Typical Use Cases

### Scenario 1: Test Auth Flow
1. Signup as patient
2. Logout
3. Login with credentials
4. Logout

### Scenario 2: Book an Appointment
1. Login as patient
2. Navigate to /appointments/book
3. Select a doctor
4. Choose time slot
5. Confirm booking

### Scenario 3: Test Real-time Features
1. Open two browser windows
2. Login in both
3. One user books appointment
4. See real-time notification in other window (Socket.io)

### Scenario 4: Test Video Consultation (WebRTC)
1. Login as patient and doctor
2. Navigate to consultation page
3. Start video call
4. Test audio/video streams

---

## Terminal Debugging

### Backend Logs
```bash
# If running in Docker
docker logs medisync-backend -f

# If running locally
# Logs appear directly in terminal
```

### Frontend Logs
```bash
# Check browser console (Dev Tools)
# Press F12 → Console tab

# Or view npm dev output in terminal
```

### Database Access
```bash
# Connect to MongoDB
mongosh mongodb://admin:password@localhost:27017/medisync --authenticationDatabase=admin

# Common queries:
db.users.find()
db.appointments.find()
```

### Redis Access
```bash
# Connect to Redis
docker exec -it medisync-redis redis-cli

# Common commands:
KEYS *
GET user:token:<id>
MONITOR
```

---

## Environment Variables

### Backend (.env)
```bash
MONGODB_URI=mongodb://admin:password@127.0.0.1:27017/medisync?authSource=admin
REDIS_URL=redis://127.0.0.1:6379
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
REFRESH_SECRET=your_super_secret_refresh_key_change_this_in_production
CORS_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
PORT=5000
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_LOG_LEVEL=debug
```

---

## Troubleshooting

### Port Already In Use
```bash
# Find process using port
lsof -i :5000  # Backend
lsof -i :3000  # Frontend
lsof -i :27017 # MongoDB
lsof -i :6379  # Redis

# Kill process (replace <PID>  with process ID)
kill -9 <PID>
```

### MongoDB Connection Failed
```bash
# Check if MongoDB is running
docker ps | grep mongo

# If not running:
docker run -d --name medisync-mongodb -p 27017:27017 ...

# Verify connection:
mongosh mongodb://admin:password@localhost:27017/medisync
```

### Redis Connection Failed
```bash
# Check if Redis is running
docker ps | grep redis

# If not running:
docker run -d --name medisync-redis -p 6379:6379 redis:7.0-alpine

# Verify connection:
redis-cli PING  # Should return PONG
```

### Frontend Build Errors
```bash
# Clear Next.js cache
rm -rf frontend/.next
cd frontend
npm run build
npm run dev
```

### Module Not Found Errors
```bash
# Reinstall dependencies
cd backend && rm -rf node_modules && npm install
cd ../frontend && rm -rf node_modules && npm install
```

### WebSocket Connection Errors
- Check if backend is running on port 5000
- Check browser console for error messages
- Ensure NEXT_PUBLIC_SOCKET_URL is set correctly
- Verify CORS_ORIGIN matches frontend URL

---

## Performance Tips

1. **Use Development Mode** for active development (faster reload)
2. **Rebuild Docker Volumes** if database issues: `docker-compose down -v`
3. **Monitor Resources**: `docker stats` to check CPU/Memory usage
4. **Check Network**: Ensure backend/frontend can reach each other

---

## API Endpoints Quick Reference

### Auth
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/forgot-password` - Request password reset

### Users
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/doctors` - Get all doctors

### Appointments
- `POST /api/appointments` - Book appointment
- `GET /api/appointments` - Get user appointments
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Cancel appointment

### Prescriptions
- `POST /api/prescriptions` - Create prescription
- `GET /api/prescriptions` - Get prescriptions
- `GET /api/prescriptions/:id` - Get specific prescription

---

## Next Steps

1. ✅ Set up local environment
2. ✅ Test API endpoints
3. ✅ Test authentication flow
4. ✅ Test appointment booking
5. ✅ Test real-time features
6. ✅ Test video consultation
7. 📝 Plan production deployment

---

## Support

For issues or questions:
1. Check the FIX_SUMMARY.md document
2. Review DEPLOYMENT_CHECKLIST.md
3. Check error logs in terminal or browser console
4. Verify environment variables are set correctly

---

**Status**: Ready for Local Development ✅
