import { Job, Worker } from 'bullmq';
import logger from '../utils/logger';
import AuthService from '../services/auth.service';

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const parsedRedisUrl = new URL(redisUrl);

const worker = new Worker(
  'notification-queue',
  async (job: Job) => {
    if (job.name === 'sendEmail') {
      const { email, resetToken, resetUrl } = job.data as {
        email: string;
        resetToken: string;
        resetUrl: string;
      };
      await AuthService.sendPasswordResetEmail(email, resetToken, resetUrl);
      return;
    }

    if (job.name === 'appointmentReminder') {
      const { email, appointmentDate, appointmentTime, patientName, doctorName } = job.data as {
        email: string;
        appointmentDate: string;
        appointmentTime: string;
        patientName: string;
        doctorName: string;
      };

      logger.info('appointment_reminder_sent', {
        email,
        appointmentDate,
        appointmentTime,
      });

      await AuthService.sendAppointmentReminderEmail(
        email,
        patientName,
        doctorName,
        appointmentDate,
        appointmentTime
      );
      return;
    }

    logger.warn('unknown_job_type', { jobName: job.name, jobId: job.id });
  },
  {
    connection: {
      host: parsedRedisUrl.hostname,
      port: Number(parsedRedisUrl.port || 6379),
      password: parsedRedisUrl.password || undefined,
    },
    concurrency: 10,
  }
);

worker.on('completed', (job) => {
  logger.info('job_completed', { queue: 'notification-queue', jobId: job.id, name: job.name });
});

worker.on('failed', (job, err) => {
  logger.error('job_failed', {
    queue: 'notification-queue',
    jobId: job?.id,
    name: job?.name,
    error: err.message,
  });
});

export default worker;
