# MediSync - Scalable Telemedicine & Healthcare Platform

A production-ready full-stack telemedicine application built with modern technologies.

## 🚀 Features

### 1. Authentication & Authorization
- JWT-based authentication with secure token handling
- Google OAuth integration
- Role-based access control (Patient, Doctor, Admin)
- Bcrypt password hashing

### 2. User Management
- Patient profiles with medical history
- Doctor profiles with specializations
- Admin user management dashboard

### 3. Appointment System
- Slot-based booking with double-booking prevention
- Real-time slot locking using Socket.io
- Appointment rescheduling and cancellation
- Atomic database operations for data integrity

### 4. Video Consultation
- WebRTC-based HD video calls using simple-peer
- Real-time chat during consultations
- Screen sharing capabilities
- Call recording and history

### 5. Prescription Management
- Doctor-generated prescriptions
- PDF generation and download
- Prescription history and tracking
- Medication dosage instructions

### 6. AI Features
- Symptom checker using OpenAI API
- Preliminary diagnosis suggestions
- Health recommendations

### 7. Admin Dashboard
- Recharts-based analytics
- User and doctor management
- Appointment statistics
- Revenue tracking

### 8. Advanced Backend Features
- Redis caching for doctor availability
- Rate limiting middleware
- Centralized error handling
- Winston logging system
- CORS configuration

### 9. Frontend Excellence
- Premium SaaS-style design
- Dark/light mode toggle
- Glassmorphism UI components
- Smooth animations with Framer Motion
- 3D animated hero section (React Three Fiber)
- Fully responsive design
- Loading skeletons

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **3D**: React Three Fiber + Three.js
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **WebRTC**: SimplePeer
- **Real-time**: Socket.io
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Caching**: Redis with ioredis
- **Authentication**: JWT + bcrypt
- **Validation**: Zod
- **Logging**: Winston + Morgan
- **Rate Limiting**: express-rate-limit
- **Security**: Helmet + CORS

### DevOps
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **CI/CD**: GitHub Actions
- **Version Control**: Git

## 📋 Project Structure

```
MediSync/
├── backend/
│   ├── src/
│   │   ├── config/          # Database & Redis config
│   │   ├── controllers/      # API controllers
│   │   ├── middlewares/      # Auth, error, rate limiting
│   │   ├── models/           # MongoDB models
│   │   ├── routes/           # API routes
│   │   ├── utils/            # Utilities (JWT, logger)
│   │   └── index.ts          # Server entry point
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── app/              # Next.js pages
│   │   ├── components/       # Reusable components
│   │   ├── hooks/            # Custom hooks
│   │   ├── lib/              # API client, utilities
│   │   ├── store/            # Zustand stores
│   │   ├── types/            # TypeScript types
│   │   └── assets/           # Images, icons
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── docker-compose.yml        # Docker orchestration
├── .github/
│   └── workflows/            # GitHub Actions CI/CD
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB 7.0+
- Redis 6.0+
- Docker & Docker Compose (for containerized deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/medisync.git
   cd medisync
   ```

2. **Setup Backend**
   ```bash
   cd backend
   cp .env.example .env
   npm install
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   cp .env.example .env.local
   npm install
   npm run dev
   ```

4. **Access aplikasi**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

### Docker Deployment

```bash
# Build and run all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/google` - Google OAuth

### Users
- `GET /api/users/me` - Get current user
- `PUT /api/users/me` - Update profile
- `GET /api/users/doctors` - List all doctors

### Appointments
- `POST /api/appointments` - Book appointment
- `GET /api/appointments` - Get user appointments
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Cancel appointment

### Prescriptions
- `POST /api/prescriptions` - Create prescription
- `GET /api/prescriptions` - Get prescriptions
- `GET /api/prescriptions/:id/pdf` - Download PDF

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id` - Mark as read
- `DELETE /api/notifications` - Clear all

## 🔐 Security Features

- JWT token-based authentication
- Bcrypt password hashing (10 salt rounds)
- Rate limiting (100 requests per 15 minutes)
- CORS configuration
- Helmet for HTTP headers security
- Input validation with Zod
- Secure environment variable management

## 📊 Database Schema

### Users
```typescript
{
  name: string
  email: string (unique)
  password?: string
  role: 'patient' | 'doctor' | 'admin'
  avatar?: string
  specialization?: string (for doctors)
  createdAt: Date
  updatedAt: Date
}
```

### Appointments
```typescript
{
  patient: ObjectId
  doctor: ObjectId
  date: Date
  time: string
  status: 'scheduled' | 'completed' | 'cancelled'
  meetLink?: string
  createdAt: Date
  updatedAt: Date
}
```

### Prescriptions
```typescript
{
  appointment: ObjectId
  doctor: ObjectId
  patient: ObjectId
  medications: [{
    name: string
    dosage: string
    frequency: string
    duration: string
    instructions?: string
  }]
  notes?: string
  createdAt: Date
  updatedAt: Date
}
```

## 🔄 WebSocket Events (Socket.io)

### Realtime Slot Locking
- `slot:lock` - Lock appointment slot
- `slot:unlock` - Unlock appointment slot
- `slot:updated` - Broadcast slot updates

### Video Calls
- `call:invite` - Invite user to call
- `call:answer` - Answer incoming call
- `call:signal` - WebRTC signaling
- `call:end` - End call

### Chat
- `message:send` - Send chat message
- `message:received` - Receive chat message

## 📈 Performance Optimizations

1. **Caching**
   - Redis caching for doctor availability
   - Client-side React Query caching

2. **Database**
   - Indexed queries for fast lookups
   - Connection pooling with MongoDB

3. **Frontend**
   - Image optimization with Next.js Image
   - Code splitting and lazy loading
   - CSS-in-JS with Tailwind purging

4. **Backend**
   - Gzip compression
   - Request/response pagination
   - Database query optimization

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📝 Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/medisync
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_secret_key
OPENAI_API_KEY=sk-...
NODE_ENV=production
PORT=5000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_OPENAI_API_KEY=sk-...
```

## 🚀 Deployment

### Heroku Deployment
```bash
heroku create medisync-app
git push heroku main
```

### AWS Deployment
- Use EC2 with Docker
- RDS for MongoDB
- ElastiCache for Redis
- CloudFront for CDN

### Docker Hub Deployment
```bash
docker build -t yourusername/medisync-backend ./backend
docker push yourusername/medisync-backend
```

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📞 Support

For support, email support@medisync.com or open an issue on GitHub.

## 🙏 Acknowledgments

- React Three Fiber for 3D capabilities
- Framer Motion for animations
- Recharts for data visualization
- All open-source contributors
