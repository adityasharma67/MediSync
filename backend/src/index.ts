import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db';
import logger from './utils/logger';
import { errorHandler, notFound } from './middlewares/error.middleware';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import appointmentRoutes from './routes/appointment.routes';
import prescriptionRoutes from './routes/prescription.routes';
import notificationRoutes from './routes/notification.routes';
import { apiLimiter } from './middlewares/rateLimiter';
import './config/redis'; // Initialize Redis connection

dotenv.config();

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: '*', // Set to frontend URL in production
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Connect to Database
connectDB();

// API Rate Limiting
app.use('/api', apiLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/notifications', notificationRoutes);

// Base route
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: 'MediSync API is running...',
    version: '1.0.0',
    status: 'healthy'
  });
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.io connection
io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.id}`);

  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.id}`);
  });

  // Appointment Events
  socket.on('appointment:book', (data) => {
    io.emit('appointment:updated', data);
  });

  socket.on('appointment:cancel', (data) => {
    io.emit('appointment:updated', data);
  });

  // WebRTC Signaling for Video Calls
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-connected', userId);

    socket.on('webrtc:signal', (signal) => {
      socket.to(roomId).emit('webrtc:signal', signal);
    });

    socket.on('disconnect', () => {
      socket.to(roomId).emit('user-disconnected', userId);
    });
  });

  // Chat during consultation
  socket.on('chat:message', (data) => {
    const room = data.appointmentId;
    io.to(room).emit('chat:message', {
      sender: data.sender,
      message: data.message,
      timestamp: new Date().toISOString(),
    });
  });

  // Real-time availability updates
  socket.on('availability:update', (data) => {
    io.emit('availability:changed', data);
  });
});

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
