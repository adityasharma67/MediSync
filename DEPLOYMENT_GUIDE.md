# MediSync - Deployment Guide & Production Setup

## Table of Contents
1. [Local Development Setup](#local-development-setup)
2. [Production Deployment](#production-deployment)
3. [Environment Variables](#environment-variables)
4. [Docker Deployment](#docker-deployment)
5. [Vercel Deployment (Frontend)](#vercel-deployment-frontend)
6. [Render Deployment (Full Stack)](#render-deployment-full-stack)
7. [Troubleshooting](#troubleshooting)

---

## Local Development Setup

### Prerequisites
- Node.js 18+ 
- MongoDB running locally or a MongoDB Atlas account
- Redis (required for queues + caching)
- Git

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Fill in the .env with your values
nano .env

# Start development server
npm run dev
```

**Backend will run on:** `http://localhost:5000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local

# Fill in the .env.local file
nano .env.local

# Start development server
npm run dev
```

**Frontend will run on:** `http://localhost:3000`

---

## Environment Variables

### Backend (.env)

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/medisync

# JWT
JWT_SECRET=your_super_secret_key_minimum_32_characters_long
JWT_EXPIRES_IN=15m
REFRESH_SECRET=your_refresh_secret_key_minimum_32_characters_long
REFRESH_EXPIRES_IN=7d

# Email (Gmail example)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password  # Use App Password for Gmail
EMAIL_FROM=MediSync <noreply@medisync.com>

# Frontend URL (for password reset links)
FRONTEND_URL=http://localhost:3000

# CORS
CORS_ORIGIN=http://localhost:3000

# Redis
REDIS_URL=redis://localhost:6379

# AI
OPENAI_API_KEY=sk-your-openai-key
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_LOG_LEVEL=debug
```

---

## Production Deployment

### 1. Build for Production

```bash
# Make the script executable
chmod +x build-production.sh

# Run build script
./build-production.sh
```

This creates a `deploy/` folder with production builds.

### 2. Docker Deployment (Self-hosted)

#### Build Docker images

```bash
docker build -t medisync-backend:latest backend/
docker build -t medisync-frontend:latest frontend/
```

#### Use docker-compose

```bash
docker-compose up -d
```

This will start:
- MongoDB (if configured)
- Redis (if configured)
- Backend (port 5000)
- Frontend (port 3000)

---

## Vercel Deployment (Frontend)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Production ready"
git push origin main
```

### Step 2: Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Select the `frontend` root directory
5. Add environment variables:
   ```
   NEXT_PUBLIC_BACKEND_URL=https://your-backend-api.com
   ```
6. Deploy!

### Step 3: Custom Domain (Optional)
- Go to Project Settings → Domains
- Add your custom domain

---

## Render Deployment (Full Stack)

This repo now includes a Render Blueprint at `render.yaml` in the project root.

### Option A: Deploy with Blueprint (Recommended)

1. Push your latest code to GitHub.
2. In Render, click **New** → **Blueprint**.
3. Select your MediSync repository.
4. Render will detect `render.yaml` and create:
   - `medisync-backend` (Node web service)
   - `medisync-frontend` (Next.js web service)
   - `medisync-redis` (managed Redis)
5. Fill required env vars (marked as `sync: false`) before first deploy:
   - Backend required:
     - `MONGODB_URI` (MongoDB Atlas)
     - `EMAIL_USER`
     - `EMAIL_PASSWORD`
     - `OPENAI_API_KEY` (if AI endpoints are used)
     - `FRONTEND_URL` (your Render frontend URL)
     - `CORS_ORIGIN` (same value as frontend URL)
   - Frontend required:
     - `NEXT_PUBLIC_BACKEND_URL` (your Render backend URL, e.g. `https://medisync-backend.onrender.com`)
     - `OPENAI_API_KEY` (only if frontend server routes use it)
6. Deploy and wait for healthy checks.

### Option B: Manual Service Creation on Render

#### Backend service
1. Create a new **Web Service** from this repo.
2. Use these settings:
   - Root Directory: `backend`
   - Environment: `Node`
   - Build Command: `npm ci && npm run build`
   - Start Command: `npm start`
   - Health Check Path: `/health`
3. Add backend environment variables:
   - `NODE_ENV=production`
   - `MONGODB_URI=<atlas-connection-string>`
   - `REDIS_URL=<render-redis-connection-string>`
   - `JWT_SECRET=<strong-secret>`
   - `JWT_EXPIRES_IN=15m`
   - `REFRESH_SECRET=<strong-secret>`
   - `REFRESH_EXPIRES_IN=7d`
   - `EMAIL_SERVICE=gmail`
   - `EMAIL_USER=<your-email>`
   - `EMAIL_PASSWORD=<gmail-app-password>`
   - `EMAIL_FROM=MediSync <noreply@medisync.com>`
   - `OPENAI_API_KEY=<optional>`
   - `FRONTEND_URL=<https://your-frontend.onrender.com>`
   - `CORS_ORIGIN=<https://your-frontend.onrender.com>`

#### Frontend service
1. Create a second **Web Service** from this repo.
2. Use these settings:
   - Root Directory: `frontend`
   - Environment: `Node`
   - Build Command: `npm ci && npm run build`
   - Start Command: `npm start`
3. Add frontend environment variables:
   - `NODE_ENV=production`
   - `NEXT_PUBLIC_BACKEND_URL=<https://your-backend.onrender.com>`
   - `NEXT_PUBLIC_LOG_LEVEL=info`
   - `OPENAI_API_KEY=<optional>`

#### Redis service
1. Create a new **Redis** service in Render.
2. Copy its internal/external connection string.
3. Set backend `REDIS_URL` to that connection string.

### Post-Deploy Verification

Run these checks after deployment:

```bash
# Backend health
curl https://your-backend.onrender.com/health

# Backend base route
curl https://your-backend.onrender.com/
```

Expected health response:

```json
{"status":"ok","timestamp":"..."}
```

---

## MongoDB Atlas Cloud Setup

1. Go to [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create a cluster
4. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/medisync`
5. Add to `.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/medisync
   ```

---

## Email Setup (Gmail)

1. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Select "Mail" and "Windows Computer"
3. Google will generate a 16-character password
4. Use this password in `.env`:
   ```
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
   ```

---

## Security Checklist

- [ ] Generate strong JWT_SECRET (use `openssl rand -hex 32`)
- [ ] Use HTTPS in production
- [ ] Enable CORS only for your frontend domain
- [ ] Use strong database passwords
- [ ] Keep dependencies updated: `npm audit` and `npm audit fix`
- [ ] Use environment variables (never commit secrets)
- [ ] Enable rate limiting
- [ ] Set up monitoring and logging
- [ ] Use HTTPS for all external APIs
- [ ] Regularly backup your database

---

## Performance Optimization

### Frontend
- Images are automatically optimized by Next.js
- Code splitting enabled for faster page loads
- Caching headers configured
- API requests debounced

### Backend
- API rate limiting enabled
- Redis caching for frequently accessed data
- Database indexes on commonly queried fields
- Connection pooling configured

---

## Monitoring & Logging

### Backend Logs
Logs are written to:
- Console (development)
- Winston logger (production)

Monitor the logs:
```bash
# In Render or Railway dashboard, view logs
# In local docker:
docker logs medisync-backend
```

### Error Tracking (Optional)
Add Sentry for error tracking:
```bash
npm install @sentry/node
```

---

## Scaling Considerations

As your app grows:

1. **Database**
   - Consider MongoDB sharding
   - Add read replicas
   - Implement data archiving

2. **Backend**
   - Use load balancing (Render handles this)
   - Implement rate limiting
   - Cache frequently accessed data
   - Use job queues for heavy operations

3. **Frontend**
   - Use CDN (Vercel includes this)
   - Implement lazy loading
   - Optimize bundle size

4. **Infrastructure**
   - Use Redis for session storage
   - Implement message queuing
   - Use microservices if needed

---

## Troubleshooting

### Backend won't start
```bash
# Check if port is already in use
lsof -i :5000

# Check MongoDB connection
npm run dev

# View logs for errors
```

### Frontend won't build
```bash
# Clear cache
rm -rf .next node_modules

# Reinstall and rebuild
npm install
npm run build
```

### Email not sending
- Check EMAIL_USER and EMAIL_PASSWORD in .env
- For Gmail, use App Password (not regular password)
- Check firewalls and SMTP settings
- Check email service configuration

### CORS errors
- Update CORS_ORIGIN in backend .env
- Ensure NEXT_PUBLIC_BACKEND_URL matches backend URL

### Database connection issues
- Verify MongoDB connection string
- Check MongoDB is running (local) or accessible (Atlas)
- Check firewall rules allow database access
- Verify username/password

---

## Support & Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Express.js Docs](https://expressjs.com/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)

---

## Recent Updates

### Version 1.0.0 (2024)
- ✅ Refresh token implementation
- ✅ Password reset functionality
- ✅ Enhanced error handling
- ✅ Modern UI theme with Framer Motion
- ✅ Loading skeletons
- ✅ Email notifications
- ✅ Production-ready setup

---

## License

MediSync © 2024. All rights reserved.
