import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { MetricsResponseDto } from './dto';

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);
  private readonly startTime = Date.now();

  // Counters
  private requestCount = 0;
  private errorCount = 0;
  private dbQueryCount = 0;
  private cacheHits = 0;
  private cacheMisses = 0;
  private queueJobCompleted = 0;
  private queueJobFailed = 0;

  // Histograms
  private requestDurations: number[] = [];
  private dbQueryDurations: number[] = [];
  private queueJobDurations: number[] = [];

  // Gauges
  private activeRequests = 0;
  private activeQueueJobs = 0;
  private activeDbConnections = 0;
  private activeSessions = 0;

  constructor(private readonly config: ConfigService) {
    this.logger.log('MetricsService initialized');
  }

  /* ── Request metrics ── */

  incrementRequestCount(): void {
    this.requestCount++;
  }

  incrementErrorCount(): void {
    this.errorCount++;
  }

  recordRequestDuration(ms: number): void {
    this.requestDurations.push(ms);
  }

  incrementActiveRequests(): void {
    this.activeRequests++;
  }

  decrementActiveRequests(): void {
    if (this.activeRequests > 0) this.activeRequests--;
  }

  /* ── Database metrics ── */

  incrementDbQueryCount(): void {
    this.dbQueryCount++;
  }

  recordDbQueryDuration(ms: number): void {
    this.dbQueryDurations.push(ms);
  }

  setActiveDbConnections(count: number): void {
    this.activeDbConnections = count;
  }

  recordSlowQuery(): void {
    // Tracked via dbQueryDurations threshold
  }

  /* ── Cache metrics ── */

  incrementCacheHit(): void {
    this.cacheHits++;
  }

  incrementCacheMiss(): void {
    this.cacheMisses++;
  }

  /* ── Queue metrics ── */

  incrementQueueJobCompleted(): void {
    this.queueJobCompleted++;
  }

  incrementQueueJobFailed(): void {
    this.queueJobFailed++;
  }

  recordQueueJobDuration(ms: number): void {
    this.queueJobDurations.push(ms);
  }

  setActiveQueueJobs(count: number): void {
    this.activeQueueJobs = count;
  }

  /* ── Session metrics ── */

  setActiveSessions(count: number): void {
    this.activeSessions = count;
  }

  /* ── Serialization ── */

  getAsPrometheus(): string {
    const lines: string[] = [];

    lines.push('# HELP chronicle_request_total Total HTTP requests');
    lines.push('# TYPE chronicle_request_total counter');
    lines.push(`chronicle_request_total ${this.requestCount}`);

    lines.push('# HELP chronicle_error_total Total HTTP errors');
    lines.push('# TYPE chronicle_error_total counter');
    lines.push(`chronicle_error_total ${this.errorCount}`);

    lines.push('# HELP chronicle_db_query_total Total database queries');
    lines.push('# TYPE chronicle_db_query_total counter');
    lines.push(`chronicle_db_query_total ${this.dbQueryCount}`);

    lines.push('# HELP chronicle_cache_hit_total Total cache hits');
    lines.push('# TYPE chronicle_cache_hit_total counter');
    lines.push(`chronicle_cache_hit_total ${this.cacheHits}`);

    lines.push('# HELP chronicle_cache_miss_total Total cache misses');
    lines.push('# TYPE chronicle_cache_miss_total counter');
    lines.push(`chronicle_cache_miss_total ${this.cacheMisses}`);

    lines.push('# HELP chronicle_queue_job_completed_total Total completed queue jobs');
    lines.push('# TYPE chronicle_queue_job_completed_total counter');
    lines.push(`chronicle_queue_job_completed_total ${this.queueJobCompleted}`);

    lines.push('# HELP chronicle_queue_job_failed_total Total failed queue jobs');
    lines.push('# TYPE chronicle_queue_job_failed_total counter');
    lines.push(`chronicle_queue_job_failed_total ${this.queueJobFailed}`);

    const avgDuration = this.getHistogramAvg(this.requestDurations);
    lines.push('# HELP chronicle_request_duration_ms Request duration histogram');
    lines.push('# TYPE chronicle_request_duration_ms gauge');
    lines.push(`chronicle_request_duration_ms ${avgDuration}`);

    lines.push('# HELP chronicle_active_requests Current active requests');
    lines.push('# TYPE chronicle_active_requests gauge');
    lines.push(`chronicle_active_requests ${this.activeRequests}`);

    lines.push('# HELP chronicle_active_queue_jobs Current active queue jobs');
    lines.push('# TYPE chronicle_active_queue_jobs gauge');
    lines.push(`chronicle_active_queue_jobs ${this.activeQueueJobs}`);

    lines.push('# HELP chronicle_active_db_connections Current database connections');
    lines.push('# TYPE chronicle_active_db_connections gauge');
    lines.push(`chronicle_active_db_connections ${this.activeDbConnections}`);

    lines.push('# HELP chronicle_active_sessions Current active sessions');
    lines.push('# TYPE chronicle_active_sessions gauge');
    lines.push(`chronicle_active_sessions ${this.activeSessions}`);

    lines.push('# HELP chronicle_uptime_seconds Application uptime');
    lines.push('# TYPE chronicle_uptime_seconds gauge');
    lines.push(`chronicle_uptime_seconds ${Math.floor((Date.now() - this.startTime) / 1000)}`);

    return lines.join('\n') + '\n';
  }

  getAsJson(): MetricsResponseDto {
    return {
      counters: {
        requestCount: this.requestCount,
        errorCount: this.errorCount,
        dbQueryCount: this.dbQueryCount,
        cacheHits: this.cacheHits,
        cacheMisses: this.cacheMisses,
        queueJobCompleted: this.queueJobCompleted,
        queueJobFailed: this.queueJobFailed,
      },
      gauges: {
        activeRequests: this.activeRequests,
        activeQueueJobs: this.activeQueueJobs,
        activeDbConnections: this.activeDbConnections,
        activeSessions: this.activeSessions,
      },
      histograms: {
        requestDuration: this.computeHistogram(this.requestDurations),
        dbQueryDuration: this.computeHistogram(this.dbQueryDurations),
        queueJobDuration: this.computeHistogram(this.queueJobDurations),
      },
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
    };
  }

  private computeHistogram(values: number[]): { count: number; sum: number; avg: number; min: number; max: number } {
    if (values.length === 0) return { count: 0, sum: 0, avg: 0, min: 0, max: 0 };
    const sum = values.reduce((a, b) => a + b, 0);
    return {
      count: values.length,
      sum: Math.round(sum * 100) / 100,
      avg: Math.round((sum / values.length) * 100) / 100,
      min: Math.round(Math.min(...values) * 100) / 100,
      max: Math.round(Math.max(...values) * 100) / 100,
    };
  }

  private getHistogramAvg(values: number[]): number {
    if (values.length === 0) return 0;
    return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100;
  }
}
