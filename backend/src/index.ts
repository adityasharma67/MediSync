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
import analyticsRoutes from './routes/analytics.routes';
import discoveryRoutes from './routes/discovery.routes';
import messagingRoutes from './routes/messaging.routes';
import notificationRoutes from './routes/notification.routes';
import prescriptionRoutes from './routes/prescription.routes';
import queueRoutes from './routes/queue.routes';
import reportRoutes from './routes/report.routes';
import securityRoutes from './routes/security.routes';
import timelineRoutes from './routes/timeline.routes';
import { apiLimiter } from './middlewares/rateLimiter';
import { initializeSocketService } from './services/socket.service';

dotenv.config();

const app = express();
const httpServer = createServer(app);

app.set('trust proxy', 1);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

initializeSocketService(io);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = (process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
        // Allow non-browser requests (e.g., curl, Postman)
        if (!origin) return callback(null, true);

        // In development/test, allow all origins to avoid CORS issues with preview URLs
        if (process.env.NODE_ENV !== 'production') return callback(null, true);

        // If explicit wildcard '*' is configured, allow all origins
        if (allowedOrigins.includes('*')) return callback(null, true);

        // Support simple wildcard patterns like '*.github.dev' or 'https://*.vercel.app'
        const isAllowed = allowedOrigins.some((allowed) => {
          if (allowed.includes('*')) {
            const pattern = `^${allowed.replace(/\*/g, '.*')}$`;
            return new RegExp(pattern).test(origin);
          }
          return allowed === origin;
        });

        // Debug log for origin checks
        if (!isAllowed) {
          logger.warn(`CORS origin denied: ${origin} (allowed: ${allowedOrigins.join(',')})`);
        }

        if (isAllowed) return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(helmet());
app.use(morgan('dev'));

connectDB();

app.use('/api', apiLimiter);

app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'MediSync API is running', version: '1.0.0', status: 'healthy' });
});

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/discovery', discoveryRoutes);
app.use('/api/messages', messagingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/timeline', timelineRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 5000;

httpServer.listen(PORT, () => {
  logger.info(`MediSync backend running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down HTTP server');
  httpServer.close(() => process.exit(0));
});
