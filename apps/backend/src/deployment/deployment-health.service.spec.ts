import { describe, it, expect, beforeEach } from 'bun:test';
import { DeploymentHealthService } from './deployment-health.service';

describe('DeploymentHealthService', () => {
  let service: DeploymentHealthService;

  beforeEach(() => {
    service = new DeploymentHealthService();
  });

  it('returns a health report', async () => {
    const report = await service.checkAll();
    expect(report.timestamp).toBeDefined();
    expect(report.services.length).toBeGreaterThan(0);
    expect(['healthy', 'degraded', 'unhealthy']).toContain(report.overall);
  });

  it('returns healthy status', async () => {
    const report = await service.checkAll();
    expect(service.isHealthy(report)).toBe(true);
  });
});
