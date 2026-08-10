// Dynamic Greeting Engine — deterministic, SSR-safe.
import { mulberry } from "@/lib/seed";

export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

export function getTimeOfDay(d: Date = new Date()): TimeOfDay {
  const h = d.getUTCHours();
  if (h < 5) return "night";
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  if (h < 22) return "evening";
  return "night";
}

const TEMPLATES: Record<TimeOfDay, string[]> = {
  morning: [
    "Good morning. Ready for another chapter?",
    "Good morning. The day is quiet — perfect for a slow story.",
    "Morning. One story closer to who you'll be.",
    "Sun's up. Pick up where you left off.",
    "Good morning. A small page today is still a page.",
    "Morning. Let's open a story with the coffee.",
    "Welcome back to the morning shelf.",
    "Quiet morning. Quieter book.",
    "Sunrise. New page.",
    "A fresh morning. A familiar story.",
    "Hello again. The library missed you.",
    "Morning. Take it slow today.",
    "Sunlight, then story.",
    "Good morning. Resume gently.",
    "A new morning, the same warm shelf.",
    "Morning. Yesterday's chapter is waiting.",
    "Soft morning. Soft story.",
    "Welcome back, early reader.",
    "A bright morning for a quiet read.",
    "Good morning. One more page before the day starts.",
    "Morning. Begin where the bookmark sits.",
    "Hello, early hours.",
    "Open the curtains. Open a page.",
    "Morning light is the best reading light.",
    "Welcome back. The story remembers you.",
  ],
  afternoon: [
    "Welcome back. Tea and a page?",
    "Afternoon. Halfway through the day, halfway through the book.",
    "A quiet afternoon for a quiet story.",
    "Hello, afternoon. Continue?",
    "Midday pause — perfect for a chapter.",
    "Afternoon shelves are open.",
    "Time for a small reading break.",
    "Welcome back. Pick up where the morning paused.",
    "Afternoon. Resume your unfinished journey.",
    "A long afternoon needs a long story.",
    "Welcome back. The plot waits.",
    "Afternoon. One chapter at a time.",
    "Sunlit afternoon. Slow story.",
    "Hello again. Just a few more pages.",
    "Welcome back to the middle of the day.",
    "Afternoon. The bookmark hasn't moved.",
    "Midday memory invites you.",
    "Welcome back. Continue the chapter.",
    "Quiet afternoon, loud story.",
    "Afternoon. Resume the world.",
    "A peaceful hour for a peaceful read.",
    "Welcome back. Open the book.",
    "Soft afternoon. Comfort story.",
    "Hello. Where did we leave off?",
    "Afternoon. Small joys, small chapters.",
  ],
  evening: [
    "Good evening. Your quiet stories are waiting.",
    "Evening. Dim the lights, open the page.",
    "Welcome back to the soft hours.",
    "Good evening. One more episode?",
    "Evening. The day's last story.",
    "Welcome back. The night is yours.",
    "Evening shelves glow tonight.",
    "Good evening. Take it slow.",
    "Welcome back. Lights low, sound up.",
    "Evening. Continue where dusk left you.",
    "Good evening. Tonight feels perfect for fantasy.",
    "A soft evening for a long chapter.",
    "Welcome back. Pick a story for the night.",
    "Evening. The journal is open.",
    "Good evening. Quiet hours, quiet pages.",
    "Welcome back. Resume the world.",
    "Evening. The shelf has been waiting.",
    "Good evening. One more scene?",
    "Welcome home for the night.",
    "Evening. A gentle return.",
    "Good evening. Let the story breathe.",
    "Evening. The lamp, the page, the calm.",
    "Welcome back. Tonight belongs to the story.",
    "Good evening. One small chapter to close the day.",
    "Evening. Continue, slowly.",
  ],
  night: [
    "Late hours. The best stories live here.",
    "Welcome back to the quietest hour.",
    "Tonight feels like a long chapter.",
    "Late, but worth it. Resume?",
    "The world is asleep. The story isn't.",
    "Welcome back. Read softly.",
    "Late night. Soft light. One page.",
    "Welcome home, night reader.",
    "Tonight's chapter is patient.",
    "Late hours. The shelf glows.",
    "Welcome back. The night is generous.",
    "Late night. Quiet story.",
    "Stay a while. Read a while.",
    "Welcome back. The stars are watching.",
    "Late, but the story understands.",
    "Welcome home. Read until you sleep.",
    "Night. The page belongs to no one but you.",
    "Welcome back. One more chapter, then rest.",
    "Late night. Resume, then dream.",
    "Welcome home. The world is small now.",
    "Night reader. The shelf is yours.",
    "Welcome back. Lamp, book, breath.",
    "Late night. Slowest story wins.",
    "Welcome back. The journal opens easily.",
    "Night. Continue, gently.",
  ],
};

const ABSENCE = [
  (d: number) => `Welcome back. You haven't visited for ${d} days.`,
  (d: number) => `${d} days since your last chapter. Pick up where you paused.`,
  (d: number) => `It's been ${d} days. Your stories waited.`,
  (d: number) => `Quiet ${d} days. Let's begin again.`,
];

const STREAK = [
  (s: number) => `${s}-day streak. Keep going.`,
  (s: number) => `A quiet ${s}-day rhythm. Beautiful.`,
  (s: number) => `${s} days in a row. Don't break it.`,
];

const COMPLETION = [
  (n: number) => `You finished ${n} stories this week.`,
  (n: number) => `${n} chapters closed this week.`,
  (n: number) => `${n} new memories saved.`,
];

const CONTINUE = [
  "Continue where you left yesterday.",
  "One more episode?",
  "Pick up the bookmark.",
  "Resume the chapter.",
];

export interface GreetingInput {
  name?: string;
  daysSinceVisit?: number;
  streak?: number;
  recentCompletions?: number;
  unfinishedTitle?: string;
}

export function getGreeting(input: GreetingInput = {}): { title: string; subtitle?: string } {
  const tod = getTimeOfDay();
  const now = new Date();
  const seed = now.getUTCFullYear() * 372 + now.getUTCMonth() * 31 + now.getUTCDate();
  const rng = mulberry(seed);
  const pool = TEMPLATES[tod];
  const title = pool[Math.floor(rng() * pool.length)] ?? pool[0]!;

  let subtitle: string | undefined;
  if (input.daysSinceVisit && input.daysSinceVisit >= 3) {
    subtitle = ABSENCE[Math.floor(rng() * ABSENCE.length)]!(input.daysSinceVisit);
  } else if (input.streak && input.streak >= 3) {
    subtitle = STREAK[Math.floor(rng() * STREAK.length)]!(input.streak);
  } else if (input.recentCompletions && input.recentCompletions > 0) {
    subtitle = COMPLETION[Math.floor(rng() * COMPLETION.length)]!(input.recentCompletions);
  } else if (input.unfinishedTitle) {
    subtitle = CONTINUE[Math.floor(rng() * CONTINUE.length)];
  }

  const named = input.name
    ? title.replace(
        /^(Good morning|Morning|Good evening|Evening|Good afternoon|Afternoon|Welcome back|Hello again|Welcome home|Hello|Night)/,
        (m) => `${m}, ${input.name}`,
      )
    : title;
  return { title: named, subtitle };
}
