# MediSync - Deployment & Testing Checklist

## 📋 Pre-Deployment Setup

### 1. Environment Configuration

#### Backend (.env)
```bash
# Required for production
MONGODB_URI=mongodb://<user>:<password>@<host>:27017/medisync?authSource=admin
REDIS_URL=redis://<host>:6379
JWT_SECRET=<generate-strong-random-key-32-chars>
REFRESH_SECRET=<generate-strong-random-key-32-chars>

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=<your-email@gmail.com>
EMAIL_PASSWORD=<your-app-specific-password>
EMAIL_FROM=MediSync <noreply@medisync.com>

# URLs
FRONTEND_URL=https://yourdomain.com  # Production domain
CORS_ORIGIN=https://yourdomain.com  # Production domain

# APIs
OPENAI_API_KEY=sk-<your-key>

# Server
NODE_ENV=production
PORT=5000
```

#### Frontend (.env.production.local)
```bash
# Production URLs must match backend
NEXT_PUBLIC_BACKEND_URL=https://api.yourdomain.com
NEXT_PUBLIC_SOCKET_URL=https://api.yourdomain.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<your-google-client-id>
NEXT_PUBLIC_LOG_LEVEL=info  # Not debug in production
```

### 2. Database Setup

#### MongoDB
```bash
# Local development
docker run -d --name mongo -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo:7.0

# Or use MongoDB Atlas for production (recommended)
```

#### Redis
```bash
# Local development
docker run -d --name redis -p 6379:6379 redis:7.0-alpine

# Or use Redis Cloud for production (recommended)
```

---

## 🧪 Local Testing

### Step 1: Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Step 2: Start Local Services
```bash
# In separate terminals
docker-compose up

# Or manually start services:
docker run -d -p 27017:27017 --name mongodb mongo:7.0
docker run -d -p 6379:6379 --name redis redis:7.0-alpine
```

### Step 3: Run Development Servers
```bash
# Terminal 1 - Backend
cd backend
npm run dev
# Should output: "MediSync backend running on port 5000"

# Terminal 2 - Frontend  
cd frontend
npm run dev
# Should output: "compiled successfully" and "Server started"
```

### Step 4: Test Backend API

#### 1. Health Check
```bash
curl http://localhost:5000/health
# Expected: { "status": "ok", "timestamp": "..." }
```

#### 2. User Registration
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPassword123",
    "role": "patient"
  }'

# Expected: { "_id": "...", "accessToken": "...", "refreshToken": "..." }
```

#### 3. User Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123"
  }'

# Expected: { "_id": "...", "accessToken": "...", "refreshToken": "..." }
```

#### 4. Protected Route (Get Profile)
```bash
# Use accessToken from login response
curl http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer <accessToken>"

# Expected: { "_id": "...", "name": "Test User", "email": "...", "role": "patient" }
```

#### 5. Token Refresh
```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "<refreshToken>"}'

# Expected: { "accessToken": "..." }
```

### Step 5: Test Frontend

#### 1. Navigate to http://localhost:3000
- [ ] No console errors or warnings
- [ ] No hydration warnings
- [ ] Hero animation displays smoothly

#### 2. Sign Up
- [ ] Fill form with valid data
- [ ] Submit form
- [ ] Should redirect to dashboard or login

#### 3. Login
- [ ] Navigate to login page
- [ ] Enter credentials
- [ ] Should show dashboard
- [ ] Token stored in localStorage

#### 4. Navigation
- [ ] Try different routes (dashboard, appointments, etc.)
- [ ] No 404 errors
- [ ] Navbar works correctly

### Step 6: Test Socket.io Connection
```bash
# Check browser console - should show WebSocket connection
# If connected: "Socket connected: <socket-id>"
```

### Step 7: Test Appointment Booking
- [ ] Navigate to /appointments/book
- [ ] Select doctor and time slot
- [ ] Click book appointment
- [ ] Check database - appointment created
- [ ] Socket event received in real-time

---

## 🐳 Docker Testing

### Build Images
```bash
# Backend
docker build -t medisync-backend:latest ./backend

# Frontend
docker build -t medisync-frontend:latest ./frontend

# Or build all with compose
docker-compose build
```

### Run with Docker Compose
```bash
# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop services
docker-compose down
```

### Verify Docker Containers
```bash
# Check running containers
docker ps

# Expected output:
# medisync-mongodb   - Running on port 27017
# medisync-redis     - Running on port 6379
# medisync-backend   - Running on port 5000
# medisync-frontend  - Running on port 3000
```

---

## ✅ Production Deployment

### 1. Pre-Deployment Verification

- [ ] All environment variables configured
- [ ] SSL/TLS certificates obtained
- [ ] Database backed up
- [ ] Security audit completed
- [ ] Performance tested
- [ ] All tests passing

