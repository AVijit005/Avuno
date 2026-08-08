import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CalendarHero } from "@/components/calendar/CalendarHero";

vi.mock("@/components/ui/PremiumGlass", () => ({
  PremiumGlass: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/components/analytics/AnalyticsKit", () => ({
  CountUp: ({ to, suffix }: { to: number; suffix?: string }) => (
    <span>
      {to}
      {suffix ?? ""}
    </span>
  ),
}));
// CalendarHero pulls live data through React Query; stub the hooks so the
// component can be rendered without a QueryClientProvider.
vi.mock("@/hooks/use-analytics", () => ({
  useCalendar: () => ({ data: { entries: [] } }),
  useStreaks: () => ({ data: { longestStreak: 0 } }),
}));

describe("CalendarHero", () => {
  it("renders the year in the eyebrow", () => {
    render(<CalendarHero currentYear={2025} yearOffset={0} onChangeYear={() => {}} />);
    expect(screen.getByText(/Memory map/)).toBeInTheDocument();
    expect(screen.getByText(/2025/)).toBeInTheDocument();
  });

  it("shows prev/next year buttons", () => {
    render(<CalendarHero currentYear={2025} yearOffset={0} onChangeYear={() => {}} />);
    expect(screen.getByLabelText("Previous year")).toBeInTheDocument();
    expect(screen.getByLabelText("Next year")).toBeInTheDocument();
  });

  it("disables the next-year button at the upper bound", () => {
    render(<CalendarHero currentYear={2030} yearOffset={5} onChangeYear={() => {}} />);
    expect(screen.getByLabelText("Next year")).toBeDisabled();
  });
});
