# MediSync Configuration Guide

## Environment Variables Setup

This guide explains all environment variables needed for MediSync development and production.

---

## Backend Environment Variables

### Server Configuration
```env
PORT=5000
NODE_ENV=development  # or 'production'
```

### Database
```env
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/medisync

# OR MongoDB Atlas (Cloud)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/medisync?retryWrites=true&w=majority
```

### JWT Secrets
```env
# Generate random secrets with: openssl rand -hex 32

JWT_SECRET=your_32_character_random_secret_key_here_minimum
JWT_EXPIRES_IN=15m

REFRESH_SECRET=your_32_character_random_secret_key_here_minimum
REFRESH_EXPIRES_IN=7d
```

### Email Configuration
```env
# Gmail Setup
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # Use App Password from Google

# Custom SMTP
# EMAIL_SERVICE=custom
# SMTP_HOST=smtp.example.com
# SMTP_PORT=587
# SMTP_SECURE=true

EMAIL_FROM=MediSync <noreply@medisync.com>
```

**Gmail App Password Setup:**
1. Go to [myaccount.google.com/security](https://myaccount.google.com/security)
2. Enable 2-Factor Authentication
3. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
4. Select "Mail" and "Windows Computer"
5. Copy the 16-character password

### Frontend URL
```env
# Used for password reset links in emails
FRONTEND_URL=http://localhost:3000
```

### CORS Configuration
```env
# Frontend origin that can access backend
CORS_ORIGIN=http://localhost:3000

# Production: comma-separated list
# CORS_ORIGIN=https://medisync.com,https://www.medisync.com
```

### Redis (Optional)
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=  # Leave empty if no password
```

### Rate Limiting
```env
# Max requests per time window
RATE_LIMIT_MAX_REQUESTS=100

# Time window in milliseconds (15 minutes)
RATE_LIMIT_WINDOW_MS=900000
```

### Logging
```env
# debug, info, warn, error
LOG_LEVEL=info
```

### AI Features (SendGrid for emails)
```env
OPENAI_API_KEY=sk-your_openai_api_key

# Optional: SendGrid for better email delivery
SENDGRID_API_KEY=SG._your_sendgrid_key
```

### Third-party APIs
```env
# Google OAuth (if implementing)
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret

# Stripe (if implementing payments)
STRIPE_SECRET_KEY=sk_test_your_stripe_key

# Twilio (if implementing SMS)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
```

---

## Frontend Environment Variables

### API Configuration
```env
# Backend API URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000

# Socket.io URL
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000

# Log level (debug, info, warn, error)
NEXT_PUBLIC_LOG_LEVEL=debug
```

### Third-party Services
```env
# Analytics
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# AI Features (can be shared safely)
NEXT_PUBLIC_OPENAI_API_KEY=sk-your_openai_api_key  # Only if safe to share

# Google Maps (if implementing location features)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key
```

---

## Setup Instructions

### Step 1: Generate Random Secrets
```bash
# Generate JWT secrets (use these values in .env)
openssl rand -hex 32
openssl rand -hex 32
```

### Step 2: Create .env Files

**Backend:**
```bash
cd backend
cp .env.example .env
# Edit .env with your values
nano .env
```

**Frontend:**
```bash
cd frontend
cp .env.example .env.local
# Edit .env.local with your values
nano .env.local
```

### Step 3: Verify Setup
```bash
# Backend - should start without errors
cd backend
npm run dev

# Frontend - should start without errors
cd frontend
npm run dev
```

---

## Production Deployment

### Vercel (Frontend)
```bash
# Set environment variables in Vercel dashboard:
# Settings → Environment Variables

NEXT_PUBLIC_BACKEND_URL=https://your-backend-api.com
NEXT_PUBLIC_LOG_LEVEL=error
```

### Render/Railway (Backend)
```bash
# Environment → Environment Variables

PORT=10000  # Render assigns port dynamically
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
REFRESH_SECRET=...
EMAIL_SERVICE=gmail
EMAIL_USER=...
EMAIL_PASSWORD=...
FRONTEND_URL=https://your-frontend-domain.com
CORS_ORIGIN=https://your-frontend-domain.com
```

### Docker Environment
```bash
# Create .env.production file
cp .env.example .env.production

# Docker will load .env.production
docker-compose -f docker-compose.yml up -d
```

---

## Security Checklist

- [ ] All secrets are 32+ characters and random
- [ ] `.env` files are in `.gitignore`
- [ ] Never commit secrets to version control
- [ ] Use platform-specific secret managers in production
- [ ] Rotate secrets if accidentally exposed
- [ ] CORS origin restricted to your domain
- [ ] JWT_SECRET and REFRESH_SECRET are different
- [ ] Email password is app-specific (not Gmail password)
- [ ] Use HTTPS in production
- [ ] Verify email configuration works before deploying

---

## Troubleshooting

### Email Not Sending
```env
# Check Gmail settings:
# 1. 2FA enabled
# 2. Using App Password (not regular password)
# 3. Less secure apps disabled

# Test with:
NODE_ENV=development npm run dev
# Check logs for email errors
```

### CORS Errors
```env
# Backend CORS_ORIGIN must match frontend URL
# Frontend: http://localhost:3000
# Backend: CORS_ORIGIN=http://localhost:3000

# Production:
# Frontend: https://medisync.com
# Backend: CORS_ORIGIN=https://medisync.com
```

### JWT Errors
```env
# Make sure JWT_SECRET and REFRESH_SECRET are different
# Make sure they are at least 32 characters
# Regenerate if needed:
openssl rand -hex 32
```

### Database Connection Fails
```env
# Local MongoDB:
MONGODB_URI=mongodb://localhost:27017/medisync

# Verify MongoDB is running:
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod
# Windows: mongo in Services
```

---

## Additional Resources

- [Environment Variables Best Practices](https://12factor.net/config)
- [MongoDB Atlas Setup Guide](https://docs.atlas.mongodb.com/)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Render Environment Variables](https://render.com/docs/environment-variables)

---

## Support

For issues with configuration:
1. Check `.env.example` for all available variables
2. Verify all required variables are set
3. Check logs for specific error messages
4. See DEPLOYMENT_GUIDE.md for platform-specific help
