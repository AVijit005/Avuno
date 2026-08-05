# Data Flow Architecture

<cite>
**Referenced Files in This Document**
- [main.ts](file://apps/backend/src/main.ts)
- [app.module.ts](file://apps/backend/src/app.module.ts)
- [bullmq.module.ts](file://apps/backend/src/bullmq/bullmq.module.ts)
- [redis.service.ts](file://apps/backend/src/redis/redis.service.ts)
- [media.controller.ts](file://apps/backend/src/media/media.controller.ts)
- [media.service.ts](file://apps/backend/src/media/media.service.ts)
- [media.repository.ts](file://apps/backend/src/media/media.repository.ts)
- [upload.service.ts](file://apps/backend/src/storage/upload.service.ts)
- [storage.service.ts](file://apps/backend/src/storage/storage.service.ts)
- [journal.controller.ts](file://apps/backend/src/journal/journal.controller.ts)
- [journal.service.ts](file://apps/backend/src/journal/journal.service.ts)
- [journal.repository.ts](file://apps/backend/src/journal/journal.repository.ts)
- [analytics.controller.ts](file://apps/backend/src/analytics/analytics.controller.ts)
- [analytics.service.ts](file://apps/backend/src/analytics/analytics.service.ts)
- [analytics-aggregation.service.ts](file://apps/backend/src/analytics/analytics-aggregation.service.ts)
- [dashboard.service.ts](file://apps/backend/src/analytics/dashboard.service.ts)
- [streak.service.ts](file://apps/backend/src/analytics/streak.service.ts)
- [notifications.controller.ts](file://apps/backend/src/notifications/notifications.controller.ts)
- [notification-queue.service.ts](file://apps/backend/src/notifications/notification-queue.service.ts)
- [scheduler.service.ts](file://apps/backend/src/notifications/scheduler.service.ts)
- [cache.service.ts](file://apps/backend/src/hardening/cache.service.ts)
- [cache-invalidation.service.ts](file://apps/backend/src/hardening/cache-invalidation.service.ts)
- [core.module.ts](file://apps/backend/src/core/core.module.ts)
- [events/index.ts](file://apps/backend/src/core/events/index.ts)
- [transaction/index.ts](file://apps/backend/src/core/transaction/index.ts)
- [prisma.service.ts](file://apps/backend/src/prisma/prisma.service.ts)
- [schema.prisma](file://apps/backend/prisma/schema.prisma)
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

## Introduction
This document explains how data moves through the Chronicle Your Media Story system, focusing on request-response cycles from frontend components to API endpoints, database operations, event-driven propagation, background job processing with BullMQ, caching with Redis, transaction management, and data consistency strategies. It includes sequence diagrams for typical workflows such as media upload, journal entry creation, and analytics aggregation.

## Project Structure
The backend is a NestJS application organized by feature modules (media, journal, analytics, notifications, storage, etc.) with shared core capabilities (events, transactions, cache, Prisma). The entry point initializes the HTTP server, global interceptors/filters, and module graph. Feature controllers expose REST endpoints; services encapsulate business logic; repositories abstract persistence via Prisma. Background jobs are managed by BullMQ with Redis as the queue store. Caching is provided by a dedicated service layer over Redis.

```mermaid
graph TB
Client["Frontend App"] --> API["NestJS API Server<br/>main.ts"]
API --> Modules["Feature Modules<br/>media, journal, analytics, notifications, storage"]
Modules --> Services["Services<br/>business logic"]
Services --> Repositories["Repositories<br/>Prisma access"]
Services --> Cache["Redis Cache Service"]
Services --> Events["Event Publisher Abstraction"]
Events --> Queue["BullMQ Queue"]
Queue --> Workers["Background Workers"]
Workers --> DB["Database (PostgreSQL)"]
Workers --> Storage["Object Storage"]
```

**Diagram sources**
- [main.ts](file://apps/backend/src/main.ts)
- [app.module.ts](file://apps/backend/src/app.module.ts)
- [bullmq.module.ts](file://apps/backend/src/bullmq/bullmq.module.ts)
- [redis.service.ts](file://apps/backend/src/redis/redis.service.ts)
- [media.controller.ts](file://apps/backend/src/media/media.controller.ts)
- [journal.controller.ts](file://apps/backend/src/journal/journal.controller.ts)
- [analytics.controller.ts](file://apps/backend/src/analytics/analytics.controller.ts)
- [notifications.controller.ts](file://apps/backend/src/notifications/notifications.controller.ts)

**Section sources**
- [main.ts](file://apps/backend/src/main.ts)
- [app.module.ts](file://apps/backend/src/app.module.ts)

## Core Components
- Controllers: Define HTTP endpoints for media, journal, analytics, notifications, and storage. They validate inputs, delegate to services, and return standardized responses.
- Services: Implement domain logic, orchestrate repositories, publish events, interact with cache, and manage transactions.
- Repositories: Encapsulate Prisma queries and mutations for each domain entity.
- Event Publisher: Decouples producers from consumers; events are enqueued into BullMQ for async processing.
- Background Jobs: BullMQ workers process queued tasks like notifications, aggregations, and cleanup.
- Cache: Redis-backed caching service with invalidation helpers.
- Transaction Manager: Wraps multi-step operations in database transactions for consistency.
- Prisma: ORM providing type-safe database access and migrations.

**Section sources**
- [media.controller.ts](file://apps/backend/src/media/media.controller.ts)
- [media.service.ts](file://apps/backend/src/media/media.service.ts)
- [media.repository.ts](file://apps/backend/src/media/media.repository.ts)
- [journal.controller.ts](file://apps/backend/src/journal/journal.controller.ts)
- [journal.service.ts](file://apps/backend/src/journal/journal.service.ts)
- [journal.repository.ts](file://apps/backend/src/journal/journal.repository.ts)
- [analytics.controller.ts](file://apps/backend/src/analytics/analytics.controller.ts)
- [analytics.service.ts](file://apps/backend/src/analytics/analytics.service.ts)
- [notifications.controller.ts](file://apps/backend/src/notifications/notifications.controller.ts)
- [notification-queue.service.ts](file://apps/backend/src/notifications/notification-queue.service.ts)
- [scheduler.service.ts](file://apps/backend/src/notifications/scheduler.service.ts)
- [cache.service.ts](file://apps/backend/src/hardening/cache.service.ts)
- [cache-invalidation.service.ts](file://apps/backend/src/hardening/cache-invalidation.service.ts)
- [core.module.ts](file://apps/backend/src/core/core.module.ts)
- [events/index.ts](file://apps/backend/src/core/events/index.ts)
- [transaction/index.ts](file://apps/backend/src/core/transaction/index.ts)
- [prisma.service.ts](file://apps/backend/src/prisma/prisma.service.ts)
- [schema.prisma](file://apps/backend/prisma/schema.prisma)

## Architecture Overview
The system follows a layered architecture:
- Presentation Layer: Frontend components call REST endpoints.
- API Layer: NestJS controllers handle requests, validation, and response formatting.
- Domain Layer: Services implement business rules, coordinate repositories, and publish events.
- Infrastructure Layer: Repositories use Prisma for persistence; Redis provides caching and queues; object storage handles media files.

```mermaid
sequenceDiagram
participant FE as "Frontend"
participant Ctrl as "Controller"
participant Svc as "Service"
participant Repo as "Repository"
participant DB as "Database"
participant Cache as "Redis Cache"
participant Pub as "Event Publisher"
participant Q as "BullMQ Queue"
participant W as "Worker"
FE->>Ctrl : "HTTP Request"
Ctrl->>Svc : "Invoke method"
Svc->>Cache : "Read/Write cache"
Svc->>Repo : "Query/Mutate"
Repo->>DB : "Prisma operation"
DB-->>Repo : "Result"
Repo-->>Svc : "Entity"
Svc->>Pub : "Publish event"
Pub->>Q : "Enqueue job"
Q-->>W : "Dispatch job"
W-->>FE : "Async side effects"
Svc-->>Ctrl : "Response payload"
Ctrl-->>FE : "HTTP Response"
```

**Diagram sources**
- [media.controller.ts](file://apps/backend/src/media/media.controller.ts)
- [media.service.ts](file://apps/backend/src/media/media.service.ts)
- [media.repository.ts](file://apps/backend/src/media/media.repository.ts)
- [cache.service.ts](file://apps/backend/src/hardening/cache.service.ts)
- [events/index.ts](file://apps/backend/src/core/events/index.ts)
- [bullmq.module.ts](file://apps/backend/src/bullmq/bullmq.module.ts)

## Detailed Component Analysis

### Media Upload Workflow
Media upload involves controller handling multipart/form-data, service orchestrating storage and metadata, repository persisting records, and background jobs for processing.

```mermaid
sequenceDiagram
participant FE as "Frontend"
participant MC as "Media Controller"
participant MS as "Media Service"
participant US as "Upload Service"
participant SS as "Storage Service"
participant MR as "Media Repository"
participant DB as "Database"
participant EP as "Event Publisher"
participant Q as "BullMQ Queue"
participant W as "Worker"
FE->>MC : "POST /media/upload"
MC->>MS : "handleUpload(file)"
MS->>US : "prepareUpload()"
US->>SS : "storeFile(file)"
SS-->>US : "url/path"
MS->>MR : "createMediaRecord(metadata)"
MR->>DB : "INSERT media"
DB-->>MR : "id"
MR-->>MS : "entity"
MS->>EP : "publish('MEDIA_UPLOADED')"
EP->>Q : "enqueue 'process-media'"
Q-->>W : "dispatch job"
W-->>W : "thumbnail, metadata extraction"
W-->>DB : "UPDATE media"
MS-->>MC : "result"
MC-->>FE : "201 Created + media info"
```

**Diagram sources**
- [media.controller.ts](file://apps/backend/src/media/media.controller.ts)
- [media.service.ts](file://apps/backend/src/media/media.service.ts)
- [upload.service.ts](file://apps/backend/src/storage/upload.service.ts)
- [storage.service.ts](file://apps/backend/src/storage/storage.service.ts)
- [media.repository.ts](file://apps/backend/src/media/media.repository.ts)
- [events/index.ts](file://apps/backend/src/core/events/index.ts)
- [bullmq.module.ts](file://apps/backend/src/bullmq/bullmq.module.ts)

**Section sources**
- [media.controller.ts](file://apps/backend/src/media/media.controller.ts)
- [media.service.ts](file://apps/backend/src/media/media.service.ts)
- [upload.service.ts](file://apps/backend/src/storage/upload.service.ts)
- [storage.service.ts](file://apps/backend/src/storage/storage.service.ts)
- [media.repository.ts](file://apps/backend/src/media/media.repository.ts)

### Journal Entry Creation Workflow
Journal entries are created synchronously with optional async enrichment (e.g., suggestions or analytics updates).

```mermaid
sequenceDiagram
participant FE as "Frontend"
participant JC as "Journal Controller"
participant JS as "Journal Service"
participant JR as "Journal Repository"
participant DB as "Database"
participant Cache as "Redis Cache"
participant EP as "Event Publisher"
participant Q as "BullMQ Queue"
participant W as "Worker"
FE->>JC : "POST /journal/entries"
JC->>JS : "createEntry(data)"
JS->>Cache : "optional pre-check"
JS->>JR : "saveEntry(data)"
JR->>DB : "INSERT journal_entry"
DB-->>JR : "id"
JR-->>JS : "entity"
JS->>EP : "publish('JOURNAL_CREATED')"
EP->>Q : "enqueue 'update-analytics'"
Q-->>W : "dispatch job"
W-->>DB : "UPDATE aggregates"
JS-->>JC : "entry"
JC-->>FE : "201 Created"
```

**Diagram sources**
- [journal.controller.ts](file://apps/backend/src/journal/journal.controller.ts)
- [journal.service.ts](file://apps/backend/src/journal/journal.service.ts)
- [journal.repository.ts](file://apps/backend/src/journal/journal.repository.ts)
- [events/index.ts](file://apps/backend/src/core/events/index.ts)
- [bullmq.module.ts](file://apps/backend/src/bullmq/bullmq.module.ts)

**Section sources**
- [journal.controller.ts](file://apps/backend/src/journal/journal.controller.ts)
- [journal.service.ts](file://apps/backend/src/journal/journal.service.ts)
- [journal.repository.ts](file://apps/backend/src/journal/journal.repository.ts)

### Analytics Aggregation Workflow
Analytics endpoints serve aggregated metrics computed asynchronously via background jobs.

```mermaid
sequenceDiagram
participant FE as "Frontend"
participant AC as "Analytics Controller"
participant AS as "Analytics Service"
participant AAS as "Analytics Aggregation Service"
participant DS as "Dashboard Service"
participant ST as "Streak Service"
participant DB as "Database"
participant Cache as "Redis Cache"
FE->>AC : "GET /analytics/dashboard"
AC->>AS : "getDashboardMetrics()"
AS->>AAS : "computeAggregates()"
AAS->>DB : "SELECT aggregates"
DB-->>AAS : "metrics"
AAS-->>AS : "aggregated data"
AS->>DS : "build dashboard view"
AS->>ST : "compute streaks"
ST-->>AS : "streak info"
AS->>Cache : "set cache(key, result)"
AS-->>AC : "dashboard payload"
AC-->>FE : "200 OK"
```

**Diagram sources**
- [analytics.controller.ts](file://apps/backend/src/analytics/analytics.controller.ts)
- [analytics.service.ts](file://apps/backend/src/analytics/analytics.service.ts)
- [analytics-aggregation.service.ts](file://apps/backend/src/analytics/analytics-aggregation.service.ts)
- [dashboard.service.ts](file://apps/backend/src/analytics/dashboard.service.ts)
- [streak.service.ts](file://apps/backend/src/analytics/streak.service.ts)
- [cache.service.ts](file://apps/backend/src/hardening/cache.service.ts)

**Section sources**
- [analytics.controller.ts](file://apps/backend/src/analytics/analytics.controller.ts)
- [analytics.service.ts](file://apps/backend/src/analytics/analytics.service.ts)
- [analytics-aggregation.service.ts](file://apps/backend/src/analytics/analytics-aggregation.service.ts)
- [dashboard.service.ts](file://apps/backend/src/analytics/dashboard.service.ts)
- [streak.service.ts](file://apps/backend/src/analytics/streak.service.ts)

### Notification Queue and Scheduler
Notifications are enqueued and processed asynchronously, with scheduled tasks driving periodic work.

```mermaid
sequenceDiagram
participant FE as "Frontend"
participant NC as "Notifications Controller"
participant NQS as "Notification Queue Service"
participant SCH as "Scheduler Service"
participant Q as "BullMQ Queue"
participant W as "Worker"
participant DB as "Database"
FE->>NC : "POST /notifications/send"
NC->>NQS : "enqueueNotification(payload)"
NQS->>Q : "add job"
Q-->>W : "dispatch"
W->>DB : "persist notification"
W-->>FE : "async delivery"
SCH->>Q : "schedule recurring jobs"
Q-->>W : "periodic dispatch"
```

**Diagram sources**
- [notifications.controller.ts](file://apps/backend/src/notifications/notifications.controller.ts)
- [notification-queue.service.ts](file://apps/backend/src/notifications/notification-queue.service.ts)
- [scheduler.service.ts](file://apps/backend/src/notifications/scheduler.service.ts)
- [bullmq.module.ts](file://apps/backend/src/bullmq/bullmq.module.ts)

**Section sources**
- [notifications.controller.ts](file://apps/backend/src/notifications/notifications.controller.ts)
- [notification-queue.service.ts](file://apps/backend/src/notifications/notification-queue.service.ts)
- [scheduler.service.ts](file://apps/backend/src/notifications/scheduler.service.ts)

### Caching Strategy with Redis
Caching is implemented via a dedicated service that wraps Redis operations. Cache invalidation is coordinated through a helper service triggered by write paths.

```mermaid
flowchart TD
Start(["Request"]) --> CheckCache["Check cache for key"]
CheckCache --> Hit{"Cache hit?"}
Hit --> |Yes| ReturnCached["Return cached value"]
Hit --> |No| Compute["Compute value"]
Compute --> WriteCache["Write to cache"]
WriteCache --> Persist["Persist to DB"]
Persist --> Invalidate["Invalidate related keys"]
Invalidate --> End(["Response"])
ReturnCached --> End
```

**Diagram sources**
- [cache.service.ts](file://apps/backend/src/hardening/cache.service.ts)
- [cache-invalidation.service.ts](file://apps/backend/src/hardening/cache-invalidation.service.ts)

**Section sources**
- [cache.service.ts](file://apps/backend/src/hardening/cache.service.ts)
- [cache-invalidation.service.ts](file://apps/backend/src/hardening/cache-invalidation.service.ts)

### Transaction Management Patterns
Transactions wrap multi-step operations to ensure atomicity across repositories and external calls. Use the transaction abstraction to group writes and roll back on failure.

```mermaid
flowchart TD
TxStart["Begin Transaction"] --> Step1["Step 1: Create record"]
Step1 --> Step2["Step 2: Update related entities"]
Step2 --> Step3["Step 3: Publish events"]
Step3 --> Success{"All steps succeed?"}
Success --> |Yes| Commit["Commit Transaction"]
Success --> |No| Rollback["Rollback Transaction"]
Commit --> Done(["Done"])
Rollback --> Done
```

**Diagram sources**
- [transaction/index.ts](file://apps/backend/src/core/transaction/index.ts)

**Section sources**
- [transaction/index.ts](file://apps/backend/src/core/transaction/index.ts)

### Event-Driven Data Propagation
Events decouple producers from consumers. Producers publish domain events; consumers subscribe and enqueue jobs for background processing.

```mermaid
classDiagram
class EventPublisher {
+publish(event)
}
class BullMQQueue {
+enqueue(job)
}
class Worker {
+process(job)
}
class MediaService {
+publishMediaUploaded()
}
class AnalyticsAggregationService {
+consumeMediaUploaded()
}
EventPublisher --> BullMQQueue : "enqueues"
BullMQQueue --> Worker : "dispatches"
MediaService --> EventPublisher : "uses"
AnalyticsAggregationService --> EventPublisher : "consumes"
```

**Diagram sources**
- [events/index.ts](file://apps/backend/src/core/events/index.ts)
- [bullmq.module.ts](file://apps/backend/src/bullmq/bullmq.module.ts)

**Section sources**
- [events/index.ts](file://apps/backend/src/core/events/index.ts)
- [bullmq.module.ts](file://apps/backend/src/bullmq/bullmq.module.ts)

## Dependency Analysis
Key dependencies include:
- Controllers depend on Services for business logic.
- Services depend on Repositories for persistence and on Cache/EventPublisher for cross-cutting concerns.
- Repositories depend on Prisma for database access.
- Background workers depend on BullMQ and Redis for queueing and state.

```mermaid
graph LR
Controllers["Controllers"] --> Services["Services"]
Services --> Repositories["Repositories"]
Services --> Cache["Cache Service"]
Services --> Events["Event Publisher"]
Repositories --> Prisma["Prisma Service"]
Events --> BullMQ["BullMQ Queue"]
BullMQ --> Workers["Workers"]
Workers --> DB["Database"]
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
- Prefer read-through caching for frequently accessed aggregates; invalidate on writes.
- Offload heavy processing (media transcoding, analytics computation) to background jobs.
- Use pagination at the repository level to limit memory usage.
- Batch database operations where possible to reduce round-trips.
- Monitor queue depth and worker concurrency to avoid bottlenecks.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
Common issues and resolutions:
- Queue backlog: Inspect BullMQ queue status and worker logs; scale workers if necessary.
- Cache inconsistency: Verify cache invalidation triggers after writes; check TTL settings.
- Transaction failures: Review rollback behavior and error propagation; ensure idempotent retries.
- Database locks: Analyze long-running queries and adjust indexes; consider read replicas for heavy reads.

[No sources needed since this section provides general guidance]

## Conclusion
The Chronicle Your Media Story system uses a clear separation of concerns with controllers, services, and repositories, augmented by event-driven architecture and background processing. Redis caching and Prisma-based persistence provide performance and reliability. Proper transaction boundaries and cache invalidation ensure data consistency. The documented workflows illustrate typical user interactions and their underlying data flows.

[No sources needed since this section summarizes without analyzing specific files]