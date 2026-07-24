// Chronicle — emotional surface vocabulary.
// Single source of truth for how the product names itself to the user.
// Route paths stay technical; only what the eye reads changes.

export const SURFACE = {
  // Library status surfaces
  continue: {
    nav: "Continue Your Journey",
    title: "Continue Your Journey",
    description: "Stories you're still living — paused, never lost.",
  },
  inProgress: {
    nav: "In the middle",
    title: "Right in the middle",
    description: "Stories actively woven into your week.",
  },
  completed: {
    nav: "Stayed With You",
    title: "Stories That Stayed With You",
    description: "Every world you lived to the end.",
  },
  planning: {
    nav: "Future Adventures",
    title: "Future Adventures",
    description: "Worlds you've promised yourself.",
  },
  recentlyFinished: {
    nav: "Just Lived",
    title: "Just Lived",
    description: "Stories that became yours this week.",
  },
  favorites: {
    nav: "The Permanent Ones",
    title: "The Permanent Ones",
    description: "Stories you'll carry forever.",
  },
  rewatching: {
    nav: "Returning To",
    title: "Stories you keep returning to",
    description: "Old companions — visited again, on purpose.",
  },
  paused: {
    nav: "Waiting For The Right Time",
    title: "Waiting For The Right Time",
    description: "Stories you'll come back to when you're ready.",
  },
  dropped: {
    nav: "Left Behind",
    title: "Stories Left Behind",
    description: "It wasn't the right one. That's a kind of memory too.",
  },
  archived: {
    nav: "Archived",
    title: "Quietly Archived",
    description: "Stories tucked away from view — still part of your record.",
  },

  // Top-level renamings
  achievements: {
    nav: "Milestones",
    title: "Milestones",
    description: "The quiet markers of a life lived in stories.",
  },
  analytics: { nav: "Insights", title: "Insights", description: "The shape of your reading life." },
  goals: {
    nav: "Personal Journey",
    title: "Your Personal Journey",
    description: "Where you're heading, gently.",
  },
} as const;

export type SurfaceKey = keyof typeof SURFACE;
