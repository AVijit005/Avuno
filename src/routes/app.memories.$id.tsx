import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import {
  useMemory,
  useJournalEntry,
  useUpdateMemory,
  useDeleteMemory,
  useQuote,
} from "@/hooks/use-journal";
import { useMedia } from "@/hooks/use-media";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
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
  const updateMemory = useUpdateMemory();
  const deleteMemory = useDeleteMemory();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const handleOpenEdit = () => {
    if (memory) {
      setEditTitle(memory.title || "");
      setEditDescription(memory.description || "");
      setIsEditDialogOpen(true);
    }
  };

  const handleSaveEdit = async () => {
    try {
      await updateMemory.mutateAsync({
        id,
        input: {
          title: editTitle,
          description: editDescription,
        },
      });
      toast.success("Memory updated successfully");
      setIsEditDialogOpen(false);
    } catch {
      toast.error("Failed to update memory");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMemory.mutateAsync(id);
      toast.success("Memory deleted");
      setIsDeleteDialogOpen(false);
      navigate({ to: "/app/memories" });
    } catch {
      toast.error("Failed to delete memory");
    }
  };

  if (isLoading) {
    return (
      <div className="pt-8 pb-32 px-4 max-w-4xl mx-auto space-y-12">
        <div className="h-6 w-24 bg-foreground/5 rounded-full animate-pulse mb-12" />
        <div className="h-24 bg-foreground/5 rounded-3xl animate-pulse" />
        <div className="h-64 bg-foreground/5 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (isError || !memory) {
    return (
      <div className="pt-16 pb-32 px-4 flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-red-400/10 text-red-400 flex items-center justify-center">
          <Lock className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-serif text-foreground">Memory not found</h1>
        <p className="text-muted-foreground max-w-md">
          This memory may have been deleted, or you don't have permission to view it.
        </p>
        <PremiumButton onClick={() => navigate({ to: "/app/memories" })}>
          Back to Vault
        </PremiumButton>
      </div>
    );
  }

  return (
    <div className="pt-8 pb-32 px-4 max-w-4xl mx-auto space-y-12">
      <nav>
        <Link
          to="/app/memories"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Vault
        </Link>
      </nav>

      {/* MEMORY HERO */}
      <header className="space-y-6 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-foreground tracking-tight leading-tight">
          {memory.title}
        </h1>

        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
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
          <p className="text-secondary-foreground font-light leading-relaxed">
            {memory.description}
          </p>
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
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-widest flex items-center gap-2">
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
      <footer className="pt-12 border-t border-border/40 flex items-center justify-end gap-4">
        <button
          onClick={handleOpenEdit}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-foreground/[0.05] text-foreground text-sm hover:bg-foreground/[0.1] transition-colors"
        >
          <Edit className="w-4 h-4" />
          Edit
        </button>
        <button
          onClick={() => setIsDeleteDialogOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-400/10 text-red-400 text-sm hover:bg-red-400/20 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </footer>

      {/* EDIT DIALOG */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Memory</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Memory title"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Add some details..."
                className="flex min-h-[100px] w-full rounded-xl border border-border/60 bg-foreground/[0.04] px-3 py-2 text-base shadow-none transition-[color,background-color,border-color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:border-ring/30 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => setIsEditDialogOpen(false)}
              className="px-4 py-2 rounded-full bg-foreground/[0.05] text-foreground text-sm hover:bg-foreground/[0.1] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={updateMemory.isPending}
              className="px-4 py-2 rounded-full bg-foreground text-background text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {updateMemory.isPending ? "Saving..." : "Save Changes"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE DIALOG */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Memory</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this memory? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <button
              onClick={() => setIsDeleteDialogOpen(false)}
              className="px-4 py-2 rounded-full bg-foreground/[0.05] text-foreground text-sm hover:bg-foreground/[0.1] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteMemory.isPending}
              className="px-4 py-2 rounded-full bg-red-400 text-white text-sm hover:bg-red-500 transition-colors disabled:opacity-50"
            >
              {deleteMemory.isPending ? "Deleting..." : "Delete"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function JournalEvidence({ journalId }: { journalId: string }) {
  const { data: journal, isLoading, isError } = useJournalEntry(journalId);

  if (isLoading) return <div className="h-32 bg-foreground/5 rounded-2xl animate-pulse" />;
  if (isError || !journal) return null; // Gracefully fail if journal is inaccessible

  return (
    <section className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-widest flex items-center gap-2">
        <BookOpen className="w-4 h-4" />
        From your journal
      </h3>
      <div className="p-6 md:p-8 glass-subtle rounded-2xl">
        <div className="prose prose-invert max-w-none">
          <p className="text-secondary-foreground italic leading-relaxed">"{journal.content}"</p>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <time>{format(new Date(journal.createdAt), "MMM d, yyyy")}</time>
          <Link to="/app/journal" className="hover:text-foreground transition-colors">
            View original
          </Link>
        </div>
      </div>
    </section>
  );
}

function QuoteEvidence({ quoteId }: { quoteId: string }) {
  const { data: quote, isLoading, isError } = useQuote(quoteId);

  if (isLoading) return <div className="h-32 bg-foreground/5 rounded-2xl animate-pulse" />;

  if (isError || !quote) {
    return (
      <section className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-widest flex items-center gap-2">
          <Quote className="w-4 h-4" />
          Saved quote
        </h3>
        <div className="p-6 md:p-8 glass-subtle rounded-2xl flex flex-col items-center justify-center text-center">
          <Quote className="w-8 h-8 text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground text-sm font-medium">Quote unavailable</p>
          <p className="text-muted-foreground/70 text-xs mt-1 max-w-[200px]">
            This quote may have been removed or is no longer accessible.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-widest flex items-center gap-2">
        <Quote className="w-4 h-4" />
        Saved quote
      </h3>
      <div className="p-6 md:p-8 glass-subtle rounded-2xl relative group">
        <Quote className="absolute top-6 left-6 w-8 h-8 text-foreground/5 pointer-events-none" />
        <div className="prose prose-invert max-w-none relative z-10 pl-6 border-l-2 border-primary/20">
          <p className="text-foreground italic leading-relaxed text-lg">"{quote.content}"</p>
          {quote.speaker && (
            <p className="text-muted-foreground text-sm mt-3 font-medium flex items-center gap-2">
              <span className="w-4 h-[1px] bg-muted-foreground/30 block"></span>
              {quote.speaker}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function MediaEvidence({ mediaId }: { mediaId: string }) {
  const { data: media, isLoading, isError } = useMedia(mediaId);

  if (isLoading) return <div className="h-24 bg-foreground/5 rounded-2xl animate-pulse" />;
  if (isError || !media) return null;

  return (
    <Link to="/app/media/$id" params={{ id: media.id }} className="block">
      <div className="p-4 flex items-center gap-4 hover:bg-foreground/[0.05] transition-colors cursor-pointer glass-subtle rounded-2xl shadow-sm">
        {media.posterUrl || media.backdropUrl ? (
          <img
            src={media.posterUrl || media.backdropUrl || ""}
            alt={media.title || "Media"}
            className="w-12 h-16 object-cover rounded shadow-sm"
          />
        ) : (
          <div className="w-12 h-16 bg-foreground/5 rounded flex items-center justify-center text-muted-foreground">
            <ImageIcon className="w-4 h-4" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="text-foreground font-medium truncate text-sm">
            {media.title || "Unknown Media"}
          </h4>
          <p className="text-muted-foreground text-xs truncate capitalize">{media.mediaType}</p>
        </div>
      </div>
    </Link>
  );
}
