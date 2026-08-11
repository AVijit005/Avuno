import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMemory, useJournalEntry } from "@/hooks/use-journal";
import { useMedia } from "@/hooks/use-media";
import { PremiumGlass } from "@/components/ui/PremiumGlass";
import {
  Lock,
  Globe,
  ArrowLeft,
  BookOpen,
  Quote,
  Image as ImageIcon,
  Calendar,
  Edit,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { PremiumButton } from "@/components/ui/PremiumButton";

export const Route = createFileRoute("/app/memories/$id")({
  component: MemoryDetail,
});

function MemoryDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: memory, isLoading, isError } = useMemory(id);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-32 px-4 max-w-4xl mx-auto space-y-12">
        <div className="h-6 w-24 bg-white/5 rounded-full animate-pulse mb-12" />
        <div className="h-24 bg-white/5 rounded-3xl animate-pulse" />
        <div className="h-64 bg-white/5 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (isError || !memory) {
    return (
      <div className="min-h-screen pt-32 px-4 flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-red-400/10 text-red-400 flex items-center justify-center">
          <Lock className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-serif text-white">Memory not found</h1>
        <p className="text-white/50 max-w-md">
          This memory may have been deleted, or you don't have permission to view it.
        </p>
        <PremiumButton onClick={() => navigate({ to: "/app/memories" })}>
          Back to Vault
        </PremiumButton>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-32 px-4 max-w-4xl mx-auto space-y-12">
      <nav>
        <Link
          to="/app/memories"
          className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Vault
        </Link>
      </nav>

      {/* MEMORY HERO */}
      <header className="space-y-6 text-center">
        <h1 className="text-4xl md:text-6xl font-serif text-white tracking-tight leading-tight">
          {memory.title}
        </h1>

        <div className="flex items-center justify-center gap-6 text-sm text-white/50">
          <time className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {format(new Date(memory.memoryDate || memory.createdAt), "MMMM d, yyyy")}
          </time>
          <div className="flex items-center gap-2">
            {memory.isPrivate ? (
              <>
                <Lock className="w-4 h-4" />
                <span>For your eyes only</span>
              </>
            ) : (
              <>
                <Globe className="w-4 h-4" />
                <span>Visible on profile</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* DESCRIPTION */}
      {memory.description && (
        <section className="prose prose-invert prose-lg max-w-none">
          <p className="text-white/80 font-light leading-relaxed">{memory.description}</p>
        </section>
      )}

      {/* EVIDENCE SECTION */}
      <div className="space-y-8">
        {/* JOURNAL EVIDENCE */}
        {memory.journalId && <JournalEvidence journalId={memory.journalId} />}

        {/* QUOTE EVIDENCE */}
        {memory.quoteId && <QuoteEvidence quoteId={memory.quoteId} />}

        {/* MEDIA EVIDENCE */}
        {memory.mediaIds && memory.mediaIds.length > 0 && (
          <section className="space-y-4">
            <h3 className="text-sm font-medium text-white/40 uppercase tracking-widest flex items-center gap-2">
              Related Media
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {memory.mediaIds.map((mediaId) => (
                <MediaEvidence key={mediaId} mediaId={mediaId} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ACTIONS */}
      <footer className="pt-12 border-t border-white/10 flex items-center justify-end gap-4">
        {/* Update and Delete will be wired to API in a future phase if not provided yet. */}
        <button
          disabled
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 text-white/40 text-sm opacity-50 cursor-not-allowed"
          title="Edit functionality coming soon"
        >
          <Edit className="w-4 h-4" />
          Edit
        </button>
        <button
          disabled
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-400/10 text-red-400/40 text-sm opacity-50 cursor-not-allowed"
          title="Delete functionality coming soon"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </footer>
    </div>
  );
}

function JournalEvidence({ journalId }: { journalId: string }) {
  const { data: journal, isLoading, isError } = useJournalEntry(journalId);

  if (isLoading) return <div className="h-32 bg-white/5 rounded-2xl animate-pulse" />;
  if (isError || !journal) return null; // Gracefully fail if journal is inaccessible

  return (
    <section className="space-y-4">
      <h3 className="text-sm font-medium text-white/40 uppercase tracking-widest flex items-center gap-2">
        <BookOpen className="w-4 h-4" />
        From your journal
      </h3>
      <PremiumGlass className="p-6 md:p-8">
        <div className="prose prose-invert max-w-none">
          <p className="text-white/70 italic leading-relaxed">"{journal.content}"</p>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-white/30">
          <time>{format(new Date(journal.createdAt), "MMM d, yyyy")}</time>
          <Link to="/app/journal" className="hover:text-white transition-colors">
            View original
          </Link>
        </div>
      </PremiumGlass>
    </section>
  );
}

function QuoteEvidence({ quoteId }: { quoteId: string }) {
  // We do not have useQuote yet according to Phase 4C-3 rules
  return (
    <section className="space-y-4">
      <h3 className="text-sm font-medium text-white/40 uppercase tracking-widest flex items-center gap-2">
        <Quote className="w-4 h-4" />
        Saved quote
      </h3>
      <PremiumGlass className="p-6 md:p-8">
        <p className="text-white/50 italic text-sm">
          Quote content will be available in a future phase.
        </p>
      </PremiumGlass>
    </section>
  );
}

function MediaEvidence({ mediaId }: { mediaId: string }) {
  const { data: media, isLoading, isError } = useMedia(mediaId);

  if (isLoading) return <div className="h-24 bg-white/5 rounded-2xl animate-pulse" />;
  if (isError || !media) return null;

  return (
    <Link to="/app/media/$id" params={{ id: media.id }} className="block">
      <PremiumGlass className="p-4 flex items-center gap-4 hover:bg-white/10 transition-colors cursor-pointer">
        {media.posterUrl || media.backdropUrl ? (
          <img
            src={media.posterUrl || media.backdropUrl || ""}
            alt={media.title || "Media"}
            className="w-12 h-16 object-cover rounded shadow-sm"
          />
        ) : (
          <div className="w-12 h-16 bg-white/5 rounded flex items-center justify-center text-white/20">
            <ImageIcon className="w-4 h-4" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="text-white/90 font-medium truncate text-sm">
            {media.title || "Unknown Media"}
          </h4>
          <p className="text-white/40 text-xs truncate capitalize">{media.mediaType}</p>
        </div>
      </PremiumGlass>
    </Link>
  );
}
