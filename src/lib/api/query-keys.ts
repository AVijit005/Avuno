export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    me: () => [...queryKeys.auth.all, "me"] as const,
  },
  users: {
    all: ["users"] as const,
    profile: () => [...queryKeys.users.all, "profile"] as const,
    sessions: () => [...queryKeys.users.all, "sessions"] as const,
  },
  media: {
    all: ["media"] as const,
    list: (params?: Record<string, unknown>) =>
      [...queryKeys.media.all, "list", params ? JSON.stringify(params) : ""] as const,
    detail: (id: string) => [...queryKeys.media.all, "detail", id] as const,
    related: (id: string) => [...queryKeys.media.all, "related", id] as const,
    search: (params: Record<string, unknown>) =>
      [...queryKeys.media.all, "search", JSON.stringify(params)] as const,
  },
  library: {
    all: ["library"] as const,
    list: (params?: Record<string, unknown>) =>
      [...queryKeys.library.all, "list", params ? JSON.stringify(params) : ""] as const,
    detail: (id: string) => [...queryKeys.library.all, "detail", id] as const,
    stats: () => [...queryKeys.library.all, "stats"] as const,
    byStatus: (status: string, params?: Record<string, unknown>) =>
      [...queryKeys.library.all, "status", status, params ? JSON.stringify(params) : ""] as const,
    byType: (type: string, params?: Record<string, unknown>) =>
      [...queryKeys.library.all, "type", type, params ? JSON.stringify(params) : ""] as const,
  },
  progress: {
    all: ["progress"] as const,
    detail: (libraryId: string) => [...queryKeys.progress.all, libraryId] as const,
    recent: () => [...queryKeys.progress.all, "recent"] as const,
  },
  interaction: {
    all: ["interaction"] as const,
    rating: (libraryId: string) => [...queryKeys.interaction.all, "rating", libraryId] as const,
    favorite: (libraryId: string) => [...queryKeys.interaction.all, "favorite", libraryId] as const,
    bookmark: (libraryId: string) => [...queryKeys.interaction.all, "bookmark", libraryId] as const,
    reviews: (params?: Record<string, unknown>) =>
      [...queryKeys.interaction.all, "reviews", params ? JSON.stringify(params) : ""] as const,
    favorites: (params?: Record<string, unknown>) =>
      [...queryKeys.interaction.all, "favorites", params ? JSON.stringify(params) : ""] as const,
    bookmarks: (params?: Record<string, unknown>) =>
      [...queryKeys.interaction.all, "bookmarks", params ? JSON.stringify(params) : ""] as const,
    history: (params?: Record<string, unknown>) =>
      [...queryKeys.interaction.all, "history", params ? JSON.stringify(params) : ""] as const,
  },
  collections: {
    all: ["collections"] as const,
    list: () => [...queryKeys.collections.all, "list"] as const,
    detail: (id: string) => [...queryKeys.collections.all, "detail", id] as const,
    stats: (id: string) => [...queryKeys.collections.all, "stats", id] as const,
  },
  shelves: {
    all: ["shelves"] as const,
    list: () => [...queryKeys.shelves.all, "list"] as const,
    detail: (id: string) => [...queryKeys.shelves.all, "detail", id] as const,
  },
  journal: {
    all: ["journal"] as const,
    entries: (params?: Record<string, unknown>) =>
      [...queryKeys.journal.all, "entries", params ? JSON.stringify(params) : ""] as const,
    entry: (id: string) => [...queryKeys.journal.all, "entry", id] as const,
    stats: () => [...queryKeys.journal.all, "stats"] as const,
  },
  memories: {
    all: ["memories"] as const,
    list: (params?: Record<string, unknown>) =>
      [...queryKeys.memories.all, "list", params ? JSON.stringify(params) : ""] as const,
    detail: (id: string) => [...queryKeys.memories.all, "detail", id] as const,
  },
  timeline: {
    all: ["timeline"] as const,
    events: (params?: Record<string, unknown>) =>
      [...queryKeys.timeline.all, "events", params ? JSON.stringify(params) : ""] as const,
  },
  search: {
    all: ["search"] as const,
    query: (params: Record<string, unknown>) =>
      [...queryKeys.search.all, "query", JSON.stringify(params)] as const,
    suggestions: (q: string) => [...queryKeys.search.all, "suggestions", q] as const,
    recent: () => [...queryKeys.search.all, "recent"] as const,
    trending: () => [...queryKeys.search.all, "trending"] as const,
    filterOptions: () => [...queryKeys.search.all, "filter-options"] as const,
  },
  analytics: {
    all: ["analytics"] as const,
    dashboard: () => [...queryKeys.analytics.all, "dashboard"] as const,
    overview: () => [...queryKeys.analytics.all, "overview"] as const,
    streaks: () => [...queryKeys.analytics.all, "streaks"] as const,
    media: () => [...queryKeys.analytics.all, "media"] as const,
    genres: () => [...queryKeys.analytics.all, "genres"] as const,
    activity: () => [...queryKeys.analytics.all, "activity"] as const,
    calendar: (year?: number, month?: number) =>
      [...queryKeys.analytics.all, "calendar", year, month] as const,
    insights: () => [...queryKeys.analytics.all, "insights"] as const,
  },
  wrapped: {
    all: ["wrapped"] as const,
    list: () => [...queryKeys.wrapped.all, "list"] as const,
    detail: (year: number) => [...queryKeys.wrapped.all, "detail", year] as const,
    share: (year: number) => [...queryKeys.wrapped.all, "share", year] as const,
    summary: (year: number) => [...queryKeys.wrapped.all, "summary", year] as const,
  },
  notifications: {
    all: ["notifications"] as const,
    list: (params?: Record<string, unknown>) =>
      [...queryKeys.notifications.all, "list", params ? JSON.stringify(params) : ""] as const,
    preferences: () => [...queryKeys.notifications.all, "preferences"] as const,
  },
} as const;
