# Deployment Architecture

<cite>
**Referenced Files in This Document**
- [docker-compose.yml](file://apps/backend/docker-compose.yml)
- [docker-compose.dev.yml](file://apps/backend/docker-compose.dev.yml)
- [docker-compose.prod.yml](file://apps/backend/docker-compose.prod.yml)
- [Dockerfile](file://apps/backend/Dockerfile)
- [Dockerfile.dev](file://apps/backend/Dockerfile.dev)
- [ci.yml](file://.github/workflows/ci.yml)
- [release.yml](file://.github/workflows/release.yml)
- [package.json](file://apps/backend/package.json)
- [schema.prisma](file://apps/backend/prisma/schema.prisma)
- [main.ts](file://apps/backend/src/main.ts)
- [app.module.ts](file://apps/backend/src/app.module.ts)
- [health.controller.ts](file://apps/backend/src/health/health.controller.ts)
- [prisma-health.indicator.ts](file://apps/backend/src/health/prisma-health.indicator.ts)
- [metrics.controller.ts](file://apps/backend/src/observability/metrics.controller.ts)
- [logging.service.ts](file://apps/backend/src/observability/logging.service.ts)
- [tracing.service.ts](file://apps/backend/src/observability/tracing.service.ts)
- [redis.service.ts](file://apps/backend/src/redis/redis.service.ts)
- [storage.service.ts](file://apps/backend/src/storage/storage.service.ts)
- [backup.service.ts](file://apps/backend/src/deployment/backup.service.ts)
- [restore.service.ts](file://apps/backend/src/deployment/restore.service.ts)
- [production-configuration.service.ts](file://apps/backend/src/deployment/production-configuration.service.ts)
- [environment-validation.service.ts](file://apps/backend/src/deployment/environment-validation.service.ts)
- [DEPLOYMENT.md](file://docs/DEPLOYMENT.md)
- [BACKUP.md](file://docs/BACKUP.md)
- [DISASTER_RECOVERY.md](file://docs/DISASTER_RECOVERY.md)
- [PRODUCTION.md](file://docs/PRODUCTION.md)
- [OPERATIONS.md](file://docs/OPERATIONS.md)
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
This document describes the deployment architecture for Chronicle Your Media Story, focusing on containerized deployment with Docker Compose for local development and production environments, CI/CD automation via GitHub Actions, infrastructure requirements (PostgreSQL, Redis, storage backends), environment-specific configurations, scaling considerations, monitoring setup, backup and recovery procedures, disaster recovery planning, and production best practices. It also documents health check endpoints, log aggregation, and performance monitoring integrations.

## Project Structure
The backend application is a NestJS service packaged as a Docker image and orchestrated with Docker Compose. The repository includes:
- Container definitions for development and production
- GitHub Actions workflows for CI and release
- Prisma schema and migrations
- Health, observability, and deployment services
- Documentation for operations, backup, and disaster recovery

```mermaid
graph TB
subgraph "Compose Services"
API["Backend API"]
DB["PostgreSQL"]
REDIS["Redis Cache"]
STORAGE["Object Storage"]
end
subgraph "CI/CD"
GHActions["GitHub Actions"]
Build["Build Image"]
Test["Run Tests"]
Publish["Publish Artifact/Image"]
end
Client["Client / Load Balancer"] --> API
API --> DB
API --> REDIS
API --> STORAGE
GHActions --> Build --> Test --> Publish
```

**Diagram sources**
- [docker-compose.yml](file://apps/backend/docker-compose.yml)
- [docker-compose.dev.yml](file://apps/backend/docker-compose.dev.yml)
- [docker-compose.prod.yml](file://apps/backend/docker-compose.prod.yml)
- [ci.yml](file://.github/workflows/ci.yml)
- [release.yml](file://.github/workflows/release.yml)

**Section sources**
- [docker-compose.yml](file://apps/backend/docker-compose.yml)
- [docker-compose.dev.yml](file://apps/backend/docker-compose.dev.yml)
- [docker-compose.prod.yml](file://apps/backend/docker-compose.prod.yml)
- [ci.yml](file://.github/workflows/ci.yml)
- [release.yml](file://.github/workflows/release.yml)

## Core Components
- Backend API: NestJS application serving REST APIs, background jobs, and internal services.
- PostgreSQL: Relational database for persistent data; managed by Prisma ORM.
- Redis: In-memory cache and job queue backing for background processing.
- Object Storage: Pluggable storage backend for media assets.
- Observability: Health checks, metrics, logging, and tracing exposed via controllers and services.
- Deployment utilities: Backup and restore services, environment validation, and production configuration helpers.

Key runtime entry points and modules:
- Application bootstrap and module composition
- Health controller and indicators
- Metrics controller for Prometheus scraping
- Logging and tracing services
- Redis integration
- Storage abstraction

**Section sources**
- [main.ts](file://apps/backend/src/main.ts)
- [app.module.ts](file://apps/backend/src/app.module.ts)
- [health.controller.ts](file://apps/backend/src/health/health.controller.ts)
- [prisma-health.indicator.ts](file://apps/backend/src/health/prisma-health.indicator.ts)
- [metrics.controller.ts](file://apps/backend/src/observability/metrics.controller.ts)
- [logging.service.ts](file://apps/backend/src/observability/logging.service.ts)
- [tracing.service.ts](file://apps/backend/src/observability/tracing.service.ts)
- [redis.service.ts](file://apps/backend/src/redis/redis.service.ts)
- [storage.service.ts](file://apps/backend/src/storage/storage.service.ts)
- [backup.service.ts](file://apps/backend/src/deployment/backup.service.ts)
- [restore.service.ts](file://apps/backend/src/deployment/restore.service.ts)
- [production-configuration.service.ts](file://apps/backend/src/deployment/production-configuration.service.ts)
- [environment-validation.service.ts](file://apps/backend/src/deployment/environment-validation.service.ts)

## Architecture Overview
The system deploys as a set of containers orchestrated by Docker Compose. The API depends on PostgreSQL and Redis, and writes media to an object storage backend. Health and metrics endpoints are exposed for orchestration and monitoring. CI/CD automates testing, building, and publishing artifacts/images.

```mermaid
graph TB
subgraph "Runtime"
A["API Service<br/>NestJS"]
B["PostgreSQL<br/>Persistent Volume"]
C["Redis<br/>Cache + Queue"]
D["Object Storage<br/>S3-compatible or LocalFS"]
end
subgraph "Observability"
H["Health Endpoint"]
M["Metrics Endpoint"]
L["Structured Logs"]
T["Traces"]
end
A --> B
A --> C
A --> D
A --> H
A --> M
A --> L
A --> T
```

**Diagram sources**
- [docker-compose.yml](file://apps/backend/docker-compose.yml)
- [docker-compose.prod.yml](file://apps/backend/docker-compose.prod.yml)
- [health.controller.ts](file://apps/backend/src/health/health.controller.ts)
- [metrics.controller.ts](file://apps/backend/src/observability/metrics.controller.ts)
- [logging.service.ts](file://apps/backend/src/observability/logging.service.ts)
- [tracing.service.ts](file://apps/backend/src/observability/tracing.service.ts)

## Detailed Component Analysis

### Containerization Strategy
- Development image: Optimized for hot reload and debugging.
- Production image: Multi-stage build for minimal runtime footprint.
- Compose profiles: Separate compose files for dev and prod with distinct volumes, networks, and environment variables.

```mermaid
flowchart TD
Start(["Build"]) --> DevImage["Dev Image<br/>Hot Reload Enabled"]
Start --> ProdImage["Prod Image<br/>Optimized Layers"]
DevImage --> ComposeDev["Compose Dev<br/>Local Volumes"]
ProdImage --> ComposeProd["Compose Prod<br/>Managed Volumes"]
ComposeDev --> RunDev["Run Locally"]
ComposeProd --> Deploy["Deploy to Target"]
```

**Diagram sources**
- [Dockerfile](file://apps/backend/Dockerfile)
- [Dockerfile.dev](file://apps/backend/Dockerfile.dev)
- [docker-compose.yml](file://apps/backend/docker-compose.yml)
- [docker-compose.dev.yml](file://apps/backend/docker-compose.dev.yml)
- [docker-compose.prod.yml](file://apps/backend/docker-compose.prod.yml)

**Section sources**
- [Dockerfile](file://apps/backend/Dockerfile)
- [Dockerfile.dev](file://apps/backend/Dockerfile.dev)
- [docker-compose.yml](file://apps/backend/docker-compose.yml)
- [docker-compose.dev.yml](file://apps/backend/docker-compose.dev.yml)
- [docker-compose.prod.yml](file://apps/backend/docker-compose.prod.yml)

### CI/CD Pipeline (GitHub Actions)
- CI workflow: Installs dependencies, runs tests, builds the application image, and publishes artifacts.
- Release workflow: Triggers on tags/releases, builds images, pushes to registry, and can trigger deployments.

```mermaid
sequenceDiagram
participant Dev as "Developer"
participant GH as "GitHub"
participant CI as "CI Workflow"
participant Reg as "Container Registry"
participant Ops as "Deployment"
Dev->>GH : Push code / Create tag
GH->>CI : Trigger ci.yml
CI->>CI : Install deps & run tests
CI->>CI : Build image
CI-->>Reg : Push image
GH->>CI : Trigger release.yml
CI->>Reg : Push release image
CI-->>Ops : Notify deploy target
```

**Diagram sources**
- [ci.yml](file://.github/workflows/ci.yml)
- [release.yml](file://.github/workflows/release.yml)

**Section sources**
- [ci.yml](file://.github/workflows/ci.yml)
- [release.yml](file://.github/workflows/release.yml)

### Infrastructure Requirements
- PostgreSQL: Persistent relational store used by Prisma. Requires volume persistence and migration execution at startup.
- Redis: Cache and queue backend for background tasks.
- Storage Backends: Configurable object storage (e.g., S3-compatible or local filesystem).
- Networking: Internal network for service communication; external exposure only for API and health/metrics endpoints as needed.

```mermaid
erDiagram
POSTGRES {
uuid id PK
string name
timestamp created_at
}
REDIS {
string key
string value
timestamp expires_at
}
STORAGE {
string bucket
string path
string etag
}
API_SERVICE {
string hostname
int port
string version
}
API_SERVICE ||--o{ POSTGRES : "connects to"
API_SERVICE ||--o{ REDIS : "connects to"
API_SERVICE ||--o{ STORAGE : "writes/read"
```

**Diagram sources**
- [schema.prisma](file://apps/backend/prisma/schema.prisma)
- [redis.service.ts](file://apps/backend/src/redis/redis.service.ts)
- [storage.service.ts](file://apps/backend/src/storage/storage.service.ts)

**Section sources**
- [schema.prisma](file://apps/backend/prisma/schema.prisma)
- [redis.service.ts](file://apps/backend/src/redis/redis.service.ts)
- [storage.service.ts](file://apps/backend/src/storage/storage.service.ts)

### Environment-Specific Configuration
- Development: Hot reload, verbose logs, local storage, and debug flags.
- Production: Minimal logs, hardened settings, external secrets, and resource limits.
- Validation: Runtime environment validation ensures required keys exist before boot.

```mermaid
flowchart TD
EnvStart["Process Start"] --> Validate["Validate Env Vars"]
Validate --> Valid{"All Required?"}
Valid --> |No| Abort["Abort Boot with Error"]
Valid --> |Yes| Apply["Apply Profile<br/>Dev/Prod"]
Apply --> Ready["Service Ready"]
```

**Diagram sources**
- [environment-validation.service.ts](file://apps/backend/src/deployment/environment-validation.service.ts)
- [production-configuration.service.ts](file://apps/backend/src/deployment/production-configuration.service.ts)

**Section sources**
- [environment-validation.service.ts](file://apps/backend/src/deployment/environment-validation.service.ts)
- [production-configuration.service.ts](file://apps/backend/src/deployment/production-configuration.service.ts)

### Health Check Endpoints
- Health controller exposes readiness/liveness endpoints.
- Database health indicator verifies connectivity and schema status.
- Metrics endpoint exposes Prometheus-compatible metrics.

```mermaid
sequenceDiagram
participant LB as "Load Balancer"
participant API as "API Service"
participant HC as "Health Controller"
participant DBI as "DB Health Indicator"
LB->>API : GET /health
API->>HC : Route to health
HC->>DBI : Check DB connectivity
DBI-->>HC : Status OK/Down
HC-->>LB : 200 OK or 503 Unhealthy
```

**Diagram sources**
- [health.controller.ts](file://apps/backend/src/health/health.controller.ts)
- [prisma-health.indicator.ts](file://apps/backend/src/health/prisma-health.indicator.ts)

**Section sources**
- [health.controller.ts](file://apps/backend/src/health/health.controller.ts)
- [prisma-health.indicator.ts](file://apps/backend/src/health/prisma-health.indicator.ts)

### Monitoring and Observability
- Metrics: Prometheus scrape endpoint for CPU, memory, HTTP, and custom business metrics.
- Logging: Structured JSON logs emitted via logging service; aggregate centrally.
- Tracing: Distributed tracing enabled via tracing service for request spans.

```mermaid
graph TB
App["API Service"] --> Metrics["/metrics"]
App --> Logs["Structured Logs"]
App --> Traces["Traces"]
Metrics --> PM["Prometheus"]
Logs --> ELK["Log Aggregator"]
Traces --> OTLP["Tracing Collector"]
```

**Diagram sources**
- [metrics.controller.ts](file://apps/backend/src/observability/metrics.controller.ts)
- [logging.service.ts](file://apps/backend/src/observability/logging.service.ts)
- [tracing.service.ts](file://apps/backend/src/observability/tracing.service.ts)

**Section sources**
- [metrics.controller.ts](file://apps/backend/src/observability/metrics.controller.ts)
- [logging.service.ts](file://apps/backend/src/observability/logging.service.ts)
- [tracing.service.ts](file://apps/backend/src/observability/tracing.service.ts)

### Backup and Recovery Procedures
- Backup service: Exports database snapshots and metadata; supports scheduled runs.
- Restore service: Restores from backups with integrity checks and rollback hooks.
- Operational scripts: Backup shell script for CLI-driven maintenance.

```mermaid
flowchart TD
Start(["Backup Initiated"]) --> Snapshot["Create DB Snapshot"]
Snapshot --> Metadata["Export Metadata"]
Metadata --> Store["Store in Backup Location"]
Store --> Verify["Verify Integrity"]
Verify --> Done(["Backup Complete"])
subgraph "Restore Flow"
RStart(["Restore Initiated"]) --> Select["Select Backup"]
Select --> PreCheck["Pre-Restore Checks"]
PreCheck --> Rollback["Rollback Current State"]
Rollback --> Import["Import Snapshot"]
Import --> PostCheck["Post-Restore Validation"]
PostCheck --> RDone(["Restore Complete"])
end
```

**Diagram sources**
- [backup.service.ts](file://apps/backend/src/deployment/backup.service.ts)
- [restore.service.ts](file://apps/backend/src/deployment/restore.service.ts)

**Section sources**
- [backup.service.ts](file://apps/backend/src/deployment/backup.service.ts)
- [restore.service.ts](file://apps/backend/src/deployment/restore.service.ts)

### Scaling Considerations
- Horizontal scaling: Stateless API instances behind a load balancer; shared state via Redis and external storage.
- Database scaling: Read replicas and connection pooling; consider managed PostgreSQL for HA.
- Cache scaling: Redis cluster or managed Redis for high availability.
- Resource limits: Configure CPU/memory limits per container; tune worker concurrency for background jobs.

[No sources needed since this section provides general guidance]

### Disaster Recovery Planning
- RPO/RTO targets defined in operational docs.
- Automated backups with retention policies and offsite replication.
- Periodic DR drills to validate restore procedures and runbooks.

**Section sources**
- [DISASTER_RECOVERY.md](file://docs/DISASTER_RECOVERY.md)
- [BACKUP.md](file://docs/BACKUP.md)

### Production Deployment Best Practices
- Use immutable images and signed registries.
- Externalize secrets via environment managers or secret stores.
- Enable structured logging and centralized aggregation.
- Implement graceful shutdown and rolling updates.
- Enforce least privilege and network segmentation.

**Section sources**
- [PRODUCTION.md](file://docs/PRODUCTION.md)
- [OPERATIONS.md](file://docs/OPERATIONS.md)

## Dependency Analysis
The backend depends on PostgreSQL, Redis, and a configurable storage backend. Observability components expose endpoints consumed by external systems.

```mermaid
graph LR
API["API Service"] --> PG["PostgreSQL"]
API --> RD["Redis"]
API --> ST["Object Storage"]
API --> HC["Health Controller"]
API --> MC["Metrics Controller"]
API --> LS["Logging Service"]
API --> TS["Tracing Service"]
```

**Diagram sources**
- [app.module.ts](file://apps/backend/src/app.module.ts)
- [redis.service.ts](file://apps/backend/src/redis/redis.service.ts)
- [storage.service.ts](file://apps/backend/src/storage/storage.service.ts)
- [health.controller.ts](file://apps/backend/src/health/health.controller.ts)
- [metrics.controller.ts](file://apps/backend/src/observability/metrics.controller.ts)
- [logging.service.ts](file://apps/backend/src/observability/logging.service.ts)
- [tracing.service.ts](file://apps/backend/src/observability/tracing.service.ts)

**Section sources**
- [app.module.ts](file://apps/backend/src/app.module.ts)
- [redis.service.ts](file://apps/backend/src/redis/redis.service.ts)
- [storage.service.ts](file://apps/backend/src/storage/storage.service.ts)
- [health.controller.ts](file://apps/backend/src/health/health.controller.ts)
- [metrics.controller.ts](file://apps/backend/src/observability/metrics.controller.ts)
- [logging.service.ts](file://apps/backend/src/observability/logging.service.ts)
- [tracing.service.ts](file://apps/backend/src/observability/tracing.service.ts)

## Performance Considerations
- Connection pooling for PostgreSQL and Redis to reduce latency under load.
- Background job queues for heavy processing; scale workers independently.
- Caching strategies with invalidation policies to minimize DB pressure.
- Efficient image layers and dependency caching in CI to speed up builds.
- Monitor metrics and traces to identify bottlenecks and optimize hot paths.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
- Health checks failing: Inspect DB connectivity and Redis reachability; verify environment variables and secrets.
- High memory usage: Review worker concurrency and GC tuning; analyze heap dumps if available.
- Slow queries: Use query analysis tools and enable slow query logs; add indexes where appropriate.
- Storage errors: Validate credentials and permissions; test upload/download flows.
- CI failures: Check dependency installation, test outputs, and linting rules.

**Section sources**
- [health.controller.ts](file://apps/backend/src/health/health.controller.ts)
- [prisma-health.indicator.ts](file://apps/backend/src/health/prisma-health.indicator.ts)
- [redis.service.ts](file://apps/backend/src/redis/redis.service.ts)
- [storage.service.ts](file://apps/backend/src/storage/storage.service.ts)
- [ci.yml](file://.github/workflows/ci.yml)

## Conclusion
Chronicle Your Media Story uses a robust, containerized architecture with clear separation of concerns, strong observability, and automated CI/CD. By following the documented best practices for environment configuration, scaling, monitoring, backup, and disaster recovery, teams can reliably operate both local development and production environments.

## Appendices

### Environment Variables and Secrets
- Database connection strings and credentials
- Redis URL and optional password
- Storage backend configuration (provider, bucket, credentials)
- Feature flags and logging levels
- Security tokens and encryption keys

[No sources needed since this section provides general guidance]

### Compose Profiles and Overrides
- Development profile: hot reload, debug ports, local volumes
- Production profile: resource limits, health checks, external secrets
- Network isolation and service discovery

**Section sources**
- [docker-compose.yml](file://apps/backend/docker-compose.yml)
- [docker-compose.dev.yml](file://apps/backend/docker-compose.dev.yml)
- [docker-compose.prod.yml](file://apps/backend/docker-compose.prod.yml)

### Package Scripts and Tooling
- Build, test, lint, seed, and deploy scripts
- Load testing and smoke tests for CI validation

**Section sources**
- [package.json](file://apps/backend/package.json)

### Documentation References
- Deployment guide and operational runbook
- Backup and disaster recovery procedures
- Production hardening checklist

**Section sources**
- [DEPLOYMENT.md](file://docs/DEPLOYMENT.md)
- [BACKUP.md](file://docs/BACKUP.md)
- [DISASTER_RECOVERY.md](file://docs/DISASTER_RECOVERY.md)
- [PRODUCTION.md](file://docs/PRODUCTION.md)
- [OPERATIONS.md](file://docs/OPERATIONS.md)