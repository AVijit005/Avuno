import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { AnalyticsService } from './analytics.service';
import { DiscoveryService } from './discovery.service';
import { CurrentUser, JwtAuthGuard } from '../auth';
import type { AccessTokenPayload } from '../auth/services/jwt-token.service';
import type { ActivityDto, OverviewDto, InsightsDto, GenreAnalyticsDto, CalendarDto } from './dto/analytics.dto';

@ApiBearerAuth()
@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(ThrottlerGuard)
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly discoveryService: DiscoveryService,
  ) {}

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Get full dashboard analytics' })
  async getDashboard(@CurrentUser() user: AccessTokenPayload): Promise<any> {
    return this.analyticsService.getDashboard(user.sub);
  }

  @Get('streaks')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiOperation({ summary: 'Get streak analytics' })
  async getStreaks(@CurrentUser() user: AccessTokenPayload): Promise<any> {
    return this.analyticsService.getStreaks(user.sub);
  }

  @Get('media')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiOperation({ summary: 'Get media distribution analytics' })
  async getMediaAnalytics(@CurrentUser() user: AccessTokenPayload): Promise<any> {
    return this.analyticsService.getMediaAnalytics(user.sub);
  }

  @Get('overview')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 15, ttl: 60000 } })
  @ApiOperation({ summary: 'Get analytics overview' })
  async getOverview(@CurrentUser() user: AccessTokenPayload): Promise<OverviewDto> {
    return this.analyticsService.getOverview(user.sub);
  }

  @Get('genres')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiOperation({ summary: 'Get genre analytics' })
  async getGenres(@CurrentUser() user: AccessTokenPayload): Promise<GenreAnalyticsDto> {
    return this.analyticsService.getGenreAnalytics(user.sub);
  }

  @Get('insights')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Get AI-generated insights' })
  async getInsights(@CurrentUser() user: AccessTokenPayload): Promise<InsightsDto> {
    return this.analyticsService.getInsights(user.sub);
  }

  // These four were called by the frontend since launch but never existed, so
  // every request 404'd and the dashboard, discovery and calendar sections
  // that depend on them rendered empty.
  @Get('discovery')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 15, ttl: 60000 } })
  @ApiOperation({ summary: 'Discovery recommendations drawn from the library' })
  async getDiscovery(@CurrentUser() user: AccessTokenPayload) {
    return this.discoveryService.getDiscovery(user.sub);
  }

  @Get('intelligence')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 15, ttl: 60000 } })
  @ApiOperation({ summary: 'Taste profile and media evolution' })
  async getIntelligence(@CurrentUser() user: AccessTokenPayload) {
    return this.discoveryService.getIntelligence(user.sub);
  }

  @Get('challenges')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 15, ttl: 60000 } })
  @ApiOperation({ summary: 'Challenges derived from real library counts' })
  async getChallenges(@CurrentUser() user: AccessTokenPayload) {
    return this.discoveryService.getChallenges(user.sub);
  }

  @Get('constellation')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 15, ttl: 60000 } })
  @ApiOperation({ summary: 'Genre distribution for the constellation chart' })
  async getConstellation(@CurrentUser() user: AccessTokenPayload) {
    return this.discoveryService.getConstellation(user.sub);
  }

  @Get('activity')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 15, ttl: 60000 } })
  @ApiOperation({ summary: 'Get activity heatmap data' })
  async getActivity(@CurrentUser() user: AccessTokenPayload): Promise<ActivityDto> {
    return this.analyticsService.getActivity(user.sub);
  }

  @Get('calendar')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Calendar data for a specific month' })
  async getCalendar(
    @CurrentUser() user: AccessTokenPayload,
    @Query('year') year: string,
    @Query('month') month: string,
  ): Promise<CalendarDto> {
    return this.analyticsService.getCalendar(
      user.sub,
      parseInt(year, 10) || new Date().getFullYear(),
      parseInt(month, 10) || new Date().getMonth() + 1,
    );
  }

  @Get('calendar/year')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Calendar year data' })
  async getCalendarYear(@CurrentUser() user: AccessTokenPayload, @Query('year') year: string): Promise<any> {
    return this.analyticsService.getCalendarYear(user.sub, parseInt(year, 10) || new Date().getFullYear());
  }

  @Get('calendar/day')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Calendar day data' })
  async getCalendarDay(@CurrentUser() user: AccessTokenPayload, @Query('date') date: string): Promise<any> {
    return this.analyticsService.getCalendarDay(user.sub, date);
  }

  @Post('pageview')
  @ApiOperation({ summary: 'Record pageview analytics' })
  async recordPageView(@Body() _body: Record<string, any>) {
    // NOTE: pageviews are not persisted. This accepts and discards the
    // payload so the client's beacon does not error; wiring it to a real
    // analytics sink is tracked separately.
    return { success: true };
  }

  @Get('health')
  @ApiOperation({ summary: 'Analytics health check' })
  async health() {
    return { status: 'ok' };
  }
}
