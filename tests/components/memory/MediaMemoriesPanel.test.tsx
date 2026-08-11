import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MediaMemoriesPanel } from "@/components/memory/MediaMemoriesPanel";

const mockUseMemories = vi.fn();
const mockUseAttachMemory = vi.fn();
const mockUseDetachMemory = vi.fn();

vi.mock("@/hooks/use-journal", () => ({
  useMemories: (args: any) => mockUseMemories(args),
  useAttachMemory: () => mockUseAttachMemory(),
  useDetachMemory: () => mockUseDetachMemory(),
}));

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children }: any) => <a>{children}</a>,
}));

describe("MediaMemoriesPanel", () => {
  const mockItem = { id: "1", mediaId: "m1", mediaType: "movie" as const, posterPath: null, title: "Test Movie" };

  it("renders 'Load more' button when there are more memories to attach", () => {
    const fetchNextPage = vi.fn();
    mockUseMemories.mockReturnValue({
      data: {
        pages: [{ items: [{ id: "mem1", title: "Test Memory", createdAt: new Date().toISOString() }] }],
      },
      isLoading: false,
      hasNextPage: true,
      fetchNextPage,
      isFetchingNextPage: false,
    });
    mockUseAttachMemory.mockReturnValue({ mutate: vi.fn(), isPending: false });
    mockUseDetachMemory.mockReturnValue({ mutate: vi.fn(), isPending: false });

    render(<MediaMemoriesPanel item={mockItem} />);
    
    // Open the attach memory view
    fireEvent.click(screen.getByText("Add a memory"));

    // Check if Load more button exists
    const loadMoreButton = screen.getByText("Load more");
    expect(loadMoreButton).toBeInTheDocument();
    
    fireEvent.click(loadMoreButton);
    expect(fetchNextPage).toHaveBeenCalled();
  });
});
