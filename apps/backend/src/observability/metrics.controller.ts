import { Controller, Get, Header, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles } from '../auth/decorators';
import { MetricsService } from './metrics.service';
import { PerformanceService } from './performance.service';
import { HealthMetricsService } from './health-metrics.service';
import type { MetricsResponseDto, HealthCheckDetailsDto, SystemMetricsDto } from './dto';

/**
 * Operational metrics. Admin-only.
 *
 * These endpoints were previously unauthenticated. /metrics/system returned
 * host RAM, CPU load and process uptime to any anonymous caller, and
 * /metrics/health returned raw driver error strings — connection targets,
 * hostnames and file paths — whenever a dependency was down. Together that is
 * a free reconnaissance surface.
 *
 * If a Prometheus scraper needs unauthenticated access, bind it to an
 * internal-only port rather than reopening these routes.
 */
@ApiTags('metrics')
@ApiBearerAuth()
@Controller('metrics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class MetricsController {
  constructor(
    private readonly metricsService: MetricsService,
    private readonly performanceService: PerformanceService,
    private readonly healthMetricsService: HealthMetricsService,
  ) {}

  @Get()
  @Header('Content-Type', 'text/plain; charset=utf-8')
  @ApiOperation({ summary: 'Prometheus metrics endpoint' })
  getMetrics(): string {
    return this.metricsService.getAsPrometheus();
  }

  @Get('json')
  @ApiOperation({ summary: 'Metrics in JSON format' })
  getMetricsJson(): MetricsResponseDto {
    return this.metricsService.getAsJson();
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check with full details' })
  async getHealth(): Promise<HealthCheckDetailsDto> {
    return this.healthMetricsService.getFullHealth();
  }

  @Get('system')
  @ApiOperation({ summary: 'System metrics (CPU, memory, event loop)' })
  async getSystemMetrics(): Promise<SystemMetricsDto> {
    return this.performanceService.getSystemMetrics();
  }
}
