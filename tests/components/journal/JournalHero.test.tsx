import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { JournalHero } from "@/components/journal/JournalHero";

vi.mock("@/components/ui/PremiumGlass", () => ({
  PremiumGlass: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/components/analytics/AnalyticsKit", () => ({
  CountUp: ({ to }: { to: number }) => <span>{to}</span>,
}));
vi.mock("@/components/ui/ShimmerSkeleton", () => ({
  ShimmerSkeleton: () => <div>loading…</div>,
}));

describe("JournalHero", () => {
  it("shows skeletons when loading", () => {
    render(<JournalHero isLoading stats={null} entries={[]} favoriteMood={null} />);
    expect(screen.getAllByText("loading…").length).toBeGreaterThan(0);
  });

  it("shows stats when loaded", () => {
    render(
      <JournalHero
        isLoading={false}
        stats={{ journalCount: 5, writingStreak: 3 }}
        entries={[]}
        favoriteMood="Happy"
      />,
    );
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("Happy")).toBeInTheDocument();
  });
});
