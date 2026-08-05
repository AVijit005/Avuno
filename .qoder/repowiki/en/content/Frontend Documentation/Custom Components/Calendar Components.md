# Calendar Components

<cite>
**Referenced Files in This Document**
- [CalendarHero.tsx](file://src/components/calendar/CalendarHero.tsx)
- [MemoryStreaks.tsx](file://src/components/calendar/MemoryStreaks.tsx)
- [MonthlyGrid.tsx](file://src/components/calendar/MonthlyGrid.tsx)
- [DailyMemoryPanel.tsx](file://src/components/calendar/DailyMemoryPanel.tsx)
- [YearOverview.tsx](file://src/components/calendar/YearOverview.tsx)
- [index.ts](file://src/components/calendar/index.ts)
- [app.calendar.tsx](file://src/routes/app.calendar.tsx)
- [use-journal.ts](file://src/hooks/use-journal.ts)
- [memory.ts](file://src/lib/memory.ts)
- [memoryJournal.ts](file://src/lib/memoryJournal.ts)
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
This document provides comprehensive documentation for the calendar and timeline management components that power memory visualization, streak tracking, and date-based navigation. It focuses on:
- CalendarHero as the main calendar interface with navigation and overview features
- MemoryStreaks for consecutive usage patterns and achievement milestones
- MonthlyGrid for month-based memory visualization with color coding and filtering
- DailyMemoryPanel for day-specific memory viewing and editing
- YearOverview for annual memory summaries and statistics
It also includes usage examples, date handling patterns, and integration points with journal and memory APIs.

## Project Structure
The calendar-related UI is implemented under src/components/calendar with a clear separation of concerns:
- CalendarHero orchestrates navigation and high-level state
- MonthlyGrid renders the monthly view with color-coded cells
- DailyMemoryPanel handles day selection and editing workflows
- MemoryStreaks computes and displays streaks and milestones
- YearOverview aggregates yearly statistics and highlights
- index.ts centralizes exports for easy imports across the app
- The route app.calendar.tsx wires these components into the application routing layer

```mermaid
graph TB
subgraph "Calendar Route"
RC["Route: app.calendar.tsx"]
end
subgraph "Calendar Components"
CH["CalendarHero.tsx"]
MG["MonthlyGrid.tsx"]
DMP["DailyMemoryPanel.tsx"]
MS["MemoryStreaks.tsx"]
YO["YearOverview.tsx"]
IDX["index.ts"]
end
subgraph "Data & Hooks"
UJ["use-journal.ts"]
ML["memory.ts"]
MJ["memoryJournal.ts"]
end
RC --> CH
CH --> MG
CH --> DMP
CH --> MS
CH --> YO
CH --> IDX
CH --> UJ
CH --> ML
CH --> MJ
```

**Diagram sources**
- [app.calendar.tsx](file://src/routes/app.calendar.tsx)
- [CalendarHero.tsx](file://src/components/calendar/CalendarHero.tsx)
- [MonthlyGrid.tsx](file://src/components/calendar/MonthlyGrid.tsx)
- [DailyMemoryPanel.tsx](file://src/components/calendar/DailyMemoryPanel.tsx)
- [MemoryStreaks.tsx](file://src/components/calendar/MemoryStreaks.tsx)
- [YearOverview.tsx](file://src/components/calendar/YearOverview.tsx)
- [index.ts](file://src/components/calendar/index.ts)
- [use-journal.ts](file://src/hooks/use-journal.ts)
- [memory.ts](file://src/lib/memory.ts)
- [memoryJournal.ts](file://src/lib/memoryJournal.ts)

**Section sources**
- [app.calendar.tsx](file://src/routes/app.calendar.tsx)
- [index.ts](file://src/components/calendar/index.ts)

## Core Components
- CalendarHero: Main entry point for the calendar experience; manages selected date range, navigation (month/year), and delegates rendering to child components.
- MonthlyGrid: Renders a grid of days for the selected month; applies color coding based on memory density or activity; supports filtering by type or tags.
- DailyMemoryPanel: Displays memories for a specific day; allows viewing details and editing entries; integrates with journal and memory services.
- MemoryStreaks: Computes consecutive active days and surfaces milestones; visualizes streak progress and achievements.
- YearOverview: Aggregates yearly metrics such as total entries, most active months, and highlights; provides quick navigation to months.

These components share common data via hooks and libraries:
- use-journal.ts: Provides journal-related queries and mutations
- memory.ts: Utilities for memory operations and transformations
- memoryJournal.ts: Bridges between memory and journal domains

**Section sources**
- [CalendarHero.tsx](file://src/components/calendar/CalendarHero.tsx)
- [MonthlyGrid.tsx](file://src/components/calendar/MonthlyGrid.tsx)
- [DailyMemoryPanel.tsx](file://src/components/calendar/DailyMemoryPanel.tsx)
- [MemoryStreaks.tsx](file://src/components/calendar/MemoryStreaks.tsx)
- [YearOverview.tsx](file://src/components/calendar/YearOverview.tsx)
- [use-journal.ts](file://src/hooks/use-journal.ts)
- [memory.ts](file://src/lib/memory.ts)
- [memoryJournal.ts](file://src/lib/memoryJournal.ts)

## Architecture Overview
The calendar feature follows a unidirectional data flow:
- Route mounts CalendarHero
- CalendarHero coordinates state (selected date, filters) and fetches data through hooks
- MonthlyGrid and other components render based on props derived from CalendarHero
- Data interactions go through use-journal.ts and memory utilities

```mermaid
sequenceDiagram
participant Route as "Route : app.calendar.tsx"
participant Hero as "CalendarHero.tsx"
participant Grid as "MonthlyGrid.tsx"
participant Panel as "DailyMemoryPanel.tsx"
participant Streaks as "MemoryStreaks.tsx"
participant Year as "YearOverview.tsx"
participant Journal as "use-journal.ts"
participant Memory as "memory.ts / memoryJournal.ts"
Route->>Hero : Mount component
Hero->>Journal : Fetch journal entries for date range
Hero->>Memory : Transform and aggregate memory data
Hero-->>Grid : Provide month data + filters
Hero-->>Panel : Provide selected day data
Hero-->>Streaks : Provide streak calculations
Hero-->>Year : Provide yearly stats
Grid->>Hero : User selects month/year
Panel->>Hero : User edits day entry
Streaks->>Hero : Milestone updates
Year->>Hero : Navigate to month
```

**Diagram sources**
- [app.calendar.tsx](file://src/routes/app.calendar.tsx)
- [CalendarHero.tsx](file://src/components/calendar/CalendarHero.tsx)
- [MonthlyGrid.tsx](file://src/components/calendar/MonthlyGrid.tsx)
- [DailyMemoryPanel.tsx](file://src/components/calendar/DailyMemoryPanel.tsx)
- [MemoryStreaks.tsx](file://src/components/calendar/MemoryStreaks.tsx)
- [YearOverview.tsx](file://src/components/calendar/YearOverview.tsx)
- [use-journal.ts](file://src/hooks/use-journal.ts)
- [memory.ts](file://src/lib/memory.ts)
- [memoryJournal.ts](file://src/lib/memoryJournal.ts)

## Detailed Component Analysis

### CalendarHero
Responsibilities:
- Manage selected date context (current month, year, selected day)
- Handle navigation actions (previous/next month, jump to today)
- Aggregate and pass down data to child components
- Coordinate user interactions (filters, selections)

Integration points:
- Uses use-journal.ts to retrieve entries within a date range
- Leverages memory.ts and memoryJournal.ts for transformations and cross-domain data

Usage example:
- Wrap CalendarHero around MonthlyGrid, DailyMemoryPanel, MemoryStreaks, and YearOverview
- Pass selectedDate, filters, and callbacks for navigation and editing

**Section sources**
- [CalendarHero.tsx](file://src/components/calendar/CalendarHero.tsx)
- [use-journal.ts](file://src/hooks/use-journal.ts)
- [memory.ts](file://src/lib/memory.ts)
- [memoryJournal.ts](file://src/lib/memoryJournal.ts)

### MemoryStreaks
Responsibilities:
- Compute consecutive active days based on journal/memory entries
- Surface milestone thresholds and achievements
- Render streak progress visuals and notifications

Algorithm outline:
- Sort entries by date
- Iterate through dates to count consecutive active days
- Compare against milestone thresholds to update achievements

```mermaid
flowchart TD
Start(["Start"]) --> Load["Load entries for period"]
Load --> Sort["Sort entries by date"]
Sort --> Iterate["Iterate dates"]
Iterate --> Active{"Day has activity?"}
Active --> |Yes| Count["Increment streak counter"]
Active --> |No| Reset["Reset streak counter"]
Count --> Milestone{"Reached milestone?"}
Reset --> Milestone
Milestone --> |Yes| UpdateAchievement["Update achievement state"]
Milestone --> |No| Continue["Continue iteration"]
UpdateAchievement --> Continue
Continue --> End(["End"])
```

**Diagram sources**
- [MemoryStreaks.tsx](file://src/components/calendar/MemoryStreaks.tsx)

**Section sources**
- [MemoryStreaks.tsx](file://src/components/calendar/MemoryStreaks.tsx)

### MonthlyGrid
Responsibilities:
- Render a month grid with color-coded cells indicating memory activity
- Support filtering by type, tags, or custom criteria
- Allow clicking a cell to select a day and open DailyMemoryPanel

Color coding logic:
- Map activity levels to colors (e.g., none, low, medium, high)
- Use aggregated counts per day to determine intensity

Filtering:
- Apply client-side filters before rendering
- Debounce filter changes for performance

```mermaid
flowchart TD
Start(["Render Month"]) --> BuildDays["Build array of days in month"]
BuildDays --> ForEachDay{"For each day"}
ForEachDay --> GetCount["Get memory count for day"]
GetCount --> MapColor["Map count to color level"]
MapColor --> ApplyFilters{"Apply filters"}
ApplyFilters --> RenderCell["Render cell with color"]
RenderCell --> NextDay{"More days?"}
NextDay --> |Yes| ForEachDay
NextDay --> |No| End(["Done"])
```

**Diagram sources**
- [MonthlyGrid.tsx](file://src/components/calendar/MonthlyGrid.tsx)

**Section sources**
- [MonthlyGrid.tsx](file://src/components/calendar/MonthlyGrid.tsx)

### DailyMemoryPanel
Responsibilities:
- Display all memories/journal entries for a selected day
- Enable editing of entries inline or via modal
- Integrate with journal and memory APIs to persist changes

Editing workflow:
- Open editor when a day is selected
- Validate inputs before saving
- Update local state and trigger refetch if needed

```mermaid
sequenceDiagram
participant User as "User"
participant Panel as "DailyMemoryPanel.tsx"
participant Journal as "use-journal.ts"
participant Memory as "memory.ts / memoryJournal.ts"
User->>Panel : Select day
Panel->>Journal : Fetch entries for day
Journal-->>Panel : Return entries
Panel-->>User : Render list
User->>Panel : Edit entry
Panel->>Memory : Transform and validate
Panel->>Journal : Save changes
Journal-->>Panel : Confirm success
Panel-->>User : Updated list
```

**Diagram sources**
- [DailyMemoryPanel.tsx](file://src/components/calendar/DailyMemoryPanel.tsx)
- [use-journal.ts](file://src/hooks/use-journal.ts)
- [memory.ts](file://src/lib/memory.ts)
- [memoryJournal.ts](file://src/lib/memoryJournal.ts)

**Section sources**
- [DailyMemoryPanel.tsx](file://src/components/calendar/DailyMemoryPanel.tsx)
- [use-journal.ts](file://src/hooks/use-journal.ts)
- [memory.ts](file://src/lib/memory.ts)
- [memoryJournal.ts](file://src/lib/memoryJournal.ts)

### YearOverview
Responsibilities:
- Aggregate yearly statistics (total entries, peak months, trends)
- Provide quick navigation to specific months
- Visualize highlights and milestones for the year

Aggregation logic:
- Summarize counts per month
- Identify top months and notable events
- Generate summary cards and charts

```mermaid
flowchart TD
Start(["Year Overview"]) --> Gather["Gather yearly data"]
Gather --> Aggregate["Aggregate per-month counts"]
Aggregate --> Stats["Compute stats (totals, peaks)"]
Stats --> Highlights["Identify highlights/milestones"]
Highlights --> Render["Render summary and navigation"]
Render --> End(["Done"])
```

**Diagram sources**
- [YearOverview.tsx](file://src/components/calendar/YearOverview.tsx)

**Section sources**
- [YearOverview.tsx](file://src/components/calendar/YearOverview.tsx)

### Conceptual Overview
The calendar system composes multiple specialized components to deliver a cohesive experience:
- Navigation and state orchestration at the top level (CalendarHero)
- Month-level visualization and interaction (MonthlyGrid)
- Day-level detail and editing (DailyMemoryPanel)
- Streak computation and achievements (MemoryStreaks)
- Year-level aggregation and insights (YearOverview)

```mermaid
graph TB
A["CalendarHero"] --> B["MonthlyGrid"]
A --> C["DailyMemoryPanel"]
A --> D["MemoryStreaks"]
A --> E["YearOverview"]
B --> F["Filters & Color Mapping"]
C --> G["Editor & Persistence"]
D --> H["Streak Algorithm"]
E --> I["Aggregation & Highlights"]
```

[No sources needed since this diagram shows conceptual workflow, not actual code structure]

## Dependency Analysis
Key dependencies:
- Calendar components depend on use-journal.ts for data access
- memory.ts and memoryJournal.ts provide transformation and domain bridging
- index.ts centralizes exports for clean imports

```mermaid
graph TB
CH["CalendarHero.tsx"] --> UJ["use-journal.ts"]
CH --> ML["memory.ts"]
CH --> MJ["memoryJournal.ts"]
MG["MonthlyGrid.tsx"] --> CH
DMP["DailyMemoryPanel.tsx"] --> CH
MS["MemoryStreaks.tsx"] --> CH
YO["YearOverview.tsx"] --> CH
IDX["index.ts"] --> CH
IDX --> MG
IDX --> DMP
IDX --> MS
IDX --> YO
```

**Diagram sources**
- [CalendarHero.tsx](file://src/components/calendar/CalendarHero.tsx)
- [MonthlyGrid.tsx](file://src/components/calendar/MonthlyGrid.tsx)
- [DailyMemoryPanel.tsx](file://src/components/calendar/DailyMemoryPanel.tsx)
- [MemoryStreaks.tsx](file://src/components/calendar/MemoryStreaks.tsx)
- [YearOverview.tsx](file://src/components/calendar/YearOverview.tsx)
- [index.ts](file://src/components/calendar/index.ts)
- [use-journal.ts](file://src/hooks/use-journal.ts)
- [memory.ts](file://src/lib/memory.ts)
- [memoryJournal.ts](file://src/lib/memoryJournal.ts)

**Section sources**
- [index.ts](file://src/components/calendar/index.ts)
- [use-journal.ts](file://src/hooks/use-journal.ts)
- [memory.ts](file://src/lib/memory.ts)
- [memoryJournal.ts](file://src/lib/memoryJournal.ts)

## Performance Considerations
- Memoization: Use memoization for expensive computations like streak calculation and monthly aggregation
- Virtualization: For large datasets, consider virtualizing lists in DailyMemoryPanel
- Debouncing: Debounce filter inputs in MonthlyGrid to reduce re-renders
- Lazy loading: Load year-overview data lazily when scrolled into view
- Efficient date handling: Normalize dates once and reuse throughout components

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
Common issues and resolutions:
- Missing data: Ensure use-journal.ts returns correct date ranges and handles empty states
- Incorrect color mapping: Verify count thresholds and filter conditions in MonthlyGrid
- Streak breaks unexpectedly: Check date normalization and timezone handling in MemoryStreaks
- Editing failures: Validate inputs and handle API errors gracefully in DailyMemoryPanel

Error handling strategies:
- Centralized error boundaries around calendar components
- Retry mechanisms for failed network requests
- Clear user feedback for invalid operations

**Section sources**
- [CalendarHero.tsx](file://src/components/calendar/CalendarHero.tsx)
- [MonthlyGrid.tsx](file://src/components/calendar/MonthlyGrid.tsx)
- [DailyMemoryPanel.tsx](file://src/components/calendar/DailyMemoryPanel.tsx)
- [MemoryStreaks.tsx](file://src/components/calendar/MemoryStreaks.tsx)
- [YearOverview.tsx](file://src/components/calendar/YearOverview.tsx)

## Conclusion
The calendar components form a cohesive system for memory visualization and timeline management. By separating concerns across CalendarHero, MonthlyGrid, DailyMemoryPanel, MemoryStreaks, and YearOverview, the application delivers a rich user experience while maintaining maintainable architecture. Integration with journal and memory APIs ensures data consistency and enables powerful features like streak tracking and annual summaries.

[No sources needed since this section summarizes without analyzing specific files]