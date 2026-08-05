# Report Generation API

<cite>
**Referenced Files in This Document**
- [app.module.ts](file://apps/backend/src/app.module.ts)
- [main.ts](file://apps/backend/src/main.ts)
- [analytics.controller.ts](file://apps/backend/src/analytics/analytics.controller.ts)
- [analytics.service.ts](file://apps/backend/src/analytics/analytics.service.ts)
- [analytics-aggregation.service.ts](file://apps/backend/src/analytics/analytics-aggregation.service.ts)
- [dashboard.service.ts](file://apps/backend/src/analytics/dashboard.service.ts)
- [insights.service.ts](file://apps/backend/src/analytics/insights.service.ts)
- [streak.service.ts](file://apps/backend/src/analytics/streak.service.ts)
- [bullmq.module.ts](file://apps/backend/src/bullmq/bullmq.module.ts)
- [notifications.controller.ts](file://apps/backend/src/notifications/notifications.controller.ts)
- [scheduler.service.ts](file://apps/backend/src/notifications/scheduler.service.ts)
- [notification-queue.service.ts](file://apps/backend/src/notifications/notification-queue.service.ts)
- [storage.controller.ts](file://apps/backend/src/storage/storage.controller.ts)
- [storage.service.ts](file://apps/backend/src/storage/storage.service.ts)
- [image-processor.service.ts](file://apps/backend/src/storage/image-processor.service.ts)
- [wrapped.controller.ts](file://apps/backend/src/wrapped/wrapped.controller.ts)
- [wrapped-generator.service.ts](file://apps/backend/src/wrapped/wrapped-generator.service.ts)
- [wrapped-insights.service.ts](file://apps/backend/src/wrapped/wrapped-insights.service.ts)
- [wrapped-share.service.ts](file://apps/backend/src/wrapped/wrapped-share.service.ts)
- [prisma.service.ts](file://apps/backend/src/prisma/prisma.service.ts)
- [redis.service.ts](file://apps/backend/src/redis/redis.service.ts)
- [configuration.ts](file://apps/backend/src/config/configuration.ts)
- [env.validation.ts](file://apps/backend/src/config/env.validation.ts)
- [common.module.ts](file://apps/backend/src/common/common.module.ts)
- [core.module.ts](file://apps/backend/src/core/core.module.ts)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)
10. [Appendices](#appendices)

## Introduction
This document provides comprehensive API documentation for custom report generation and data export endpoints within the backend application. It focuses on:
- Report template system and customization
- Data aggregation pipelines for analytics and insights
- Export format support (PDF, CSV, JSON)
- Report scheduling and batch processing
- Background job processing for large datasets
- Streaming responses for real-time report generation
- Parameter binding and output formatting options

The backend is built with NestJS and integrates with Prisma for database access, Redis for caching and queues, and BullMQ for background job orchestration. The analytics and wrapped modules provide core report generation capabilities, while storage and notification services support export delivery and scheduling.

## Project Structure
The report generation functionality spans several modules:
- Analytics module: Aggregates metrics, generates insights, and powers dashboard reports
- Wrapped module: Generates personalized year-in-review style reports
- Storage module: Handles file exports and media processing
- Notifications module: Schedules and delivers reports via queues
- Core infrastructure: Database, caching, configuration, and common utilities

```mermaid
graph TB
subgraph "API Layer"
AC["Analytics Controller"]
WC["Wrapped Controller"]
SC["Storage Controller"]
NC["Notifications Controller"]
end
subgraph "Service Layer"
AS["Analytics Service"]
AAS["Analytics Aggregation Service"]
DS["Dashboard Service"]
IS["Insights Service"]
SS["Streak Service"]
WGS["Wrapped Generator Service"]
WIS["Wrapped Insights Service"]
WSS["Wrapped Share Service"]
STS["Storage Service"]
IPS["Image Processor Service"]
NQS["Notification Queue Service"]
SCH["Scheduler Service"]
end
subgraph "Infrastructure"
PR["Prisma Service"]
RS["Redis Service"]
BM["BullMQ Module"]
CFG["Configuration"]
CM["Common Module"]
CORE["Core Module"]
end
AC --> AS
AC --> AAS
AC --> DS
WC --> WGS
WC --> WIS
WC --> WSS
SC --> STS
SC --> IPS
NC --> NQS
NC --> SCH
AS --> PR
AAS --> PR
DS --> PR
IS --> PR
SS --> PR
WGS --> PR
WIS --> PR
WSS --> PR
STS --> PR
IPS --> PR
AS --> RS
AAS --> RS
WGS --> RS
NQS --> BM
SCH --> BM
PR --> |Database| DB[(Database)]
RS --> |Cache/Queue| REDIS[(Redis)]
```

**Diagram sources**
- [analytics.controller.ts](file://apps/backend/src/analytics/analytics.controller.ts)
- [analytics.service.ts](file://apps/backend/src/analytics/analytics.service.ts)
- [wrapped.controller.ts](file://apps/backend/src/wrapped/wrapped.controller.ts)
- [storage.controller.ts](file://apps/backend/src/storage/storage.controller.ts)
- [notifications.controller.ts](file://apps/backend/src/notifications/notifications.controller.ts)

**Section sources**
- [app.module.ts](file://apps/backend/src/app.module.ts)
- [main.ts](file://apps/backend/src/main.ts)

## Core Components
The report generation system consists of several key components:

### Analytics Services
- **Analytics Service**: Main orchestrator for report generation and data aggregation
- **Analytics Aggregation Service**: Handles complex data aggregation queries and calculations
- **Dashboard Service**: Provides dashboard-specific report data and visualizations
- **Insights Service**: Generates analytical insights and recommendations
- **Streak Service**: Tracks user activity streaks and patterns

### Wrapped Report System
- **Wrapped Generator Service**: Creates personalized wrapped-style reports
- **Wrapped Insights Service**: Analyzes user data to generate insights
- **Wrapped Share Service**: Handles sharing and export of wrapped reports

### Storage and Export Services
- **Storage Service**: Manages file uploads, downloads, and exports
- **Image Processor Service**: Processes images for PDF generation and previews

### Background Processing
- **Notification Queue Service**: Manages queue-based job processing
- **Scheduler Service**: Handles scheduled report generation and delivery

**Section sources**
- [analytics.service.ts](file://apps/backend/src/analytics/analytics.service.ts)
- [analytics-aggregation.service.ts](file://apps/backend/src/analytics/analytics-aggregation.service.ts)
- [dashboard.service.ts](file://apps/backend/src/analytics/dashboard.service.ts)
- [insights.service.ts](file://apps/backend/src/analytics/insights.service.ts)
- [streak.service.ts](file://apps/backend/src/analytics/streak.service.ts)
- [wrapped-generator.service.ts](file://apps/backend/src/wrapped/wrapped-generator.service.ts)
- [wrapped-insights.service.ts](file://apps/backend/src/wrapped/wrapped-insights.service.ts)
- [wrapped-share.service.ts](file://apps/backend/src/wrapped/wrapped-share.service.ts)
- [storage.service.ts](file://apps/backend/src/storage/storage.service.ts)
- [image-processor.service.ts](file://apps/backend/src/storage/image-processor.service.ts)
- [notification-queue.service.ts](file://apps/backend/src/notifications/notification-queue.service.ts)
- [scheduler.service.ts](file://apps/backend/src/notifications/scheduler.service.ts)

## Architecture Overview
The report generation architecture follows a layered approach with clear separation of concerns:

```mermaid
sequenceDiagram
participant Client as "Client Application"
participant API as "Report API Controller"
participant Service as "Report Service"
participant Aggregator as "Data Aggregation Service"
participant Template as "Template Engine"
participant Exporter as "Export Service"
participant Queue as "Background Queue"
participant Storage as "File Storage"
Client->>API : POST /reports/generate
API->>Service : validateRequest()
Service->>Aggregator : aggregateData(params)
Aggregator->>Aggregator : processQueries()
Aggregator-->>Service : aggregatedData
Service->>Template : renderTemplate(data, templateId)
Template-->>Service : renderedContent
Service->>Exporter : exportToFormat(content, format)
Exporter-->>Service : exportedFile
Service->>Storage : saveToFile(file)
Storage-->>Service : fileUrl
Service-->>Client : {reportUrl, status}
Note over Queue,Storage : For large reports, use async processing
Client->>API : POST /reports/generate-async
API->>Queue : enqueueJob(reportParams)
Queue-->>Client : {jobId, status}
Queue->>Service : processJob(jobId)
Service->>Storage : saveToFile()
Storage-->>Queue : fileUrl
Queue-->>Client : {jobId, completed : true, url}
```

**Diagram sources**
- [analytics.controller.ts](file://apps/backend/src/analytics/analytics.controller.ts)
- [analytics.service.ts](file://apps/backend/src/analytics/analytics.service.ts)
- [analytics-aggregation.service.ts](file://apps/backend/src/analytics/analytics-aggregation.service.ts)
- [storage.service.ts](file://apps/backend/src/storage/storage.service.ts)
- [notification-queue.service.ts](file://apps/backend/src/notifications/notification-queue.service.ts)

## Detailed Component Analysis

### Analytics Report Generation
The analytics module provides comprehensive reporting capabilities for user activity, library statistics, and engagement metrics.

```mermaid
classDiagram
class AnalyticsController {
+getDashboardData(userId) DashboardData
+getUserActivity(userId, params) ActivityReport
+getLibraryStatistics(userId, filters) LibraryStats
+exportAnalytics(userId, format) ExportResponse
}
class AnalyticsService {
-analyticsRepository
-cacheService
+generateReport(userId, type, params) Promise~Report~
+aggregateMetrics(userId, timeRange) Metrics
+validateReportParams(params) boolean
-cacheReportData(key, data, ttl) void
}
class AnalyticsAggregationService {
-databaseService
-cacheService
+aggregateUserActivity(userId, dateRange) ActivityData
+calculateEngagementMetrics(userId) EngagementMetrics
+generateTrendAnalysis(dataPoints) TrendAnalysis
+optimizeQueryPerformance(query) QueryPlan
}
class DashboardService {
+getDashboardOverview(userId) DashboardOverview
+getWeeklySummary(userId) WeeklySummary
+getMonthlyHighlights(userId) MonthlyHighlights
+getYearlyReport(userId) YearlyReport
}
AnalyticsController --> AnalyticsService : "uses"
AnalyticsService --> AnalyticsAggregationService : "delegates"
AnalyticsService --> DashboardService : "integrates"
```

**Diagram sources**
- [analytics.controller.ts](file://apps/backend/src/analytics/analytics.controller.ts)
- [analytics.service.ts](file://apps/backend/src/analytics/analytics.service.ts)
- [analytics-aggregation.service.ts](file://apps/backend/src/analytics/analytics-aggregation.service.ts)
- [dashboard.service.ts](file://apps/backend/src/analytics/dashboard.service.ts)

#### Report Template System
The template system supports dynamic report generation with customizable layouts and data bindings:

```mermaid
flowchart TD
Start([Report Request]) --> ValidateInput["Validate Input Parameters"]
ValidateInput --> LoadTemplate["Load Report Template"]
LoadTemplate --> ParseTemplate["Parse Template Variables"]
ParseTemplate --> BindData["Bind Data to Template"]
BindData --> ProcessLogic["Process Template Logic"]
ProcessLogic --> GenerateOutput["Generate Output Format"]
GenerateOutput --> CacheResult["Cache Generated Report"]
CacheResult --> ReturnResponse["Return Report Response"]
ValidateInput --> |Invalid| Error["Return Validation Error"]
LoadTemplate --> |Not Found| Error
BindData --> |Data Missing| Fallback["Use Default Values"]
Fallback --> ProcessLogic
```

**Diagram sources**
- [analytics.service.ts](file://apps/backend/src/analytics/analytics.service.ts)
- [configuration.ts](file://apps/backend/src/config/configuration.ts)

**Section sources**
- [analytics.controller.ts](file://apps/backend/src/analytics/analytics.controller.ts)
- [analytics.service.ts](file://apps/backend/src/analytics/analytics.service.ts)
- [analytics-aggregation.service.ts](file://apps/backend/src/analytics/analytics-aggregation.service.ts)
- [dashboard.service.ts](file://apps/backend/src/analytics/dashboard.service.ts)

### Wrapped Report System
The wrapped module creates personalized year-in-review style reports with rich visualizations and insights.

```mermaid
sequenceDiagram
participant Client as "Client App"
participant WrappedController as "Wrapped Controller"
participant Generator as "Wrapped Generator"
participant Insights as "Insights Service"
participant Storage as "Storage Service"
participant Queue as "Background Queue"
Client->>WrappedController : POST /wrapped/generate
WrappedController->>Generator : createWrappedReport(userId, year)
Generator->>Insights : analyzeUserData(userId)
Insights-->>Generator : userInsights
Generator->>Generator : generateNarrative(insights)
Generator->>Storage : createMediaAssets(insights)
Storage-->>Generator : assetUrls
Generator-->>WrappedController : wrappedReport
WrappedController-->>Client : {reportId, previewUrl}
Note over Queue : Large reports processed asynchronously
Client->>WrappedController : POST /wrapped/generate-async
WrappedController->>Queue : enqueueWrappedGeneration(userId, year)
Queue-->>Client : {jobId, status : 'processing'}
Queue->>Generator : processWrappedGeneration(jobId)
Generator->>Storage : saveFinalReport()
Storage-->>Queue : finalUrl
Queue-->>Client : {jobId, status : 'completed', url : finalUrl}
```

**Diagram sources**
- [wrapped.controller.ts](file://apps/backend/src/wrapped/wrapped.controller.ts)
- [wrapped-generator.service.ts](file://apps/backend/src/wrapped/wrapped-generator.service.ts)
- [wrapped-insights.service.ts](file://apps/backend/src/wrapped/wrapped-insights.service.ts)
- [storage.service.ts](file://apps/backend/src/storage/storage.service.ts)
- [notification-queue.service.ts](file://apps/backend/src/notifications/notification-queue.service.ts)

**Section sources**
- [wrapped.controller.ts](file://apps/backend/src/wrapped/wrapped.controller.ts)
- [wrapped-generator.service.ts](file://apps/backend/src/wrapped/wrapped-generator.service.ts)
- [wrapped-insights.service.ts](file://apps/backend/src/wrapped/wrapped-insights.service.ts)
- [wrapped-share.service.ts](file://apps/backend/src/wrapped/wrapped-share.service.ts)

### Export and File Management
The storage module handles various export formats and file management operations.

```mermaid
classDiagram
class StorageController {
+uploadFile(file) UploadResponse
+downloadFile(fileId) DownloadResponse
+exportReport(reportId, format) ExportResponse
+deleteFile(fileId) DeleteResponse
+listFiles(filters) FileListResponse
}
class StorageService {
-storageProvider
-encryptionService
+saveFile(fileBuffer, metadata) Promise~FileMetadata~
+getFile(fileId) Promise~FileBuffer~
+deleteFile(fileId) Promise~boolean~
+generateSignedUrl(fileId, expiresIn) string
+convertFormat(fileBuffer, targetFormat) Buffer
}
class ImageProcessorService {
+resizeImage(imageBuffer, dimensions) Buffer
+compressImage(imageBuffer, quality) Buffer
+convertToPdf(imageBuffers) Buffer
+extractMetadata(fileBuffer) Metadata
+watermarkImage(imageBuffer, watermark) Buffer
}
StorageController --> StorageService : "uses"
StorageService --> ImageProcessorService : "delegates"
```

**Diagram sources**
- [storage.controller.ts](file://apps/backend/src/storage/storage.controller.ts)
- [storage.service.ts](file://apps/backend/src/storage/storage.service.ts)
- [image-processor.service.ts](file://apps/backend/src/storage/image-processor.service.ts)

**Section sources**
- [storage.controller.ts](file://apps/backend/src/storage/storage.controller.ts)
- [storage.service.ts](file://apps/backend/src/storage/storage.service.ts)
- [image-processor.service.ts](file://apps/backend/src/storage/image-processor.service.ts)

### Background Job Processing
Background jobs handle large dataset processing and asynchronous report generation.

```mermaid
stateDiagram-v2
[*] --> Queued : "Job Enqueued"
Queued --> Processing : "Worker Picks Up"
Processing --> Generating : "Processing Data"
Generating --> Rendering : "Rendering Report"
Rendering --> Uploading : "Uploading Files"
Uploading --> Completed : "All Steps Complete"
Processing --> Failed : "Error Occurred"
Generating --> Failed : "Processing Error"
Rendering --> Failed : "Rendering Error"
Uploading --> Failed : "Upload Error"
Failed --> Retrying : "Retry Attempt"
Retrying --> Processing : "Retry Success"
Retrying --> Failed : "Max Retries Exceeded"
Completed --> [*]
Failed --> [*]
```

**Diagram sources**
- [notification-queue.service.ts](file://apps/backend/src/notifications/notification-queue.service.ts)
- [scheduler.service.ts](file://apps/backend/src/notifications/scheduler.service.ts)
- [bullmq.module.ts](file://apps/backend/src/bullmq/bullmq.module.ts)

**Section sources**
- [notification-queue.service.ts](file://apps/backend/src/notifications/notification-queue.service.ts)
- [scheduler.service.ts](file://apps/backend/src/notifications/scheduler.service.ts)
- [bullmq.module.ts](file://apps/backend/src/bullmq/bullmq.module.ts)

## Dependency Analysis
The report generation system has well-defined dependencies between components:

```mermaid
graph TB
subgraph "Controllers"
AC["Analytics Controller"]
WC["Wrapped Controller"]
SC["Storage Controller"]
NC["Notifications Controller"]
end
subgraph "Services"
AS["Analytics Service"]
WGS["Wrapped Generator"]
STS["Storage Service"]
NQS["Notification Queue"]
end
subgraph "External Dependencies"
PR["Prisma Database"]
RS["Redis Cache"]
BM["BullMQ Queue"]
FS["File System"]
end
AC --> AS
WC --> WGS
SC --> STS
NC --> NQS
AS --> PR
AS --> RS
WGS --> PR
WGS --> RS
STS --> FS
NQS --> BM
PR --> |ORM| DB[(PostgreSQL)]
RS --> |In-Memory| MEM[(Redis)]
BM --> |Message Queue| MQ[(Redis Queue)]
```

**Diagram sources**
- [app.module.ts](file://apps/backend/src/app.module.ts)
- [prisma.service.ts](file://apps/backend/src/prisma/prisma.service.ts)
- [redis.service.ts](file://apps/backend/src/redis/redis.service.ts)
- [bullmq.module.ts](file://apps/backend/src/bullmq/bullmq.module.ts)

**Section sources**
- [app.module.ts](file://apps/backend/src/app.module.ts)
- [prisma.service.ts](file://apps/backend/src/prisma/prisma.service.ts)
- [redis.service.ts](file://apps/backend/src/redis/redis.service.ts)
- [bullmq.module.ts](file://apps/backend/src/bullmq/bullmq.module.ts)

## Performance Considerations
Key performance optimizations implemented in the report generation system:

### Caching Strategy
- Redis caching for frequently accessed report data
- Template result caching with configurable TTL
- Aggregated metrics caching for dashboard endpoints

### Database Optimization
- Efficient Prisma queries with proper indexing
- Batch operations for large dataset processing
- Connection pooling for optimal database performance

### Memory Management
- Stream processing for large file exports
- Lazy loading of report templates
- Garbage collection optimization for long-running jobs

### Concurrency Control
- Rate limiting for report generation endpoints
- Queue-based job processing for scalability
- Distributed locking for concurrent access

## Troubleshooting Guide
Common issues and their solutions in the report generation system:

### Report Generation Failures
- **Template Loading Errors**: Verify template file paths and permissions
- **Data Binding Issues**: Check parameter validation and data availability
- **Memory Limit Exceeded**: Implement streaming for large datasets

### Background Job Issues
- **Queue Overflow**: Monitor queue size and implement cleanup policies
- **Job Timeouts**: Adjust timeout configurations for large reports
- **Worker Crashes**: Implement health checks and automatic restarts

### Export Problems
- **File Format Errors**: Validate input data for target format compatibility
- **Storage Access Issues**: Check file system permissions and disk space
- **Network Timeouts**: Implement retry logic for external service calls

**Section sources**
- [analytics.service.ts](file://apps/backend/src/analytics/analytics.service.ts)
- [storage.service.ts](file://apps/backend/src/storage/storage.service.ts)
- [notification-queue.service.ts](file://apps/backend/src/notifications/notification-queue.service.ts)

## Conclusion
The report generation API provides a comprehensive solution for creating, customizing, and exporting reports in multiple formats. The modular architecture ensures scalability and maintainability, while the background job processing enables handling of large datasets without blocking user requests. The template system offers flexibility for report customization, and the caching strategies optimize performance for frequently accessed data.

## Appendices

### API Endpoints Reference
- **Report Generation**: POST /api/reports/generate
- **Async Report Generation**: POST /api/reports/generate-async
- **Report Status**: GET /api/reports/:id/status
- **Report Download**: GET /api/reports/:id/download
- **Template Management**: POST /api/templates, GET /api/templates/:id
- **Export Formats**: Support for PDF, CSV, JSON, and custom formats

### Configuration Options
- **Report Templates**: Configurable template paths and variables
- **Export Settings**: Format-specific configuration options
- **Queue Settings**: Worker count, retry policies, and timeouts
- **Caching Policies**: TTL values and cache invalidation strategies

**Section sources**
- [configuration.ts](file://apps/backend/src/config/configuration.ts)
- [env.validation.ts](file://apps/backend/src/config/env.validation.ts)
- [common.module.ts](file://apps/backend/src/common/common.module.ts)
- [core.module.ts](file://apps/backend/src/core/core.module.ts)