import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryStreaks } from "@/components/calendar/MemoryStreaks";

vi.mock("@/components/ui/PremiumGlass", () => ({
  PremiumGlass: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/components/analytics/AnalyticsKit", () => ({
  CountUp: ({ to }: { to: number }) => <span>{to}</span>,
}));

// MemoryStreaks is now data-driven via props; the former "@/lib/analytics-mock"
// module was removed when the component stopped shipping hardcoded streaks.
const streaks = [
  { label: "Journaling", value: 5, total: 30, accent: "#8b5cf6" },
  { label: "Reading", value: 4, total: 14, accent: "#22d3ee" },
];

describe("MemoryStreaks", () => {
  it("renders a card per streak", () => {
    render(<MemoryStreaks streaks={streaks} />);
    for (const s of streaks) {
      expect(screen.getByText(s.label)).toBeInTheDocument();
    }
  });

  it("renders nothing when no streaks are supplied", () => {
    const { container } = render(<MemoryStreaks />);
    expect(container.querySelectorAll('[role="figure"]')).toHaveLength(0);
  });

  it("exposes an accessible description of each streak", () => {
    render(<MemoryStreaks streaks={streaks} />);
    expect(
      screen.getByRole("figure", { name: "Journaling: 5 of 30 days, 17% complete" }),
    ).toBeInTheDocument();
  });
});
