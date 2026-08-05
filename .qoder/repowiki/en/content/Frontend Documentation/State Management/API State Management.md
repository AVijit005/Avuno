# API State Management

<cite>
**Referenced Files in This Document**
- [use-auth.ts](file://src/hooks/use-auth.ts)
- [use-collections.ts](file://src/hooks/use-collections.ts)
- [use-journal.ts](file://src/hooks/use-journal.ts)
- [use-library.ts](file://src/hooks/use-library.ts)
- [use-media.ts](file://src/hooks/use-media.ts)
- [use-notifications.ts](file://src/hooks/use-notifications.ts)
- [use-search.ts](file://src/hooks/use-search.ts)
- [use-users.ts](file://src/hooks/use-users.ts)
- [app.search.tsx](file://src/routes/app.search.tsx)
- [app.library.tsx](file://src/routes/app.library.tsx)
- [app.media.$id.tsx](file://src/routes/app.media.$id.tsx)
- [auth.controller.ts](file://apps/backend/src/auth/auth.controller.ts)
- [collections.controller.ts](file://apps/backend/src/collections/collections.controller.ts)
- [journal.controller.ts](file://apps/backend/src/journal/journal.controller.ts)
- [library.controller.ts](file://apps/backend/src/library/library.controller.ts)
- [media.controller.ts](file://apps/backend/src/media/media.controller.ts)
- [notifications.controller.ts](file://apps/backend/src/notifications/notifications.controller.ts)
- [search.controller.ts](file://apps/backend/src/search/search.controller.ts)
- [users.controller.ts](file://apps/backend/src/users/users.controller.ts)
- [pagination/index.ts](file://apps/backend/src/common/pagination/index.ts)
- [retry/index.ts](file://apps/backend/src/common/retry/index.ts)
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
This document explains how the application manages API state across the frontend and backend. It covers data fetching strategies, caching, optimistic updates, error handling, loading states, retry logic, pagination, search query state, custom hooks for API calls, request cancellation, background synchronization, and performance optimizations such as debouncing, throttling, and selective re-rendering. The goal is to provide a clear mental model for both developers and non-technical readers.

## Project Structure
The application follows a feature-based organization:
- Frontend hooks encapsulate API interactions and local state (e.g., use-auth, use-library, use-search).
- Routes consume these hooks to render UI and manage user interactions.
- Backend controllers expose REST endpoints that return structured responses, often with pagination and standardized error shapes.
- Shared utilities include pagination helpers and retry mechanisms.

```mermaid
graph TB
subgraph "Frontend"
H_Auth["hooks/use-auth.ts"]
H_Lib["hooks/use-library.ts"]
H_Search["hooks/use-search.ts"]
R_Search["routes/app.search.tsx"]
R_Lib["routes/app.library.tsx"]
R_Media["routes/app.media.$id.tsx"]
end
subgraph "Backend"
C_Auth["auth.controller.ts"]
C_Lib["library.controller.ts"]
C_Search["search.controller.ts"]
C_Media["media.controller.ts"]
P["common/pagination/index.ts"]
R["common/retry/index.ts"]
end
R_Search --> H_Search
R_Lib --> H_Lib
R_Media --> H_Lib
H_Auth --> C_Auth
H_Lib --> C_Lib
H_Search --> C_Search
H_Lib --> C_Media
C_Lib --> P
C_Search --> P
C_Auth --> R
C_Lib --> R
C_Search --> R
```

**Diagram sources**
- [use-auth.ts](file://src/hooks/use-auth.ts)
- [use-library.ts](file://src/hooks/use-library.ts)
- [use-search.ts](file://src/hooks/use-search.ts)
- [app.search.tsx](file://src/routes/app.search.tsx)
- [app.library.tsx](file://src/routes/app.library.tsx)
- [app.media.$id.tsx](file://src/routes/app.media.$id.tsx)
- [auth.controller.ts](file://apps/backend/src/auth/auth.controller.ts)
- [library.controller.ts](file://apps/backend/src/library/library.controller.ts)
- [search.controller.ts](file://apps/backend/src/search/search.controller.ts)
- [media.controller.ts](file://apps/backend/src/media/media.controller.ts)
- [pagination/index.ts](file://apps/backend/src/common/pagination/index.ts)
- [retry/index.ts](file://apps/backend/src/common/retry/index.ts)

**Section sources**
- [use-auth.ts](file://src/hooks/use-auth.ts)
- [use-library.ts](file://src/hooks/use-library.ts)
- [use-search.ts](file://src/hooks/use-search.ts)
- [app.search.tsx](file://src/routes/app.search.tsx)
- [app.library.tsx](file://src/routes/app.library.tsx)
- [app.media.$id.tsx](file://src/routes/app.media.$id.tsx)
- [auth.controller.ts](file://apps/backend/src/auth/auth.controller.ts)
- [library.controller.ts](file://apps/backend/src/library/library.controller.ts)
- [search.controller.ts](file://apps/backend/src/search/search.controller.ts)
- [media.controller.ts](file://apps/backend/src/media/media.controller.ts)
- [pagination/index.ts](file://apps/backend/src/common/pagination/index.ts)
- [retry/index.ts](file://apps/backend/src/common/retry/index.ts)

## Core Components
Key frontend hooks implement consistent patterns for API state management:
- Data fetching lifecycle: pending, success, error, and optional stale data.
- Pagination state: current page, total items, hasNextPage, and fetchNextPage callbacks.
- Search state: query string, filters, debounce behavior, and result caching.
- Mutations: create/update/delete with optimistic updates and rollback on failure.
- Background sync: periodic or event-driven refreshes without blocking UI.
- Request cancellation: abort in-flight requests when dependencies change or component unmounts.
- Error handling: normalized errors, user-friendly messages, and retry options.

Examples of hook responsibilities:
- Authentication: login/logout flows, token storage, session validation, and error boundaries.
- Library: paginated media lists, filtering, sorting, and item detail retrieval.
- Search: query debouncing, suggestion caching, and result pagination.
- Notifications: real-time updates via polling or events, read/unread toggles.
- Users: profile CRUD operations, avatar uploads, and preference sync.

**Section sources**
- [use-auth.ts](file://src/hooks/use-auth.ts)
- [use-library.ts](file://src/hooks/use-library.ts)
- [use-search.ts](file://src/hooks/use-search.ts)
- [use-notifications.ts](file://src/hooks/use-notifications.ts)
- [use-users.ts](file://src/hooks/use-users.ts)

## Architecture Overview
The system uses a layered architecture:
- UI components call hooks to perform actions and observe state.
- Hooks coordinate network requests, cache reads/writes, and manage local state.
- Controllers handle business logic, validate inputs, apply pagination, and return consistent payloads.
- Shared modules standardize pagination and retry policies.

```mermaid
sequenceDiagram
participant UI as "UI Component"
participant Hook as "Custom Hook"
participant Cache as "Local Cache"
participant API as "Backend Controller"
participant Retry as "Retry Policy"
UI->>Hook : "trigger action (fetch/mutate)"
Hook->>Cache : "check cached data"
alt "cache hit"
Cache-->>Hook : "return stale data"
Hook-->>UI : "render immediately"
else "cache miss"
Hook->>API : "request with params"
API-->>Hook : "response or error"
Hook->>Cache : "update cache"
Hook-->>UI : "render fresh data"
end
Note over API,Retry : "Controller may apply retry policy"
```

**Diagram sources**
- [use-library.ts](file://src/hooks/use-library.ts)
- [use-search.ts](file://src/hooks/use-search.ts)
- [library.controller.ts](file://apps/backend/src/library/library.controller.ts)
- [search.controller.ts](file://apps/backend/src/search/search.controller.ts)
- [pagination/index.ts](file://apps/backend/src/common/pagination/index.ts)
- [retry/index.ts](file://apps/backend/src/common/retry/index.ts)

## Detailed Component Analysis

### Authentication Flow
Authentication involves login, logout, and session validation. The hook manages tokens, handles errors, and provides loading states. Optimistic updates are minimal here; instead, immediate UI transitions occur after successful server responses.

```mermaid
sequenceDiagram
participant UI as "Login Form"
participant AuthHook as "use-auth.ts"
participant API as "auth.controller.ts"
participant Store as "Token Storage"
UI->>AuthHook : "submit credentials"
AuthHook->>API : "POST /auth/login"
API-->>AuthHook : "{token, user}"
AuthHook->>Store : "persist token"
AuthHook-->>UI : "redirect to dashboard"
UI->>AuthHook : "logout"
AuthHook->>API : "POST /auth/logout"
AuthHook->>Store : "clear token"
AuthHook-->>UI : "navigate to login"
```

**Diagram sources**
- [use-auth.ts](file://src/hooks/use-auth.ts)
- [auth.controller.ts](file://apps/backend/src/auth/auth.controller.ts)

**Section sources**
- [use-auth.ts](file://src/hooks/use-auth.ts)
- [auth.controller.ts](file://apps/backend/src/auth/auth.controller.ts)

### Library Data Fetching and Pagination
Library pages display paginated media with filters and sorting. The hook maintains pagination state, fetches data on demand, and supports infinite scrolling.

```mermaid
flowchart TD
Start(["Render Library Page"]) --> CheckCache["Check Local Cache"]
CheckCache --> |Hit| RenderStale["Render Stale Data"]
CheckCache --> |Miss| FetchFirst["Fetch First Page"]
FetchFirst --> UpdateCache["Update Cache"]
UpdateCache --> RenderFresh["Render Fresh Data"]
RenderStale --> UserScroll{"User scrolled?"}
UserScroll --> |Yes| FetchNext["Fetch Next Page"]
FetchNext --> AppendResults["Append Results"]
AppendResults --> RenderUpdated["Render Updated List"]
RenderFresh --> End(["Idle"])
RenderUpdated --> End
```

**Diagram sources**
- [use-library.ts](file://src/hooks/use-library.ts)
- [library.controller.ts](file://apps/backend/src/library/library.controller.ts)
- [pagination/index.ts](file://apps/backend/src/common/pagination/index.ts)

**Section sources**
- [use-library.ts](file://src/hooks/use-library.ts)
- [library.controller.ts](file://apps/backend/src/library/library.controller.ts)
- [pagination/index.ts](file://apps/backend/src/common/pagination/index.ts)

### Search Query State and Debouncing
Search implements debounced queries to reduce network load. The hook tracks query state, filters, and caches results per query key.

```mermaid
sequenceDiagram
participant Input as "Search Input"
participant SearchHook as "use-search.ts"
participant API as "search.controller.ts"
participant Cache as "Query Cache"
Input->>SearchHook : "onChange(query)"
SearchHook->>SearchHook : "debounce delay"
SearchHook->>Cache : "lookup by query"
alt "cache hit"
Cache-->>SearchHook : "return results"
SearchHook-->>Input : "render suggestions"
else "cache miss"
SearchHook->>API : "GET /search?q=..."
API-->>SearchHook : "{results, meta}"
SearchHook->>Cache : "store results"
SearchHook-->>Input : "render results"
end
```

**Diagram sources**
- [use-search.ts](file://src/hooks/use-search.ts)
- [search.controller.ts](file://apps/backend/src/search/search.controller.ts)

**Section sources**
- [use-search.ts](file://src/hooks/use-search.ts)
- [search.controller.ts](file://apps/backend/src/search/search.controller.ts)

### Media Detail and Optimistic Updates
Media detail pages support actions like bookmarking or rating. Optimistic updates update UI immediately and roll back on error.

```mermaid
sequenceDiagram
participant UI as "Media Detail"
participant MediaHook as "use-media.ts"
participant API as "media.controller.ts"
participant Cache as "Item Cache"
UI->>MediaHook : "toggle bookmark"
MediaHook->>Cache : "optimistically update"
MediaHook->>API : "PATCH /media/ : id/bookmark"
alt "success"
API-->>MediaHook : "updated item"
MediaHook->>Cache : "commit changes"
MediaHook-->>UI : "stable UI"
else "error"
API-->>MediaHook : "error"
MediaHook->>Cache : "rollback previous state"
MediaHook-->>UI : "show error toast"
end
```

**Diagram sources**
- [use-media.ts](file://src/hooks/use-media.ts)
- [media.controller.ts](file://apps/backend/src/media/media.controller.ts)

**Section sources**
- [use-media.ts](file://src/hooks/use-media.ts)
- [media.controller.ts](file://apps/backend/src/media/media.controller.ts)

### Notifications Background Sync
Notifications use polling or event-driven updates to keep the UI current without blocking user actions.

```mermaid
sequenceDiagram
participant UI as "Notification Panel"
participant NotifHook as "use-notifications.ts"
participant API as "notifications.controller.ts"
participant Timer as "Polling Timer"
UI->>NotifHook : "open panel"
NotifHook->>Timer : "start interval"
Timer->>API : "GET /notifications?unread=true"
API-->>NotifHook : "{items, count}"
NotifHook-->>UI : "update badge and list"
UI->>NotifHook : "mark as read"
NotifHook->>API : "PATCH /notifications/ : id/read"
API-->>NotifHook : "acknowledged"
NotifHook-->>UI : "refresh counts"
```

**Diagram sources**
- [use-notifications.ts](file://src/hooks/use-notifications.ts)
- [notifications.controller.ts](file://apps/backend/src/notifications/notifications.controller.ts)

**Section sources**
- [use-notifications.ts](file://src/hooks/use-notifications.ts)
- [notifications.controller.ts](file://apps/backend/src/notifications/notifications.controller.ts)

### User Profile Mutations
Profile mutations include updating preferences and uploading avatars. The hook validates inputs, shows loading states, and handles errors gracefully.

```mermaid
sequenceDiagram
participant UI as "Edit Profile"
participant UserHook as "use-users.ts"
participant API as "users.controller.ts"
UI->>UserHook : "submit profile form"
UserHook->>API : "PUT /users/profile"
API-->>UserHook : "updated profile"
UserHook-->>UI : "save success"
UI->>UserHook : "upload avatar"
UserHook->>API : "POST /users/avatar"
API-->>UserHook : "avatar URL"
UserHook-->>UI : "display new avatar"
```

**Diagram sources**
- [use-users.ts](file://src/hooks/use-users.ts)
- [users.controller.ts](file://apps/backend/src/users/users.controller.ts)

**Section sources**
- [use-users.ts](file://src/hooks/use-users.ts)
- [users.controller.ts](file://apps/backend/src/users/users.controller.ts)

## Dependency Analysis
Hooks depend on backend controllers for data and shared utilities for pagination and retry policies. Routes compose multiple hooks to build complex screens.

```mermaid
graph LR
R_Search["routes/app.search.tsx"] --> H_Search["hooks/use-search.ts"]
R_Lib["routes/app.library.tsx"] --> H_Lib["hooks/use-library.ts"]
R_Media["routes/app.media.$id.tsx"] --> H_Lib
H_Search --> C_Search["search.controller.ts"]
H_Lib --> C_Lib["library.controller.ts"]
H_Lib --> C_Media["media.controller.ts"]
C_Lib --> P["common/pagination/index.ts"]
C_Search --> P
C_Lib --> R["common/retry/index.ts"]
C_Search --> R
```

**Diagram sources**
- [app.search.tsx](file://src/routes/app.search.tsx)
- [app.library.tsx](file://src/routes/app.library.tsx)
- [app.media.$id.tsx](file://src/routes/app.media.$id.tsx)
- [use-search.ts](file://src/hooks/use-search.ts)
- [use-library.ts](file://src/hooks/use-library.ts)
- [search.controller.ts](file://apps/backend/src/search/search.controller.ts)
- [library.controller.ts](file://apps/backend/src/library/library.controller.ts)
- [media.controller.ts](file://apps/backend/src/media/media.controller.ts)
- [pagination/index.ts](file://apps/backend/src/common/pagination/index.ts)
- [retry/index.ts](file://apps/backend/src/common/retry/index.ts)

**Section sources**
- [app.search.tsx](file://src/routes/app.search.tsx)
- [app.library.tsx](file://src/routes/app.library.tsx)
- [app.media.$id.tsx](file://src/routes/app.media.$id.tsx)
- [use-search.ts](file://src/hooks/use-search.ts)
- [use-library.ts](file://src/hooks/use-library.ts)
- [search.controller.ts](file://apps/backend/src/search/search.controller.ts)
- [library.controller.ts](file://apps/backend/src/library/library.controller.ts)
- [media.controller.ts](file://apps/backend/src/media/media.controller.ts)
- [pagination/index.ts](file://apps/backend/src/common/pagination/index.ts)
- [retry/index.ts](file://apps/backend/src/common/retry/index.ts)

## Performance Considerations
- Debouncing search queries reduces unnecessary network calls during rapid typing.
- Throttling background sync intervals prevents excessive polling.
- Selective re-rendering leverages memoization and stable references to avoid unnecessary updates.
- Pagination minimizes payload sizes and improves initial load times.
- Caching strategies serve stale data quickly while refreshing in the background.
- Request cancellation avoids race conditions when parameters change rapidly.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
Common issues and resolutions:
- Network errors: Ensure retry policies are configured and user feedback is provided.
- Stale data: Implement cache invalidation on mutations and route changes.
- Memory leaks: Cancel in-flight requests on unmount and clear timers.
- Pagination bugs: Validate cursor/page parameters and handle empty pages gracefully.
- Search anomalies: Normalize query strings and deduplicate results.

**Section sources**
- [retry/index.ts](file://apps/backend/src/common/retry/index.ts)
- [pagination/index.ts](file://apps/backend/src/common/pagination/index.ts)

## Conclusion
The application employs robust API state management patterns through well-structured hooks and standardized backend responses. By combining caching, pagination, debouncing, and retry policies, it delivers responsive and resilient user experiences. Consistent error handling and optimistic updates further enhance perceived performance and reliability.

[No sources needed since this section summarizes without analyzing specific files]

## Appendices
- Best practices:
  - Keep hook interfaces simple and focused on a single domain.
  - Use stable keys for cache entries to prevent accidental invalidations.
  - Provide clear loading and error states for all asynchronous operations.
  - Test edge cases like network failures, empty responses, and rapid input changes.

[No sources needed since this section provides general guidance]