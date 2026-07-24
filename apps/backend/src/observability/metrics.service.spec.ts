/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach } from 'bun:test';
import { MetricsService } from './metrics.service';

function createMockConfig(): any {
  return { get: () => './uploads' };
}

describe('MetricsService', () => {
  let service: MetricsService;

  beforeEach(() => {
    service = new MetricsService(createMockConfig());
  });

  it('starts with zero counters', () => {
    const json = service.getAsJson();
    expect(json.counters.requestCount).toBe(0);
    expect(json.counters.errorCount).toBe(0);
  });

  it('increments request count', () => {
    service.incrementRequestCount();
    expect(service.getAsJson().counters.requestCount).toBe(1);
  });

  it('increments error count', () => {
    service.incrementErrorCount();
    expect(service.getAsJson().counters.errorCount).toBe(1);
  });

  it('records request duration', () => {
    service.recordRequestDuration(42);
    const hist = service.getAsJson().histograms.requestDuration;
    expect(hist.count).toBe(1);
    expect(hist.avg).toBe(42);
  });

  it('tracks active requests', () => {
    service.incrementActiveRequests();
    expect(service.getAsJson().gauges.activeRequests).toBe(1);
    service.decrementActiveRequests();
    expect(service.getAsJson().gauges.activeRequests).toBe(0);
  });

  it('records database metrics', () => {
    service.incrementDbQueryCount();
    service.recordDbQueryDuration(5);
    expect(service.getAsJson().counters.dbQueryCount).toBe(1);
    expect(service.getAsJson().histograms.dbQueryDuration.count).toBe(1);
  });

  it('records cache hits and misses', () => {
    service.incrementCacheHit();
    service.incrementCacheHit();
    service.incrementCacheMiss();
    const json = service.getAsJson();
    expect(json.counters.cacheHits).toBe(2);
    expect(json.counters.cacheMisses).toBe(1);
  });

  it('records queue job metrics', () => {
    service.incrementQueueJobCompleted();
    service.incrementQueueJobFailed();
    service.setActiveQueueJobs(5);
    const json = service.getAsJson();
    expect(json.counters.queueJobCompleted).toBe(1);
    expect(json.counters.queueJobFailed).toBe(1);
    expect(json.gauges.activeQueueJobs).toBe(5);
  });

  it('tracks active sessions', () => {
    service.setActiveSessions(10);
    expect(service.getAsJson().gauges.activeSessions).toBe(10);
  });

  it('generates Prometheus output', () => {
    service.incrementRequestCount();
    service.incrementErrorCount();
    const output = service.getAsPrometheus();
    expect(output).toContain('chronicle_request_total');
    expect(output).toContain('chronicle_error_total');
    expect(output).toContain('chronicle_uptime_seconds');
    expect(output).toMatch(/\d+/);
  });

  it('returns uptime', () => {
    const json = service.getAsJson();
    expect(json.uptime).toBeGreaterThanOrEqual(0);
  });
});
