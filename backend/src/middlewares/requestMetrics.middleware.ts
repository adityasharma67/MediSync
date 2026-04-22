import { NextFunction, Request, Response } from 'express';
import logger from '../utils/logger';

interface MetricsSnapshot {
  totalRequests: number;
  totalErrors: number;
  averageResponseTimeMs: number;
}

const metricsState = {
  totalRequests: 0,
  totalErrors: 0,
  totalDurationMs: 0,
};

export const requestMetrics = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1_000_000;

    metricsState.totalRequests += 1;
    metricsState.totalDurationMs += durationMs;

    if (res.statusCode >= 400) {
      metricsState.totalErrors += 1;
    }

    logger.info('http_request', {
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Number(durationMs.toFixed(2)),
      requestId: req.headers['x-request-id'] || null,
      ip: req.ip,
    });
  });

  next();
};

export const getMetricsSnapshot = (): MetricsSnapshot => {
  const averageResponseTimeMs =
    metricsState.totalRequests === 0
      ? 0
      : metricsState.totalDurationMs / metricsState.totalRequests;

  return {
    totalRequests: metricsState.totalRequests,
    totalErrors: metricsState.totalErrors,
    averageResponseTimeMs: Number(averageResponseTimeMs.toFixed(2)),
  };
};
