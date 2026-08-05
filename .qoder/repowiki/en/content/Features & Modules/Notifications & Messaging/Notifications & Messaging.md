# Notifications & Messaging

<cite>
**Referenced Files in This Document**
- [notifications.module.ts](file://apps/backend/src/notifications/notifications.module.ts)
- [notifications.service.ts](file://apps/backend/src/notifications/notifications.service.ts)
- [notifications.controller.ts](file://apps/backend/src/notifications/notifications.controller.ts)
- [notification-queue.service.ts](file://apps/backend/src/notifications/notification-queue.service.ts)
- [digest.service.ts](file://apps/backend/src/notifications/digest.service.ts)
- [reminder.service.ts](file://apps/backend/src/notifications/reminder.service.ts)
- [scheduler.service.ts](file://apps/backend/src/notifications/scheduler.service.ts)
- [bullmq.module.ts](file://apps/backend/src/bullmq/bullmq.module.ts)
- [redis.service.ts](file://apps/backend/src/redis/redis.service.ts)
- [app.module.ts](file://apps/backend/src/app.module.ts)
- [main.ts](file://apps/backend/src/main.ts)
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
This document explains the notification and messaging system implemented in the backend. It covers real-time notifications, email delivery, push notifications, and in-app messaging. It also details queue processing with BullMQ, message routing, delivery guarantees, notification preferences, digest generation, reminder systems, WebSocket integration for real-time updates, scheduling, batch processing, error handling, retry mechanisms, and delivery tracking.

## Project Structure
The notifications subsystem is organized under apps/backend/src/notifications with supporting infrastructure in bullmq, redis, and core modules. Key responsibilities:
- API surface for managing notifications and preferences
- Queue orchestration using BullMQ via Redis
- Scheduling and batching for digests and reminders
- Real-time delivery through WebSocket channels
- Persistence and tracking of notification events

```mermaid
graph TB
subgraph "Notifications Module"
NC["notifications.controller.ts"]
NS["notifications.service.ts"]
NQ["notification-queue.service.ts"]
DS["digest.service.ts"]
RS["reminder.service.ts"]
SCH["scheduler.service.ts"]
end
subgraph "Queue & Storage"
BM["bullmq.module.ts"]
RD["redis.service.ts"]
end
subgraph "App Bootstrap"
AM["app.module.ts"]
M["main.ts"]
end
NC --> NS
NS --> NQ
NS --> DS
NS --> RS
NS --> SCH
NQ --> BM
BM --> RD
AM --> NC
AM --> BM
M --> AM
```

**Diagram sources**
- [notifications.controller.ts](file://apps/backend/src/notifications/notifications.controller.ts)
- [notifications.service.ts](file://apps/backend/src/notifications/notifications.service.ts)
- [notification-queue.service.ts](file://apps/backend/src/notifications/notification-queue.service.ts)
- [digest.service.ts](file://apps/backend/src/notifications/digest.service.ts)
- [reminder.service.ts](file://apps/backend/src/notifications/reminder.service.ts)
- [scheduler.service.ts](file://apps/backend/src/notifications/scheduler.service.ts)
- [bullmq.module.ts](file://apps/backend/src/bullmq/bullmq.module.ts)
- [redis.service.ts](file://apps/backend/src/redis/redis.service.ts)
- [app.module.ts](file://apps/backend/src/app.module.ts)
- [main.ts](file://apps/backend/src/main.ts)

**Section sources**
- [notifications.module.ts](file://apps/backend/src/notifications/notifications.module.ts)
- [bullmq.module.ts](file://apps/backend/src/bullmq/bullmq.module.ts)
- [redis.service.ts](file://apps/backend/src/redis/redis.service.ts)
- [app.module.ts](file://apps/backend/src/app.module.ts)
- [main.ts](file://apps/backend/src/main.ts)

## Core Components
- Controller: Exposes endpoints to create, query, update preferences, and trigger actions related to notifications.
- Service: Orchestrates business logic, composes messages, applies user preferences, and coordinates queues and schedulers.
- Queue Service: Wraps BullMQ to enqueue jobs for email, push, and in-app delivery; manages concurrency and retries.
- Digest Service: Aggregates notifications into periodic summaries based on user preferences and content activity.
- Reminder Service: Generates time-based reminders (e.g., follow-ups, deadlines).
- Scheduler Service: Manages recurring tasks and cron-like schedules for digests and reminders.
- BullMQ Module: Configures Redis connection and job processors.
- Redis Service: Provides low-level Redis operations used by queues and caching.

**Section sources**
- [notifications.controller.ts](file://apps/backend/src/notifications/notifications.controller.ts)
- [notifications.service.ts](file://apps/backend/src/notifications/notifications.service.ts)
- [notification-queue.service.ts](file://apps/backend/src/notifications/notification-queue.service.ts)
- [digest.service.ts](file://apps/backend/src/notifications/digest.service.ts)
- [reminder.service.ts](file://apps/backend/src/notifications/reminder.service.ts)
- [scheduler.service.ts](file://apps/backend/src/notifications/scheduler.service.ts)
- [bullmq.module.ts](file://apps/backend/src/bullmq/bullmq.module.ts)
- [redis.service.ts](file://apps/backend/src/redis/redis.service.ts)

## Architecture Overview
The system uses a decoupled architecture:
- HTTP requests hit the controller, which delegates to the service layer.
- The service enqueues jobs via BullMQ for asynchronous processing.
- Processors consume jobs from Redis-backed queues and deliver via email, push, or in-app channels.
- Real-time updates are pushed over WebSockets to clients subscribed to user-specific channels.
- Schedulers run periodic tasks to generate digests and reminders.

```mermaid
sequenceDiagram
participant Client as "Client App"
participant Ctrl as "NotificationsController"
participant Svc as "NotificationsService"
participant Q as "NotificationQueueService"
participant BM as "BullMQ"
participant R as "Redis"
participant WS as "WebSocket Server"
participant Email as "Email Provider"
participant Push as "Push Provider"
Client->>Ctrl : POST /notifications/send
Ctrl->>Svc : createAndRoute(payload)
Svc->>Q : enqueue({type, recipient, payload})
Q->>BM : addJob(queue, job)
BM->>R : persist job
Note over BM,R : Job queued asynchronously
BM-->>Q : ack
Svc-->>Ctrl : ok
Ctrl-->>Client : 202 Accepted
par Async Processing
BM->>Q : process job
Q->>Email : send email if needed
Q->>Push : send push if needed
Q->>WS : emit event to user channel
Q->>R : record delivery status
end
```

**Diagram sources**
- [notifications.controller.ts](file://apps/backend/src/notifications/notifications.controller.ts)
- [notifications.service.ts](file://apps/backend/src/notifications/notifications.service.ts)
- [notification-queue.service.ts](file://apps/backend/src/notifications/notification-queue.service.ts)
- [bullmq.module.ts](file://apps/backend/src/bullmq/bullmq.module.ts)
- [redis.service.ts](file://apps/backend/src/redis/redis.service.ts)

## Detailed Component Analysis

### Notification Queue Service (BullMQ Integration)
Responsibilities:
- Enqueue jobs for different channels (email, push, in-app).
- Configure concurrency, backoff, and retry policies per job type.
- Track job lifecycle and outcomes for delivery analytics.

Key behaviors:
- Job types include “send-email”, “send-push”, “broadcast-in-app”.
- Retry strategy uses exponential backoff with max attempts.
- Dead-lettering for failed jobs after max retries.

```mermaid
flowchart TD
Start(["Enqueue Request"]) --> Validate["Validate payload<br/>and recipient"]
Validate --> Route{"Channel?"}
Route --> |Email| EmailJob["Create 'send-email' job"]
Route --> |Push| PushJob["Create 'send-push' job"]
Route --> |In-App| InAppJob["Create 'broadcast-in-app' job"]
EmailJob --> AddToQueue["Add to BullMQ queue"]
PushJob --> AddToQueue
InAppJob --> AddToQueue
AddToQueue --> Persist["Persist in Redis"]
Persist --> Ack["Acknowledge enqueue"]
Ack --> End(["Done"])
```

**Diagram sources**
- [notification-queue.service.ts](file://apps/backend/src/notifications/notification-queue.service.ts)
- [bullmq.module.ts](file://apps/backend/src/bullmq/bullmq.module.ts)
- [redis.service.ts](file://apps/backend/src/redis/redis.service.ts)

**Section sources**
- [notification-queue.service.ts](file://apps/backend/src/notifications/notification-queue.service.ts)
- [bullmq.module.ts](file://apps/backend/src/bullmq/bullmq.module.ts)

### Digest Service
Responsibilities:
- Aggregate notifications over configurable windows (daily/weekly).
- Respect user preferences for frequency and channels.
- Generate compact summaries and schedule delivery.

Processing flow:
- Collect pending notifications since last digest.
- Group by topic or user segment.
- Compose digest payload and enqueue delivery jobs.

```mermaid
flowchart TD
DStart(["Digest Trigger"]) --> Fetch["Fetch pending notifications"]
Fetch --> Filter["Apply user preferences<br/>and filters"]
Filter --> Group["Group by user/topic"]
Group --> Compose["Compose digest payload"]
Compose --> Enq["Enqueue delivery jobs"]
Enq --> Mark["Mark last digest timestamp"]
Mark --> DEnd(["Complete"])
```

**Diagram sources**
- [digest.service.ts](file://apps/backend/src/notifications/digest.service.ts)
- [notification-queue.service.ts](file://apps/backend/src/notifications/notification-queue.service.ts)

**Section sources**
- [digest.service.ts](file://apps/backend/src/notifications/digest.service.ts)

### Reminder Service
Responsibilities:
- Create time-bound reminders based on triggers (e.g., upcoming deadlines).
- Schedule one-off or recurring reminders.
- Deliver via preferred channels respecting preferences.

```mermaid
sequenceDiagram
participant Svc as "ReminderService"
participant Q as "NotificationQueueService"
participant BM as "BullMQ"
participant R as "Redis"
Svc->>Svc : buildReminder(trigger, target, delay)
Svc->>Q : enqueueReminder({id, target, payload, scheduledAt})
Q->>BM : addJob("reminders", job)
BM->>R : store job with delayed execution
Note over BM,R : Job executes at scheduledAt
BM-->>Q : process reminder
Q-->>Svc : deliver via channels
```

**Diagram sources**
- [reminder.service.ts](file://apps/backend/src/notifications/reminder.service.ts)
- [notification-queue.service.ts](file://apps/backend/src/notifications/notification-queue.service.ts)
- [bullmq.module.ts](file://apps/backend/src/bullmq/bullmq.module.ts)
- [redis.service.ts](file://apps/backend/src/redis/redis.service.ts)

**Section sources**
- [reminder.service.ts](file://apps/backend/src/notifications/reminder.service.ts)

### Scheduler Service
Responsibilities:
- Manage recurring tasks for digests and reminders.
- Ensure idempotent scheduling across instances.
- Provide health checks and metrics for scheduled jobs.

```mermaid
classDiagram
class SchedulerService {
+scheduleDigest(cronExpr)
+scheduleReminders(cronExpr)
+ensureUniqueSchedule(name)
+getMetrics()
}
class BullMQModule {
+registerProcessor(jobType, handler)
+addCronJob(expr, task)
}
class RedisService {
+set(key, value, ttl)
+get(key)
+del(key)
}
SchedulerService --> BullMQModule : "uses"
SchedulerService --> RedisService : "uses"
```

**Diagram sources**
- [scheduler.service.ts](file://apps/backend/src/notifications/scheduler.service.ts)
- [bullmq.module.ts](file://apps/backend/src/bullmq/bullmq.module.ts)
- [redis.service.ts](file://apps/backend/src/redis/redis.service.ts)

**Section sources**
- [scheduler.service.ts](file://apps/backend/src/notifications/scheduler.service.ts)

### Notifications Service and Controller
Responsibilities:
- Controller exposes endpoints for sending notifications, querying history, and updating preferences.
- Service validates inputs, applies preferences, routes to appropriate channels, and tracks delivery.

```mermaid
sequenceDiagram
participant Client as "Client"
participant Ctrl as "NotificationsController"
participant Svc as "NotificationsService"
participant Q as "NotificationQueueService"
Client->>Ctrl : POST /notifications/preferences
Ctrl->>Svc : updatePreferences(userId, prefs)
Svc-->>Ctrl : updated
Ctrl-->>Client : 200 OK
Client->>Ctrl : POST /notifications/send
Ctrl->>Svc : send(notification)
Svc->>Q : enqueueDelivery(notification)
Q-->>Svc : queued
Svc-->>Ctrl : accepted
Ctrl-->>Client : 202 Accepted
```

**Diagram sources**
- [notifications.controller.ts](file://apps/backend/src/notifications/notifications.controller.ts)
- [notifications.service.ts](file://apps/backend/src/notifications/notifications.service.ts)
- [notification-queue.service.ts](file://apps/backend/src/notifications/notification-queue.service.ts)

**Section sources**
- [notifications.controller.ts](file://apps/backend/src/notifications/notifications.controller.ts)
- [notifications.service.ts](file://apps/backend/src/notifications/notifications.service.ts)

### WebSocket Integration for Real-Time Updates
Conceptual flow:
- Clients connect and subscribe to a user-scoped channel.
- When a job completes (especially in-app), the system emits an event to the channel.
- Clients receive real-time updates without polling.

```mermaid
sequenceDiagram
participant WS as "WebSocket Server"
participant Client as "Client"
participant Q as "NotificationQueueService"
Client->>WS : connect + subscribe(user_channel)
Note over WS,Client : Channel established
Q->>WS : emit(user_channel, {type, data})
WS-->>Client : real-time notification
```

[No sources needed since this diagram shows conceptual workflow, not actual code structure]

## Dependency Analysis
The notifications module depends on BullMQ and Redis for queuing and persistence, and integrates with external providers for email and push delivery. The app bootstrap wires modules together.

```mermaid
graph TB
AM["app.module.ts"] --> NM["notifications.module.ts"]
NM --> CTRL["notifications.controller.ts"]
NM --> SVC["notifications.service.ts"]
SVC --> Q["notification-queue.service.ts"]
Q --> BM["bullmq.module.ts"]
BM --> RDS["redis.service.ts"]
SVC --> DS["digest.service.ts"]
SVC --> RS["reminder.service.ts"]
SVC --> SCH["scheduler.service.ts"]
```

**Diagram sources**
- [app.module.ts](file://apps/backend/src/app.module.ts)
- [notifications.module.ts](file://apps/backend/src/notifications/notifications.module.ts)
- [notifications.controller.ts](file://apps/backend/src/notifications/notifications.controller.ts)
- [notifications.service.ts](file://apps/backend/src/notifications/notifications.service.ts)
- [notification-queue.service.ts](file://apps/backend/src/notifications/notification-queue.service.ts)
- [bullmq.module.ts](file://apps/backend/src/bullmq/bullmq.module.ts)
- [redis.service.ts](file://apps/backend/src/redis/redis.service.ts)
- [digest.service.ts](file://apps/backend/src/notifications/digest.service.ts)
- [reminder.service.ts](file://apps/backend/src/notifications/reminder.service.ts)
- [scheduler.service.ts](file://apps/backend/src/notifications/scheduler.service.ts)

**Section sources**
- [app.module.ts](file://apps/backend/src/app.module.ts)
- [notifications.module.ts](file://apps/backend/src/notifications/notifications.module.ts)

## Performance Considerations
- Use separate queues per channel to prevent contention between high-volume and latency-sensitive jobs.
- Tune concurrency limits per queue based on provider rate limits and resource availability.
- Implement batching for in-app broadcasts to reduce WebSocket overhead.
- Cache user preferences and channel routing rules to minimize lookups.
- Monitor queue depth, job latency, and failure rates; set alerts for anomalies.
- Prefer idempotent operations and deduplication keys for retries.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
Common issues and resolutions:
- Jobs stuck or not processing:
  - Verify Redis connectivity and BullMQ worker processes.
  - Check for dead-lettered jobs and reprocess or investigate failures.
- Delivery failures:
  - Inspect provider error responses (email/push).
  - Review retry policies and backoff settings.
- Duplicate notifications:
  - Ensure idempotency keys are set for each delivery attempt.
  - Deduplicate at the consumer level.
- High latency:
  - Scale workers horizontally.
  - Optimize payload sizes and batch where possible.
- Missing real-time updates:
  - Confirm WebSocket subscriptions and channel names.
  - Validate event emission paths from job processors.

**Section sources**
- [notification-queue.service.ts](file://apps/backend/src/notifications/notification-queue.service.ts)
- [bullmq.module.ts](file://apps/backend/src/bullmq/bullmq.module.ts)
- [redis.service.ts](file://apps/backend/src/redis/redis.service.ts)

## Conclusion
The notifications and messaging system leverages BullMQ and Redis for robust, scalable, and reliable delivery across email, push, and in-app channels. Preferences-driven routing, digest generation, and reminder scheduling provide flexible user experiences. Real-time updates via WebSockets complement asynchronous processing. Proper configuration of retries, batching, and monitoring ensures resilience and performance.

[No sources needed since this section summarizes without analyzing specific files]