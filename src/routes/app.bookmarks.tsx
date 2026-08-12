import { createFileRoute } from "@tanstack/react-router";
import { BookmarkPanel } from "@/components/profile/BookmarkPanel";

export const Route = createFileRoute("/app/bookmarks")({ component: BookmarksPage });

function BookmarksPage() {
  return (
    <div className="pb-16">
      <header className="max-w-3xl">
        <div className="text-[11px] uppercase tracking-[0.22em] text-primary/80">Memory shelf</div>
        <h1 className="mt-2 font-display text-4xl tracking-tight md:text-5xl">
          Everything you've kept close
        </h1>
        <p className="mt-3 max-w-prose text-[15px] leading-relaxed text-foreground/70">
          Not favorites — more like sticky notes from your own mind. A line, a scene, a thought
          worth coming back to. Saved here so the moment doesn't slip.
        </p>
      </header>

      <BookmarkPanel />
    </div>
  );
}
