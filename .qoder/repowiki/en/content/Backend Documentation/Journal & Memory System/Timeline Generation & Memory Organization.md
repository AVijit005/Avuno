# Timeline Generation & Memory Organization

<cite>
**Referenced Files in This Document**
- [timeline-event-factory.ts](file://apps/backend/src/journal/timeline-event-factory.ts)
- [journal.service.ts](file://apps/backend/src/journal/journal.service.ts)
- [journal.controller.ts](file://apps/backend/src/journal/journal.controller.ts)
- [journal.repository.ts](file://apps/backend/src/journal/journal.repository.ts)
- [media.service.ts](file://apps/backend/src/media/media.service.ts)
- [media.repository.ts](file://apps/backend/src/media/media.repository.ts)
- [collections.service.ts](file://apps/backend/src/collections/collections.service.ts)
- [collection-event.service.ts](file://apps/backend/src/collections/collection-event.service.ts)
- [progress.service.ts](file://apps/backend/src/progress/progress.service.ts)
- [progress-event.service.ts](file://apps/backend/src/progress/progress-event.service.ts)
- [app.timeline.tsx](file://src/routes/app.timeline.tsx)
- [MiniTimeline.tsx](file://src/components/dashboard/MiniTimeline.tsx)
- [CollectionTimeline.tsx](file://src/components/collections/CollectionTimeline.tsx)
- [FranchiseTimeline.tsx](file://src/components/franchise/FranchiseTimeline.tsx)
- [MediaTimelinePreview.tsx](file://src/components/media-detail/MediaTimelinePreview.tsx)
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
10. [Appendices](#appendices)

## Introduction
This document explains how the system generates interactive timelines by organizing journal entries, media events, and life milestones into a unified chronological view. It covers the timeline event factory pattern, date-based clustering strategies, visual representation approaches, and the relationship mapping between memories, media items, and life events. It also provides examples of timeline queries, filtering options, and customization features used across the application.

## Project Structure
The timeline feature spans both backend services (NestJS modules) and frontend components (React). The backend is responsible for aggregating data from multiple domains (journal, media, collections, progress), while the frontend renders interactive timelines with filtering and customization.

```mermaid
graph TB
subgraph "Backend"
JCtrl["Journal Controller"]
JSvc["Journal Service"]
JRepo["Journal Repository"]
MSvc["Media Service"]
MRepo["Media Repository"]
CSvc["Collections Service"]
CESvc["Collection Event Service"]
PSvc["Progress Service"]
PESvc["Progress Event Service"]
TEF["Timeline Event Factory"]
end
subgraph "Frontend"
RT["Route: app.timeline.tsx"]
MT["Component: MiniTimeline.tsx"]
CT["Component: CollectionTimeline.tsx"]
FT["Component: FranchiseTimeline.tsx"]
MTP["Component: MediaTimelinePreview.tsx"]
end
RT --> JCtrl
RT --> MSvc
RT --> CSvc
RT --> PSvc
JCtrl --> JSvc --> TEF
MSvc --> TEF
CSvc --> TEF
PSvc --> TEF
JSvc --> JRepo
MSvc --> MRepo
CSvc --> CESvc
PSvc --> PESvc
MT --> RT
CT --> RT
FT --> RT
MTP --> RT
```

**Diagram sources**
- [journal.controller.ts](file://apps/backend/src/journal/journal.controller.ts)
- [journal.service.ts](file://apps/backend/src/journal/journal.service.ts)
- [journal.repository.ts](file://apps/backend/src/journal/journal.repository.ts)
- [media.service.ts](file://apps/backend/src/media/media.service.ts)
- [media.repository.ts](file://apps/backend/src/media/media.repository.ts)
- [collections.service.ts](file://apps/backend/src/collections/collections.service.ts)
- [collection-event.service.ts](file://apps/backend/src/collections/collection-event.service.ts)
- [progress.service.ts](file://apps/backend/src/progress/progress.service.ts)
- [progress-event.service.ts](file://apps/backend/src/progress/progress-event.service.ts)
- [timeline-event-factory.ts](file://apps/backend/src/journal/timeline-event-factory.ts)
- [app.timeline.tsx](file://src/routes/app.timeline.tsx)
- [MiniTimeline.tsx](file://src/components/dashboard/MiniTimeline.tsx)
- [CollectionTimeline.tsx](file://src/components/collections/CollectionTimeline.tsx)
- [FranchiseTimeline.tsx](file://src/components/franchise/FranchiseTimeline.tsx)
- [MediaTimelinePreview.tsx](file://src/components/media-detail/MediaTimelinePreview.tsx)

**Section sources**
- [journal.controller.ts](file://apps/backend/src/journal/journal.controller.ts)
- [journal.service.ts](file://apps/backend/src/journal/journal.service.ts)
- [media.service.ts](file://apps/backend/src/media/media.service.ts)
- [collections.service.ts](file://apps/backend/src/collections/collections.service.ts)
- [progress.service.ts](file://apps/backend/src/progress/progress.service.ts)
- [timeline-event-factory.ts](file://apps/backend/src/journal/timeline-event-factory.ts)
- [app.timeline.tsx](file://src/routes/app.timeline.tsx)
- [MiniTimeline.tsx](file://src/components/dashboard/MiniTimeline.tsx)
- [CollectionTimeline.tsx](file://src/components/collections/CollectionTimeline.tsx)
- [FranchiseTimeline.tsx](file://src/components/franchise/FranchiseTimeline.tsx)
- [MediaTimelinePreview.tsx](file://src/components/media-detail/MediaTimelinePreview.tsx)

## Core Components
- Journal domain: Provides user-written entries with timestamps that anchor personal reflections to specific dates.
- Media domain: Tracks media consumption events (start, pause, resume, complete) with precise timestamps.
- Collections domain: Groups related media and notes into collections; collection-level events can be surfaced on timelines.
- Progress domain: Captures learning or reading progress milestones that enrich the timeline narrative.
- Timeline Event Factory: Normalizes heterogeneous events into a unified timeline event model, enabling consistent sorting, clustering, and rendering.

Key responsibilities:
- Aggregation: Pulls events from journal, media, collections, and progress services.
- Normalization: Converts diverse event types into a common schema with stable identifiers, timestamps, categories, and metadata.
- Clustering: Groups nearby events by date windows (e.g., daily, weekly) to reduce noise and improve readability.
- Enrichment: Adds contextual labels and relationships (e.g., linking a journal entry to a media item).

**Section sources**
- [journal.service.ts](file://apps/backend/src/journal/journal.service.ts)
- [media.service.ts](file://apps/backend/src/media/media.service.ts)
- [collections.service.ts](file://apps/backend/src/collections/collections.service.ts)
- [progress.service.ts](file://apps/backend/src/progress/progress.service.ts)
- [timeline-event-factory.ts](file://apps/backend/src/journal/timeline-event-factory.ts)

## Architecture Overview
The timeline pipeline follows a clear separation of concerns: controllers expose endpoints, services orchestrate domain logic, repositories access persistence, and a factory normalizes events for presentation.

```mermaid
sequenceDiagram
participant Client as "Client App"
participant Route as "Timeline Route"
participant JournalCtrl as "Journal Controller"
participant JournalSvc as "Journal Service"
participant MediaSvc as "Media Service"
participant CollSvc as "Collections Service"
participant ProgSvc as "Progress Service"
participant Factory as "Timeline Event Factory"
participant RepoJ as "Journal Repository"
participant RepoM as "Media Repository"
Client->>Route : GET /timeline?from=...&to=...&filters=...
Route->>JournalCtrl : fetchJournalEntries(from,to,filters)
JournalCtrl->>JournalSvc : getEntries(from,to,filters)
JournalSvc->>RepoJ : queryByDateRange(filters)
RepoJ-->>JournalSvc : journalEvents[]
Route->>MediaSvc : fetchMediaEvents(from,to,filters)
MediaSvc->>RepoM : queryMediaByDateRange(filters)
RepoM-->>MediaSvc : mediaEvents[]
Route->>CollSvc : fetchCollectionEvents(from,to,filters)
CollSvc-->>Route : collectionEvents[]
Route->>ProgSvc : fetchProgressEvents(from,to,filters)
ProgSvc-->>Route : progressEvents[]
Route->>Factory : normalizeAndCluster(allEvents[], filters)
Factory-->>Route : timelineEvents[]
Route-->>Client : {events, clusters, meta}
```

**Diagram sources**
- [journal.controller.ts](file://apps/backend/src/journal/journal.controller.ts)
- [journal.service.ts](file://apps/backend/src/journal/journal.service.ts)
- [journal.repository.ts](file://apps/backend/src/journal/journal.repository.ts)
- [media.service.ts](file://apps/backend/src/media/media.service.ts)
- [media.repository.ts](file://apps/backend/src/media/media.repository.ts)
- [collections.service.ts](file://apps/backend/src/collections/collections.service.ts)
- [progress.service.ts](file://apps/backend/src/progress/progress.service.ts)
- [timeline-event-factory.ts](file://apps/backend/src/journal/timeline-event-factory.ts)
- [app.timeline.tsx](file://src/routes/app.timeline.tsx)

## Detailed Component Analysis

### Timeline Event Factory Pattern
The factory centralizes normalization and clustering, ensuring all event sources conform to a shared structure. It supports:
- Type discrimination: Identifies event source (journal, media, collection, progress).
- Timestamp canonicalization: Ensures consistent timezone handling and precision.
- Category tagging: Assigns semantic categories for filtering and visualization.
- Relationship mapping: Links related entities (e.g., a journal entry referencing a media item).
- Date-based clustering: Groups events within configurable time windows.

```mermaid
classDiagram
class TimelineEventFactory {
+normalize(event) TimelineEvent
+cluster(events, window) ClusteredTimeline
+enrichWithRelations(events) TimelineEvent[]
+applyFilters(events, filters) TimelineEvent[]
}
class JournalEvent {
+id string
+date datetime
+content string
+tags string[]
}
class MediaEvent {
+id string
+mediaId string
+timestamp datetime
+action enum
+metadata object
}
class CollectionEvent {
+id string
+collectionId string
+timestamp datetime
+action enum
+metadata object
}
class ProgressEvent {
+id string
+entityId string
+timestamp datetime
+milestone string
+value number
}
class TimelineEvent {
+id string
+source enum
+category string
+timestamp datetime
+title string
+summary string
+relations array
+meta object
}
TimelineEventFactory --> JournalEvent : "normalizes"
TimelineEventFactory --> MediaEvent : "normalizes"
TimelineEventFactory --> CollectionEvent : "normalizes"
TimelineEventFactory --> ProgressEvent : "normalizes"
TimelineEventFactory --> TimelineEvent : "produces"
```

**Diagram sources**
- [timeline-event-factory.ts](file://apps/backend/src/journal/timeline-event-factory.ts)

**Section sources**
- [timeline-event-factory.ts](file://apps/backend/src/journal/timeline-event-factory.ts)

### Journal Entries Chronology
Journal entries are anchored to creation or modification timestamps. The service retrieves entries within a date range, applies filters (tags, keywords), and returns them sorted chronologically. Entries may include references to media items, which are later linked during enrichment.

```mermaid
flowchart TD
Start(["Request Journal Timeline"]) --> Fetch["Query Journal Repository"]
Fetch --> Filter["Apply Filters (tags, keywords)"]
Filter --> Sort["Sort by timestamp ASC"]
Sort --> Normalize["Normalize to TimelineEvent"]
Normalize --> Return(["Return Journal Events"])
```

**Diagram sources**
- [journal.service.ts](file://apps/backend/src/journal/journal.service.ts)
- [journal.repository.ts](file://apps/backend/src/journal/journal.repository.ts)

**Section sources**
- [journal.service.ts](file://apps/backend/src/journal/journal.service.ts)
- [journal.repository.ts](file://apps/backend/src/journal/journal.repository.ts)

### Media Events Integration
Media events capture lifecycle actions (start, pause, resume, complete) with precise timestamps. These events are merged with journal entries based on temporal proximity and optional explicit relationships (e.g., a journal entry explicitly referencing a media item).

```mermaid
sequenceDiagram
participant Client as "Client"
participant MediaSvc as "Media Service"
participant RepoM as "Media Repository"
participant Factory as "Timeline Event Factory"
Client->>MediaSvc : GET /media/events?from=...&to=...
MediaSvc->>RepoM : queryMediaByDateRange(from,to)
RepoM-->>MediaSvc : mediaEvents[]
MediaSvc->>Factory : normalize(mediaEvents[])
Factory-->>MediaSvc : normalizedEvents[]
MediaSvc-->>Client : mediaEvents[]
```

**Diagram sources**
- [media.service.ts](file://apps/backend/src/media/media.service.ts)
- [media.repository.ts](file://apps/backend/src/media/media.repository.ts)
- [timeline-event-factory.ts](file://apps/backend/src/journal/timeline-event-factory.ts)

**Section sources**
- [media.service.ts](file://apps/backend/src/media/media.service.ts)
- [media.repository.ts](file://apps/backend/src/media/media.repository.ts)

### Collections and Life Events
Collections group related media and notes. Collection-level events (creation, updates, milestones) are surfaced alongside journal and media events to provide context-rich timelines.

```mermaid
flowchart TD
A["Fetch Collection Events"] --> B["Filter by Date Range"]
B --> C["Map to TimelineEvent"]
C --> D["Enrich with Related Media/Journal"]
D --> E["Merge into Unified Timeline"]
```

**Diagram sources**
- [collections.service.ts](file://apps/backend/src/collections/collections.service.ts)
- [collection-event.service.ts](file://apps/backend/src/collections/collection-event.service.ts)
- [timeline-event-factory.ts](file://apps/backend/src/journal/timeline-event-factory.ts)

**Section sources**
- [collections.service.ts](file://apps/backend/src/collections/collections.service.ts)
- [collection-event.service.ts](file://apps/backend/src/collections/collection-event.service.ts)

### Progress Milestones
Progress events capture learning or reading milestones, adding depth to the timeline narrative. They are normalized and merged with other events to show personal growth alongside media consumption and reflections.

```mermaid
sequenceDiagram
participant Client as "Client"
participant ProgSvc as "Progress Service"
participant RepoP as "Progress Repository"
participant Factory as "Timeline Event Factory"
Client->>ProgSvc : GET /progress/events?from=...&to=...
ProgSvc->>RepoP : queryProgressByDateRange(from,to)
RepoP-->>ProgSvc : progressEvents[]
ProgSvc->>Factory : normalize(progressEvents[])
Factory-->>ProgSvc : normalizedEvents[]
ProgSvc-->>Client : progressEvents[]
```

**Diagram sources**
- [progress.service.ts](file://apps/backend/src/progress/progress.service.ts)
- [progress-event.service.ts](file://apps/backend/src/progress/progress-event.service.ts)
- [timeline-event-factory.ts](file://apps/backend/src/journal/timeline-event-factory.ts)

**Section sources**
- [progress.service.ts](file://apps/backend/src/progress/progress.service.ts)
- [progress-event.service.ts](file://apps/backend/src/progress/progress-event.service.ts)

### Frontend Timeline Rendering
Multiple components render timelines at different scopes:
- MiniTimeline: Compact overview for dashboards.
- CollectionTimeline: Focused timeline for a specific collection.
- FranchiseTimeline: Timeline spanning franchise-related media and notes.
- MediaTimelinePreview: Contextual timeline around a media item.

These components consume normalized timeline events and apply client-side filters and customizations.

```mermaid
graph TB
RT["Route: app.timeline.tsx"] --> MT["MiniTimeline.tsx"]
RT --> CT["CollectionTimeline.tsx"]
RT --> FT["FranchiseTimeline.tsx"]
RT --> MTP["MediaTimelinePreview.tsx"]
MT --> |Displays| Events["Normalized Timeline Events"]
CT --> |Displays| Events
FT --> |Displays| Events
MTP --> |Displays| Events
```

**Diagram sources**
- [app.timeline.tsx](file://src/routes/app.timeline.tsx)
- [MiniTimeline.tsx](file://src/components/dashboard/MiniTimeline.tsx)
- [CollectionTimeline.tsx](file://src/components/collections/CollectionTimeline.tsx)
- [FranchiseTimeline.tsx](file://src/components/franchise/FranchiseTimeline.tsx)
- [MediaTimelinePreview.tsx](file://src/components/media-detail/MediaTimelinePreview.tsx)

**Section sources**
- [app.timeline.tsx](file://src/routes/app.timeline.tsx)
- [MiniTimeline.tsx](file://src/components/dashboard/MiniTimeline.tsx)
- [CollectionTimeline.tsx](file://src/components/collections/CollectionTimeline.tsx)
- [FranchiseTimeline.tsx](file://src/components/franchise/FranchiseTimeline.tsx)
- [MediaTimelinePreview.tsx](file://src/components/media-detail/MediaTimelinePreview.tsx)

## Dependency Analysis
The timeline system depends on multiple domain services and repositories. The factory decouples normalization from data sources, reducing coupling and improving testability.

```mermaid
graph LR
JCtrl["Journal Controller"] --> JSvc["Journal Service"]
JSvc --> JRepo["Journal Repository"]
MSvc["Media Service"] --> MRepo["Media Repository"]
CSvc["Collections Service"] --> CESvc["Collection Event Service"]
PSvc["Progress Service"] --> PESvc["Progress Event Service"]
JSvc --> TEF["Timeline Event Factory"]
MSvc --> TEF
CSvc --> TEF
PSvc --> TEF
```

**Diagram sources**
- [journal.controller.ts](file://apps/backend/src/journal/journal.controller.ts)
- [journal.service.ts](file://apps/backend/src/journal/journal.service.ts)
- [journal.repository.ts](file://apps/backend/src/journal/journal.repository.ts)
- [media.service.ts](file://apps/backend/src/media/media.service.ts)
- [media.repository.ts](file://apps/backend/src/media/media.repository.ts)
- [collections.service.ts](file://apps/backend/src/collections/collections.service.ts)
- [collection-event.service.ts](file://apps/backend/src/collections/collection-event.service.ts)
- [progress.service.ts](file://apps/backend/src/progress/progress.service.ts)
- [progress-event.service.ts](file://apps/backend/src/progress/progress-event.service.ts)
- [timeline-event-factory.ts](file://apps/backend/src/journal/timeline-event-factory.ts)

**Section sources**
- [journal.controller.ts](file://apps/backend/src/journal/journal.controller.ts)
- [journal.service.ts](file://apps/backend/src/journal/journal.service.ts)
- [media.service.ts](file://apps/backend/src/media/media.service.ts)
- [collections.service.ts](file://apps/backend/src/collections/collections.service.ts)
- [progress.service.ts](file://apps/backend/src/progress/progress.service.ts)
- [timeline-event-factory.ts](file://apps/backend/src/journal/timeline-event-factory.ts)

## Performance Considerations
- Pagination and slicing: Apply server-side pagination for large date ranges to avoid payload bloat.
- Indexing: Ensure database indexes on timestamp fields and foreign keys for efficient queries.
- Caching: Cache frequently accessed timeline segments (e.g., last 30 days) with invalidation on writes.
- Lazy loading: Defer heavy enrichment until needed (e.g., expand relations on demand).
- Batch normalization: Normalize events in batches to minimize memory spikes.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
Common issues and resolutions:
- Missing events: Verify date range filters and timezone settings; ensure repositories return expected records.
- Duplicate events: Check normalization logic for idempotency and deduplication keys.
- Slow queries: Inspect database indexes and consider pre-aggregating popular time windows.
- Inconsistent categories: Validate category assignment rules in the factory and update mappings as new event types emerge.

**Section sources**
- [journal.service.ts](file://apps/backend/src/journal/journal.service.ts)
- [media.service.ts](file://apps/backend/src/media/media.service.ts)
- [collections.service.ts](file://apps/backend/src/collections/collections.service.ts)
- [progress.service.ts](file://apps/backend/src/progress/progress.service.ts)
- [timeline-event-factory.ts](file://apps/backend/src/journal/timeline-event-factory.ts)

## Conclusion
The timeline generation system unifies journal entries, media events, collections, and progress milestones into a coherent chronological narrative. The timeline event factory ensures consistency and scalability, while frontend components deliver interactive experiences. By applying robust filtering, clustering, and enrichment strategies, users gain meaningful insights into their media journey and personal reflections.

[No sources needed since this section summarizes without analyzing specific files]

## Appendices

### Data Model Relationships
The following diagram outlines core entities involved in timeline generation and their relationships.

```mermaid
erDiagram
JOURNAL_ENTRY {
uuid id PK
datetime created_at
datetime updated_at
text content
jsonb tags
}
MEDIA_ITEM {
uuid id PK
string title
string type
datetime released_at
}
MEDIA_EVENT {
uuid id PK
uuid media_id FK
datetime timestamp
enum action
jsonb metadata
}
COLLECTION {
uuid id PK
string name
datetime created_at
}
COLLECTION_EVENT {
uuid id PK
uuid collection_id FK
datetime timestamp
enum action
jsonb metadata
}
PROGRESS_MILESTONE {
uuid id PK
uuid entity_id FK
datetime timestamp
string milestone
float value
}
MEDIA_ITEM ||--o{ MEDIA_EVENT : has_events
COLLECTION ||--o{ COLLECTION_EVENT : has_events
JOURNAL_ENTRY ||--o{ MEDIA_EVENT : references_media
COLLECTION ||--o{ MEDIA_ITEM : contains
```

**Diagram sources**
- [schema.prisma](file://apps/backend/prisma/schema.prisma)

**Section sources**
- [schema.prisma](file://apps/backend/prisma/schema.prisma)

### Example Timeline Queries and Filtering
- Basic date-range query: Retrieve events between two timestamps.
- Tag-based filtering: Narrow journal entries by tags or keywords.
- Media-centric filtering: Focus on specific media items or types.
- Collection scope: Limit events to a particular collection.
- Progress milestones: Include only significant milestones above a threshold.

Examples of usage patterns:
- Dashboard mini-timeline: Last 7 days, grouped by day, showing top 10 events.
- Collection deep dive: Full year, filtered by collection, enriched with related media.
- Media reflection: Around a specific media item’s completion date, merge journal entries and progress milestones.

[No sources needed since this section provides general guidance]

### Customization Features
- Time window selection: Daily, weekly, monthly, yearly views.
- Event type toggles: Show/hide journal, media, collection, progress events.
- Visual themes: Color coding by category, iconography per event type.
- Interaction modes: Expandable details, relation links, search within timeline.

[No sources needed since this section provides general guidance]