### 2. Docker Registry Push
```bash
# Tag images
docker tag medisync-backend:latest <registry>/medisync-backend:v1.0.0
docker tag medisync-frontend:latest <registry>/medisync-frontend:v1.0.0

# Push to registry
docker push <registry>/medisync-backend:v1.0.0
docker push <registry>/medisync-frontend:v1.0.0
```

### 3. Deploy to Production
```bash
# Option 1: Server SSH Deploy
ssh user@production-server
cd /app
docker-compose pull
docker-compose up -d

# Option 2: Kubernetes Deploy
kubectl apply -f k8s-manifests/

# Option 3: Cloud Platform (Render, Railway, etc.)
# Follow platform-specific deployment guide
```

### 4. Post-Deployment Verification
```bash
# Check backend health
curl https://api.yourdomain.com/health

# Check frontend
curl https://yourdomain.com

# Monitor logs
docker logs medisync-backend
docker logs medisync-frontend
```

---

## 🔍 Monitoring & Logging

### Enable Monitoring
```bash
# Check application logs
docker logs medisync-backend -f

# Check database connection
# Open MongoDB Admin panel or check backend logs

# Monitor resource usage
docker stats medisync-backend medisync-frontend
```

### Key Logs to Monitor
- API error responses
- Database connection issues
- Socket.io connection errors
- Authentication failures
- Performance metrics

---

## 🚀 Performance Optimization Checklist

- [ ] Enable gzip compression on backend
- [ ] Enable caching headers in frontend
- [ ] Optimize database indexes
- [ ] Set up CDN for static assets
- [ ] Configure rate limiting (already set)
- [ ] Enable database connection pooling
- [ ] Set up background job processing (BullMQ already configured)

---

## 🔒 Security Checklist

- [ ] HTTPS/SSL enabled
- [ ] CORS properly configured (not wildcard)
- [ ] JWT secrets strong and rotated
- [ ] Database credentials not in code
- [ ] Rate limiting enabled
- [ ] Helmet middleware enabled
- [ ] SQL injection prevention (using Mongoose)
- [ ] XSS prevention implemented
- [ ] CSRF protection enabled
- [ ] Input validation on all endpoints
- [ ] Security headers set

---

## 🔄 Ongoing Maintenance

### Daily
- Monitor error logs
- Check application performance
- Verify database health

### Weekly
- Review security logs
- Check for pending updates
- Performance analysis

### Monthly
- Database maintenance
- Backup verification
- Security audit
- Update dependencies

---

## 🐛 Troubleshooting

### Backend Issues

#### Port Already In Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

#### MongoDB Connection Failed
```bash
# Check if MongoDB is running
docker ps | grep mongo

# Verify connection string in .env
MONGODB_URI=mongodb://admin:password@127.0.0.1:27017/medisync?authSource=admin
```

#### Redis Connection Failed
```bash
# Check if Redis is running
docker ps | grep redis

# Verify connection string
REDIS_URL=redis://127.0.0.1:6379
```

### Frontend Issues

#### Build Failed
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

#### Socket.io Connection Failed
- Check CORS_ORIGIN matches backend
- Verify backend is running
- Check browser console for errors

### Database Issues

#### Reset Database (Development Only)
```bash
# Delete all data
docker-compose down -v

# Restart with fresh data
docker-compose up
```

---

## 📊 Expected Performance

### Backend
- Response time: < 200ms (99th percentile)
- Database queries: < 50ms
- CPU usage: < 30% under normal load
- Memory usage: < 200MB

### Frontend
- Initial load: < 1.5 seconds
- Page transitions: < 500ms
- Animation FPS: 60fps
- Bundle size: < 300KB (gzipped)

---

## 🎯 Launch Checklist

### Final Pre-Launch
- [ ] All tests passing
- [ ] Staging environment verified
- [ ] Backups created
- [ ] On-call team assigned
- [ ] Rollback plan prepared
- [ ] Monitoring alerts set up
- [ ] Documentation updated

### Launch Day
- [ ] Deploy to production
- [ ] Monitor metrics closely
- [ ] Check error rates
- [ ] Verify user analytics
- [ ] Be ready to rollback if needed

### Post-Launch
- [ ] Monitor for 24 hours
- [ ] Collect user feedback
- [ ] Review performance metrics
- [ ] Plan optimization iteration

---

## 📞 Support Contacts

- Team Lead: <contact>
- DevOps: <contact>
- Security: <contact>
- On-Call: <contact>

---

## 📚 References

- [Backend Setup Guide](./CONFIGURATION_GUIDE.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [System Design](./SYSTEM_DESIGN_SCALING_PLAYBOOK.md)
- [Fix Summary](./FIX_SUMMARY.md)

---

**Status**: Ready for Production Deployment ✅
