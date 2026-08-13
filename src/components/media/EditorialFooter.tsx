import { Link } from "@tanstack/react-router";

export function EditorialFooter() {
  return (
    <section aria-label="Editorial footer" className="pb-24">
      <div className="text-center">
        <h2 className="font-display text-2xl tracking-tight md:text-3xl text-foreground">
          Continue exploring
        </h2>
      </div>
      <div className="mt-8 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl glass-subtle p-5 transition-colors hover:bg-foreground/[0.05]">
          <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Timeline
          </div>
          <Link to="/app/timeline" className="story-link mt-2 inline-block text-sm">
            View timeline
          </Link>
        </div>
        <div className="rounded-2xl glass-subtle p-5 transition-colors hover:bg-foreground/[0.05]">
          <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Planning queue
          </div>
          <Link to="/app/library/planning" className="story-link mt-2 inline-block text-sm">
            View planning
          </Link>
        </div>
        <div className="rounded-2xl glass-subtle p-5 transition-colors hover:bg-foreground/[0.05]">
          <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Journal
          </div>
          <Link to="/app/journal" className="story-link mt-2 inline-block text-sm">
            Write something
          </Link>
        </div>
      </div>
    </section>
  );
}
