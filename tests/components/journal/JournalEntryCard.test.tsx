import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { JournalEntryCard } from "@/components/journal/JournalEntryCard";
import type { UIJournalEntry } from "@/lib/adapters/types";

vi.mock("@/components/editorial/DropCap", () => ({
  DropCap: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="drop-cap">{children}</div>
  ),
}));

const entry: UIJournalEntry = {
  id: "1",
  title: "Test Entry",
  content: "Hello world this is a journal entry.",
  mood: "Happy",
  weather: null,
  location: null,
  isPrivate: false,
  coverImage: null,
  createdAt: "2025-01-15T00:00:00Z",
  updatedAt: "2025-01-15T00:00:00Z",
};

describe("JournalEntryCard", () => {
  it("renders entry title and content", () => {
    render(<JournalEntryCard entry={entry} index={1} />);
    expect(screen.getByText("Test Entry")).toBeInTheDocument();
    expect(screen.getByText(/Hello world/)).toBeInTheDocument();
  });

  it("does not use a drop cap for non-first entries", () => {
    render(<JournalEntryCard entry={entry} index={1} />);
    expect(screen.queryByTestId("drop-cap")).not.toBeInTheDocument();
  });

  it("shows a drop cap for the first entry", () => {
    render(<JournalEntryCard entry={entry} index={0} />);
    // The first card renders the content twice: once inside DropCap and once
    // in the clamped preview paragraph, so assert on the drop cap directly.
    expect(screen.getByTestId("drop-cap")).toBeInTheDocument();
    expect(screen.getAllByText(/Hello world/).length).toBeGreaterThan(0);
  });
});
