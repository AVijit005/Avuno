import { Injectable, NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { MetricsService } from './metrics.service';
import { LoggingService } from './logging.service';

@Injectable()
export class RequestMetricsMiddleware implements NestMiddleware {
  constructor(
    private readonly metricsService: MetricsService,
    private readonly loggingService: LoggingService,
  ) {}

  use(req: Request, res: Response, next: NextFunction): void {
    this.metricsService.incrementActiveRequests();
    this.metricsService.incrementRequestCount();

    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      this.metricsService.decrementActiveRequests();
      this.metricsService.recordRequestDuration(duration);

      if (res.statusCode >= 400) {
        this.metricsService.incrementErrorCount();
      }

      this.loggingService.info('request completed', {
        requestId: (req as Request & { id?: string }).id,
        method: req.method,
        route: req.route?.path ?? req.path,
        statusCode: res.statusCode,
        executionTimeMs: duration,
        userId: (req as Request & { user?: { sub?: string } }).user?.sub,
      });
    });

    next();
  }
}
