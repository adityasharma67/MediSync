# 🚀 MediSync - Run Locally NOW

## ⚡ Quick Start (Choose One)

### Option A: Docker Compose (Recommended)
```bash
cd /workspaces/MediSync
docker-compose up -d
```
Then wait 2-3 minutes, then access:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

### Option B: Development Mode (Faster, Takes 1 minute)

**Terminal 1 - Backend:**
```bash
cd /workspaces/MediSync/backend
npm run dev
```
✅ When you see: `Server ready on port 5000`

**Terminal 2 - Frontend:**
```bash
cd /workspaces/MediSync/frontend
npm run dev
```
✅ When you see: `- Local: http://localhost:3000`

Then access:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

---

## 📋 Infrastructure Services (Already Running)

```bash
# Check status
docker ps
```

You should see:
- ✅ MongoDB (Port 27017) - **healthcheck: healthy**
- ✅ Redis (Port 6379) - **healthcheck: healthy**

---

## ✅ Verify Everything Works

### 1. Backend Health
```bash
curl http://localhost:5000/health
```
**Expected:** `{"status":"ok","timestamp":"..."}`

### 2. Create Test Account (Signup)
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Demo User",
    "email": "demo@test.com",
    "password": "DemoPass123",
    "role": "patient"
  }'
```
**Expected:** `{_id, accessToken, refreshToken, ...}`

### 3. Login With Same Credentials
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@test.com",
    "password": "DemoPass123"
  }'
```

### 4. Test Protected Route (Get Profile)
```bash
# Replace TOKEN with accessToken from login response
curl http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer TOKEN"
```

---

##🎯 What to Test Next

### In Browser (http://localhost:3000):
- [ ] Sign up with a new email
- [ ] Login with credentials
- [ ] View dashboard
- [ ] Navigate to appointments → Book appointment
- [ ] View prescriptions
- [ ] Toggle theme (dark/light mode)
- [ ] Check real-time notifications

### API Testing (using curl or Postman):
- [ ] Register new user
- [ ] Login user
- [ ] Refresh token
- [ ] Get available doctors
- [ ] Book appointment
- [ ] View appointments
- [ ] Create prescription (as doctor)

### Real-time Testing:
- [ ] Open two browser windows
- [ ] Log in as different users
- [ ] One user books appointment
- [ ] See Socket.io real-time update in other window

---

## 🛑 Stop Services

### If using Docker:
```bash
docker-compose down
```

### If using Development Mode:
```bash
Ctrl+C in each terminal
```

---

## 📊 Services URLs & Credentials

| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | Use email/password |
| Backend | http://localhost:5000 | - |
| MongoDB | localhost:27017 | admin / password |
| Redis | localhost:6379 | None |
| Health Check | http://localhost:5000/health | - |

---

## 🐛 Common Issues & Fixes

### "Port 5000 already in use"
```bash
lsof -i :5000
kill -9 <PID>
```

### "Cannot connect to MongoDB"
```bash
docker ps | grep mongo
# If not running:
docker run -d --name medisync-mongodb -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password mongo:7.0
```

### Frontend Shows "Cannot Reach Backend"
- Verify backend is running: `curl http://localhost:5000/health`
- Check .env.local has: `NEXT_PUBLIC_BACKEND_URL=http://localhost:5000`
- Clear browser cache (Ctrl+Shift+Delete)

### "socket.io connection failed"
- Wait 5 seconds for services to fully start
- Check browser console for errors (F12)
- Ensure port 5000 is accessible

---

## 📚 Full Documentation

For complete setup and deployment guides, see:
- **[LOCAL_SETUP.md](./LOCAL_SETUP.md)** - Detailed local setup
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Production deployment
- **[FIX_SUMMARY.md](./FIX_SUMMARY.md)** - What was fixed
- **[PRODUCTION_READY.md](./PRODUCTION_READY.md)** - Production readiness report

---

## ✨ Ready to Go!

**Your local MediSync environment is configured and ready to run.**

Choose Option A or B above and follow the steps. All services should be running in 1-3 minutes!

🎉 **Welcome to MediSync Development!**
