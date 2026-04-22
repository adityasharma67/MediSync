import { Queue } from 'bullmq';

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const parsedRedisUrl = new URL(redisUrl);

export type NotificationJobName = 'sendEmail' | 'appointmentReminder';

export const notificationQueue = new Queue('notification-queue', {
  connection: {
    host: parsedRedisUrl.hostname,
    port: Number(parsedRedisUrl.port || 6379),
    password: parsedRedisUrl.password || undefined,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: 100,
    removeOnFail: 200,
  },
});
