# Performance Monitoring & Analytics

<cite>
**Referenced Files in This Document**
- [app.bootstrap.ts](file://apps/backend/src/app.bootstrap.ts)
- [app.module.ts](file://apps/backend/src/app.module.ts)
- [main.ts](file://apps/backend/src/main.ts)
- [observability.module.ts](file://apps/backend/src/observability/observability.module.ts)
- [metrics.service.ts](file://apps/backend/src/observability/metrics.service.ts)
- [metrics.controller.ts](file://apps/backend/src/observability/metrics.controller.ts)
- [performance.service.ts](file://apps/backend/src/observability/performance.service.ts)
- [tracing.service.ts](file://apps/backend/src/observability/tracing.service.ts)
- [logging.service.ts](file://apps/backend/src/observability/logging.service.ts)
- [health-metrics.service.ts](file://apps/backend/src/observability/health-metrics.service.ts)
- [request-metrics.middleware.ts](file://apps/backend/src/observability/request-metrics.middleware.ts)
- [analytics.module.ts](file://apps/backend/src/analytics/analytics.module.ts)
- [analytics.service.ts](file://apps/backend/src/analytics/analytics.service.ts)
- [analytics-aggregation.service.ts](file://apps/backend/src/analytics/analytics-aggregation.service.ts)
- [dashboard.service.ts](file://apps/backend/src/analytics/dashboard.service.ts)
- [insights.service.ts](file://apps/backend/src/analytics/insights.service.ts)
- [streak.service.ts](file://apps/backend/src/analytics/streak.service.ts)
- [database-optimization.service.ts](file://apps/backend/src/hardening/database-optimization.service.ts)
- [query-analysis.service.ts](file://apps/backend/src/hardening/query-analysis.service.ts)
- [performance-audit.service.ts](file://apps/backend/src/hardening/performance-audit.service.ts)
- [rate-limit-audit.service.ts](file://apps/backend/src/hardening/rate-limit-audit.service.ts)
- [load-test-support.service.ts](file://apps/backend/src/hardening/load-test-support.service.ts)
- [prisma-health.indicator.ts](file://apps/backend/src/health/prisma-health.indicator.ts)
- [health.controller.ts](file://apps/backend/src/health/health.controller.ts)
- [health.module.ts](file://apps/backend/src/health/health.module.ts)
- [load.yml](file://apps/backend/loadtests/artillery/load.yml)
- [smoke.yml](file://apps/backend/loadtests/artillery/smoke.yml)
- [load.js](file://apps/backend/loadtests/k6/load.js)
- [smoke.js](file://apps/backend/loadtests/k6/smoke.js)
- [soak.js](file://apps/backend/loadtests/k6/soak.js)
- [spike.js](file://apps/backend/loadtests/k6/spike.js)
- [stress.js](file://apps/backend/loadtests/k6/stress.js)
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
This document explains how performance monitoring and analytics are implemented across the application. It covers how metrics are collected, how bottlenecks are identified, and how the observability stack integrates with external tools. It also includes guidance for profiling, memory analysis, database query optimization, and alerting strategies.

## Project Structure
The backend is a NestJS application with dedicated modules for observability, analytics, hardening (performance), health checks, and load testing. The frontend exposes analytics UI components and hooks but this document focuses on backend telemetry and analytics services.

```mermaid
graph TB
subgraph "Backend"
A["App Bootstrap<br/>app.bootstrap.ts"]
B["App Module<br/>app.module.ts"]
C["Main Entry<br/>main.ts"]
O["Observability Module<br/>observability.module.ts"]
M["Metrics Service<br/>metrics.service.ts"]
MC["Metrics Controller<br/>metrics.controller.ts"]
P["Performance Service<br/>performance.service.ts"]
T["Tracing Service<br/>tracing.service.ts"]
L["Logging Service<br/>logging.service.ts"]
H["Health Metrics Service<br/>health-metrics.service.ts"]
RM["Request Metrics Middleware<br/>request-metrics.middleware.ts"]
AN["Analytics Module<br/>analytics.module.ts"]
AS["Analytics Service<br/>analytics.service.ts"]
AGG["Analytics Aggregation<br/>analytics-aggregation.service.ts"]
DBS["Dashboard Service<br/>dashboard.service.ts"]
INS["Insights Service<br/>insights.service.ts"]
STR["Streak Service<br/>streak.service.ts"]
HD["Hardening: Database Optimization<br/>database-optimization.service.ts"]
QA["Hardening: Query Analysis<br/>query-analysis.service.ts"]
PA["Hardening: Performance Audit<br/>performance-audit.service.ts"]
RL["Hardening: Rate Limit Audit<br/>rate-limit-audit.service.ts"]
LT["Hardening: Load Test Support<br/>load-test-support.service.ts"]
HC["Health Controller<br/>health.controller.ts"]
HM["Health Module<br/>health.module.ts"]
PH["Prisma Health Indicator<br/>prisma-health.indicator.ts"]
end
C --> A --> B --> O
O --> M
O --> P
O --> T
O --> L
O --> H
O --> RM
B --> AN
AN --> AS --> AGG
AN --> DBS
AN --> INS
AN --> STR
B --> HD
B --> QA
B --> PA
B --> RL
B --> LT
B --> HC
HC --> HM --> PH
```

**Diagram sources**
- [app.bootstrap.ts](file://apps/backend/src/app.bootstrap.ts)
- [app.module.ts](file://apps/backend/src/app.module.ts)
- [main.ts](file://apps/backend/src/main.ts)
- [observability.module.ts](file://apps/backend/src/observability/observability.module.ts)
- [metrics.service.ts](file://apps/backend/src/observability/metrics.service.ts)
- [metrics.controller.ts](file://apps/backend/src/observability/metrics.controller.ts)
- [performance.service.ts](file://apps/backend/src/observability/performance.service.ts)
- [tracing.service.ts](file://apps/backend/src/observability/tracing.service.ts)
- [logging.service.ts](file://apps/backend/src/observability/logging.service.ts)
- [health-metrics.service.ts](file://apps/backend/src/observability/health-metrics.service.ts)
- [request-metrics.middleware.ts](file://apps/backend/src/observability/request-metrics.middleware.ts)
- [analytics.module.ts](file://apps/backend/src/analytics/analytics.module.ts)
- [analytics.service.ts](file://apps/backend/src/analytics/analytics.service.ts)
- [analytics-aggregation.service.ts](file://apps/backend/src/analytics/analytics-aggregation.service.ts)
- [dashboard.service.ts](file://apps/backend/src/analytics/dashboard.service.ts)
- [insights.service.ts](file://apps/backend/src/analytics/insights.service.ts)
- [streak.service.ts](file://apps/backend/src/analytics/streak.service.ts)
- [database-optimization.service.ts](file://apps/backend/src/hardening/database-optimization.service.ts)
- [query-analysis.service.ts](file://apps/backend/src/hardening/query-analysis.service.ts)
- [performance-audit.service.ts](file://apps/backend/src/hardening/performance-audit.service.ts)
- [rate-limit-audit.service.ts](file://apps/backend/src/hardening/rate-limit-audit.service.ts)
- [load-test-support.service.ts](file://apps/backend/src/hardening/load-test-support.service.ts)
- [health.controller.ts](file://apps/backend/src/health/health.controller.ts)
- [health.module.ts](file://apps/backend/src/health/health.module.ts)
- [prisma-health.indicator.ts](file://apps/backend/src/health/prisma-health.indicator.ts)

**Section sources**
- [app.bootstrap.ts](file://apps/backend/src/app.bootstrap.ts)
- [app.module.ts](file://apps/backend/src/app.module.ts)
- [main.ts](file://apps/backend/src/main.ts)

## Core Components
- Observability module centralizes metrics, tracing, logging, and health metrics collection.
- Metrics controller exposes an endpoint to export metrics in a standard format for scraping by external systems.
- Request metrics middleware captures per-request latency and status codes.
- Analytics module provides business-level event tracking, aggregation, dashboards, insights, and streaks.
- Hardening services provide database optimization, query analysis, performance audits, rate limit auditing, and load test support utilities.
- Health endpoints expose readiness/liveness and database connectivity indicators.

**Section sources**
- [observability.module.ts](file://apps/backend/src/observability/observability.module.ts)
- [metrics.controller.ts](file://apps/backend/src/observability/metrics.controller.ts)
- [request-metrics.middleware.ts](file://apps/backend/src/observability/request-metrics.middleware.ts)
- [analytics.module.ts](file://apps/backend/src/analytics/analytics.module.ts)
- [database-optimization.service.ts](file://apps/backend/src/hardening/database-optimization.service.ts)
- [query-analysis.service.ts](file://apps/backend/src/hardening/query-analysis.service.ts)
- [performance-audit.service.ts](file://apps/backend/src/hardening/performance-audit.service.ts)
- [rate-limit-audit.service.ts](file://apps/backend/src/hardening/rate-limit-audit.service.ts)
- [load-test-support.service.ts](file://apps/backend/src/hardening/load-test-support.service.ts)
- [health.controller.ts](file://apps/backend/src/health/health.controller.ts)
- [health.module.ts](file://apps/backend/src/health/health.module.ts)
- [prisma-health.indicator.ts](file://apps/backend/src/health/prisma-health.indicator.ts)

## Architecture Overview
The observability architecture layers request instrumentation, service-level metrics, and business analytics together. External monitoring tools can scrape metrics via the exposed controller, while logs and traces are emitted through centralized services.

```mermaid
sequenceDiagram
participant Client as "Client"
participant MW as "Request Metrics Middleware"
participant CTRL as "Controller"
participant SVC as "Service Layer"
participant MET as "Metrics Service"
participant LOG as "Logging Service"
participant TRC as "Tracing Service"
participant EXT as "External Monitor (Prometheus/Grafana)"
Client->>MW : HTTP Request
MW->>MET : Increment counters / record latency
MW->>LOG : Structured log entry
MW->>TRC : Start span
MW->>CTRL : Invoke handler
CTRL->>SVC : Business logic
SVC->>MET : Emit custom metrics
SVC->>LOG : Contextual logs
SVC->>TRC : Continue/finish spans
SVC-->>CTRL : Response
CTRL-->>Client : HTTP Response
MW->>EXT : Exported metrics available via /metrics
```

**Diagram sources**
- [request-metrics.middleware.ts](file://apps/backend/src/observability/request-metrics.middleware.ts)
- [metrics.service.ts](file://apps/backend/src/observability/metrics.service.ts)
- [logging.service.ts](file://apps/backend/src/observability/logging.service.ts)
- [tracing.service.ts](file://apps/backend/src/observability/tracing.service.ts)
- [metrics.controller.ts](file://apps/backend/src/observability/metrics.controller.ts)

## Detailed Component Analysis

### Observability Stack
- Metrics Service: Centralized metric emission for counters, gauges, histograms, and summaries.
- Logging Service: Structured logging with correlation IDs and contextual fields.
- Tracing Service: Distributed tracing spans around critical operations.
- Health Metrics Service: Aggregates system and dependency health signals into metrics.
- Request Metrics Middleware: Captures request lifecycle timing and status distribution.

```mermaid
classDiagram
class MetricsService {
+increment(name, tags)
+gauge(name, value, tags)
+histogram(name, value, tags)
+summary(name, value, tags)
}
class LoggingService {
+info(message, context)
+warn(message, context)
+error(message, context)
}
class TracingService {
+startSpan(operation, tags)
+endSpan(span)
+injectContext(headers)
}
class HealthMetricsService {
+reportUptime()
+reportMemory()
+reportDbHealth()
}
class RequestMetricsMiddleware {
+use(req, res, next)
}
MetricsService <.. RequestMetricsMiddleware : "emits request metrics"
LoggingService <.. RequestMetricsMiddleware : "logs requests"
TracingService <.. RequestMetricsMiddleware : "spans requests"
HealthMetricsService --> MetricsService : "reports health gauges"
```

**Diagram sources**
- [metrics.service.ts](file://apps/backend/src/observability/metrics.service.ts)
- [logging.service.ts](file://apps/backend/src/observability/logging.service.ts)
- [tracing.service.ts](file://apps/backend/src/observability/tracing.service.ts)
- [health-metrics.service.ts](file://apps/backend/src/observability/health-metrics.service.ts)
- [request-metrics.middleware.ts](file://apps/backend/src/observability/request-metrics.middleware.ts)

**Section sources**
- [metrics.service.ts](file://apps/backend/src/observability/metrics.service.ts)
- [logging.service.ts](file://apps/backend/src/observability/logging.service.ts)
- [tracing.service.ts](file://apps/backend/src/observability/tracing.service.ts)
- [health-metrics.service.ts](file://apps/backend/src/observability/health-metrics.service.ts)
- [request-metrics.middleware.ts](file://apps/backend/src/observability/request-metrics.middleware.ts)

### Metrics Export and Scraping
- Metrics Controller exposes an endpoint that serializes current metrics for Prometheus or compatible scrapers.
- Ensure the endpoint is secured appropriately in production and only exposed within your monitoring network.

```mermaid
flowchart TD
Start(["HTTP GET /metrics"]) --> Serialize["Serialize registered metrics"]
Serialize --> Headers["Set content-type header"]
Headers --> Return["Return text/plain payload"]
Return --> End(["Scrape by Prometheus/Grafana"])
```

**Diagram sources**
- [metrics.controller.ts](file://apps/backend/src/observability/metrics.controller.ts)

**Section sources**
- [metrics.controller.ts](file://apps/backend/src/observability/metrics.controller.ts)

### Analytics Services
- Analytics Service: Emits domain events and tracks user interactions.
- Analytics Aggregation Service: Computes aggregates over time windows for dashboards.
- Dashboard Service: Provides aggregated views for UI consumption.
- Insights Service: Derives actionable insights from analytics data.
- Streak Service: Tracks consecutive activity patterns.

```mermaid
classDiagram
class AnalyticsService {
+track(event, payload)
+flush()
}
class AnalyticsAggregationService {
+aggregate(window, filters)
+resetWindow()
}
class DashboardService {
+getOverview(filters)
+getTrends(filters)
}
class InsightsService {
+computeInsights(filters)
}
class StreakService {
+calculateStreak(userId, period)
}
AnalyticsService --> AnalyticsAggregationService : "feeds"
AnalyticsAggregationService --> DashboardService : "provides data"
DashboardService --> InsightsService : "uses"
DashboardService --> StreakService : "uses"
```

**Diagram sources**
- [analytics.service.ts](file://apps/backend/src/analytics/analytics.service.ts)
- [analytics-aggregation.service.ts](file://apps/backend/src/analytics/analytics-aggregation.service.ts)
- [dashboard.service.ts](file://apps/backend/src/analytics/dashboard.service.ts)
- [insights.service.ts](file://apps/backend/src/analytics/insights.service.ts)
- [streak.service.ts](file://apps/backend/src/analytics/streak.service.ts)

**Section sources**
- [analytics.module.ts](file://apps/backend/src/analytics/analytics.module.ts)
- [analytics.service.ts](file://apps/backend/src/analytics/analytics.service.ts)
- [analytics-aggregation.service.ts](file://apps/backend/src/analytics/analytics-aggregation.service.ts)
- [dashboard.service.ts](file://apps/backend/src/analytics/dashboard.service.ts)
- [insights.service.ts](file://apps/backend/src/analytics/insights.service.ts)
- [streak.service.ts](file://apps/backend/src/analytics/streak.service.ts)

### Hardening and Performance Tools
- Database Optimization Service: Identifies slow queries and suggests indexes or refactors.
- Query Analysis Service: Inspects query plans and execution stats.
- Performance Audit Service: Periodic audits of hot paths and resource usage.
- Rate Limit Audit Service: Reviews rate limiting effectiveness and abuse patterns.
- Load Test Support Service: Utilities to simulate traffic and measure SLOs.

```mermaid
flowchart TD
A["Load Test Execution"] --> B["Generate Traffic"]
B --> C["Capture Metrics"]
C --> D{"Bottleneck Detected?"}
D --> |Yes| E["Analyze Query Plans"]
E --> F["Recommend Indexes/Refactors"]
F --> G["Apply Optimizations"]
G --> H["Re-run Load Tests"]
H --> I["Validate SLOs"]
D --> |No| J["Report Healthy"]
```

**Diagram sources**
- [database-optimization.service.ts](file://apps/backend/src/hardening/database-optimization.service.ts)
- [query-analysis.service.ts](file://apps/backend/src/hardening/query-analysis.service.ts)
- [performance-audit.service.ts](file://apps/backend/src/hardening/performance-audit.service.ts)
- [rate-limit-audit.service.ts](file://apps/backend/src/hardening/rate-limit-audit.service.ts)
- [load-test-support.service.ts](file://apps/backend/src/hardening/load-test-support.service.ts)

**Section sources**
- [database-optimization.service.ts](file://apps/backend/src/hardening/database-optimization.service.ts)
- [query-analysis.service.ts](file://apps/backend/src/hardening/query-analysis.service.ts)
- [performance-audit.service.ts](file://apps/backend/src/hardening/performance-audit.service.ts)
- [rate-limit-audit.service.ts](file://apps/backend/src/hardening/rate-limit-audit.service.ts)
- [load-test-support.service.ts](file://apps/backend/src/hardening/load-test-support.service.ts)

### Health Checks and Readiness
- Health Controller exposes readiness/liveness endpoints.
- Prisma Health Indicator verifies database connectivity and basic operations.

```mermaid
sequenceDiagram
participant Mon as "Monitor"
participant HC as "Health Controller"
participant HM as "Health Module"
participant PI as "Prisma Health Indicator"
Mon->>HC : GET /health
HC->>HM : Aggregate health checks
HM->>PI : Check DB connectivity
PI-->>HM : Status OK/FAIL
HM-->>Mon : Health response
```

**Diagram sources**
- [health.controller.ts](file://apps/backend/src/health/health.controller.ts)
- [health.module.ts](file://apps/backend/src/health/health.module.ts)
- [prisma-health.indicator.ts](file://apps/backend/src/health/prisma-health.indicator.ts)

**Section sources**
- [health.controller.ts](file://apps/backend/src/health/health.controller.ts)
- [health.module.ts](file://apps/backend/src/health/health.module.ts)
- [prisma-health.indicator.ts](file://apps/backend/src/health/prisma-health.indicator.ts)

## Dependency Analysis
Key dependencies include NestJS core, Prisma ORM, Redis, BullMQ queues, and optional external telemetry backends. The observability module depends on metrics, logging, and tracing services; analytics depends on storage and aggregation services; hardening services depend on database introspection and runtime profiling.

```mermaid
graph LR
App["NestJS App"] --> Obs["Observability Module"]
App --> Ana["Analytics Module"]
App --> Hard["Hardening Services"]
App --> Health["Health Module"]
Obs --> Metrics["Metrics Service"]
Obs --> Log["Logging Service"]
Obs --> Trace["Tracing Service"]
Obs --> HM["Health Metrics Service"]
Obs --> RMW["Request Metrics Middleware"]
Ana --> ASvc["Analytics Service"]
Ana --> Agg["Analytics Aggregation Service"]
Hard --> DBOpt["Database Optimization Service"]
Hard --> QAS["Query Analysis Service"]
Hard --> PAS["Performance Audit Service"]
Hard --> RLAS["Rate Limit Audit Service"]
Hard --> LTS["Load Test Support Service"]
Health --> HC["Health Controller"]
Health --> PHI["Prisma Health Indicator"]
```

**Diagram sources**
- [app.module.ts](file://apps/backend/src/app.module.ts)
- [observability.module.ts](file://apps/backend/src/observability/observability.module.ts)
- [analytics.module.ts](file://apps/backend/src/analytics/analytics.module.ts)
- [database-optimization.service.ts](file://apps/backend/src/hardening/database-optimization.service.ts)
- [query-analysis.service.ts](file://apps/backend/src/hardening/query-analysis.service.ts)
- [performance-audit.service.ts](file://apps/backend/src/hardening/performance-audit.service.ts)
- [rate-limit-audit.service.ts](file://apps/backend/src/hardening/rate-limit-audit.service.ts)
- [load-test-support.service.ts](file://apps/backend/src/hardening/load-test-support.service.ts)
- [health.controller.ts](file://apps/backend/src/health/health.controller.ts)
- [health.module.ts](file://apps/backend/src/health/health.module.ts)
- [prisma-health.indicator.ts](file://apps/backend/src/health/prisma-health.indicator.ts)

**Section sources**
- [app.module.ts](file://apps/backend/src/app.module.ts)

## Performance Considerations
- Instrumentation overhead: Keep histogram buckets and sampling rates tuned to avoid high cardinality and CPU overhead.
- Memory profiling: Use periodic heap snapshots and monitor RSS/heap used via OS and Node metrics.
- Database optimization: Leverage query analysis to identify N+1 queries and missing indexes; use connection pooling and read replicas where applicable.
- Caching strategy: Cache expensive aggregations and frequently accessed entities; implement cache invalidation policies.
- Queue backpressure: Monitor queue depth and consumer lag; scale workers based on throughput and latency SLOs.
- Load testing: Run k6 and Artillery suites regularly to validate capacity and regressions.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
- High latency spikes: Correlate request metrics with tracing spans to isolate slow endpoints and downstream calls.
- Memory growth: Track heap and RSS trends; analyze GC pauses and long-lived references.
- Database slowdowns: Review query analysis reports; add indexes or rewrite queries; check lock contention.
- Alert fatigue: Tune thresholds and grouping rules; ensure alerts are actionable and routed correctly.
- Health check failures: Inspect Prisma health indicator and dependency statuses; verify environment variables and connectivity.

**Section sources**
- [metrics.service.ts](file://apps/backend/src/observability/metrics.service.ts)
- [tracing.service.ts](file://apps/backend/src/observability/tracing.service.ts)
- [logging.service.ts](file://apps/backend/src/observability/logging.service.ts)
- [query-analysis.service.ts](file://apps/backend/src/hardening/query-analysis.service.ts)
- [health.controller.ts](file://apps/backend/src/health/health.controller.ts)
- [prisma-health.indicator.ts](file://apps/backend/src/health/prisma-health.indicator.ts)

## Conclusion
The observability and analytics stack provides comprehensive visibility into application performance and business metrics. By combining request-level instrumentation, structured logging, distributed tracing, and robust analytics services, teams can quickly detect and resolve bottlenecks. Integrating with external monitoring tools and running regular load tests ensures sustained reliability and performance under load.

[No sources needed since this section summarizes without analyzing specific files]

## Appendices

### Example: Performance Profiling Workflow
```mermaid
flowchart TD
Start(["Start Profiling Session"]) --> Enable["Enable Tracing and Metrics"]
Enable --> Capture["Capture Spans and Logs"]
Capture --> Analyze["Analyze Hot Paths"]
Analyze --> Optimize["Apply Optimizations"]
Optimize --> Validate["Re-validate with Load Tests"]
Validate --> End(["Close Session"])
```

[No sources needed since this diagram shows conceptual workflow, not actual code structure]

### Example: Memory Usage Analysis
- Collect Node.js process metrics (RSS, heap total/used).
- Take periodic heap snapshots during load tests.
- Identify large object retention and memory leaks using snapshot diffs.

[No sources needed since this section provides general guidance]

### Example: Database Query Optimization
- Use query analysis to find slow queries and missing indexes.
- Refactor N+1 patterns into batched queries or joins.
- Add appropriate indexes and review query plans after changes.

[No sources needed since this section provides general guidance]

### Integration with External Monitoring Tools
- Scrape metrics via the metrics controller endpoint.
- Configure Prometheus to discover and scrape the endpoint periodically.
- Visualize metrics in Grafana with dashboards for latency, error rates, and resource usage.
- Forward logs to a centralized log aggregator (e.g., Loki, ELK) using structured JSON.

[No sources needed since this section provides general guidance]

### Alerting Rules
- Define thresholds for latency percentiles, error rates, and resource saturation.
- Group alerts by service and environment to reduce noise.
- Route alerts to incident channels with runbooks for quick resolution.

[No sources needed since this section provides general guidance]

### Load Testing Suites
- Artillery scenarios for smoke and load tests.
- k6 scripts for load, soak, spike, and stress testing.

**Section sources**
- [load.yml](file://apps/backend/loadtests/artillery/load.yml)
- [smoke.yml](file://apps/backend/loadtests/artillery/smoke.yml)
- [load.js](file://apps/backend/loadtests/k6/load.js)
- [smoke.js](file://apps/backend/loadtests/k6/smoke.js)
- [soak.js](file://apps/backend/loadtests/k6/soak.js)
- [spike.js](file://apps/backend/loadtests/k6/spike.js)
- [stress.js](file://apps/backend/loadtests/k6/stress.js)