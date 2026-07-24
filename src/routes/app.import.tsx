import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Download, Upload, FileText, FileJson, AlertCircle, Check, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useLibraryStore } from "@/lib/store/libraryStore";
import type { UIMediaItem as MediaItem } from "@/lib/adapters/types";
import type { MediaStatus } from "@/lib/library";

export const Route = createFileRoute("/app/import")({
  component: ImportExportPage,
});

const PENDING_SOURCES = [
  { id: "letterboxd", name: "Letterboxd" },
  { id: "mal", name: "MyAnimeList" },
  { id: "goodreads", name: "Goodreads" },
  { id: "steam", name: "Steam" },
  { id: "spotify", name: "Spotify" },
  { id: "trakt", name: "Trakt" },
];

function ImportExportPage() {
  const exportJSON = useLibraryStore((s) => s.exportJSON);
  const importJSON = useLibraryStore((s) => s.importJSON);
  const addCustomItem = useLibraryStore((s) => s.addCustomItem);
  const [report, setReport] = useState<{ added: number; updated: number } | null>(null);

  function downloadExport() {
    const blob = new Blob([exportJSON()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chronicle-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export downloaded");
  }

  async function handleJsonImport(file: File) {
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const r = importJSON(json);
      setReport(r);
      toast.success("Import complete", { description: `${r.added} added · ${r.updated} updated` });
    } catch (e) {
      toast.error("Couldn't read that file", {
        description: e instanceof Error ? e.message : "Invalid JSON",
      });
    }
  }

  async function handleCsvImport(file: File) {
    // Minimal CSV: title,kind,year,status,creator,rating,reason
    try {
      const text = await file.text();
      const rows = text.split(/\r?\n/).filter(Boolean);
      const header =
        rows
          .shift()
          ?.split(",")
          .map((s) => s.trim().toLowerCase()) ?? [];
      const idx = (k: string) => header.indexOf(k);
      let added = 0;
      for (const row of rows) {
        const cells = parseCsvRow(row);
        const title = cells[idx("title")]?.trim();
        if (!title) continue;
        const kind = (cells[idx("kind")] || "movie").trim() as MediaItem["kind"];
        const year = Number(cells[idx("year")]) || new Date().getFullYear();
        const statusRaw = (cells[idx("status")] || "planning").trim().toLowerCase();
        const status: MediaStatus = [
          "completed",
          "in_progress",
          "planning",
          "paused",
          "dropped",
          "rewatching",
          "archived",
        ].includes(statusRaw)
          ? (statusRaw as MediaStatus)
          : "planning";
        const id = `csv_${title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .slice(0, 40)}_${Date.now().toString(36)}_${added}`;
        const item: MediaItem = {
          id,
          mediaId: id,
          title,
          kind,
          year,
          poster:
            null,
          backdrop: null,
          rating: Number(cells[idx("rating")]) || 0,
          progress: 0,
          progressLabel: null,
          status:
            status === "completed"
              ? "completed"
              : status === "planning"
                ? "planning"
                : status === "paused"
                  ? "paused"
                  : status === "rewatching"
                    ? "rewatching"
                    : "in_progress",
          genres: [],
          runtime: null,
          creator: cells[idx("creator")]?.trim() || null,
          synopsis: cells[idx("reason")]?.trim() || "Imported from CSV.",
          accent: null,
          favorite: false,
          slug: id,
          mediaType: kind,
          lastInteractionAt: new Date().toISOString(),
          rewatchCount: 0,
        };
        addCustomItem(item, { status, addedAt: "Imported" });
        added++;
      }
      setReport({ added, updated: 0 });
      toast.success("CSV import complete", { description: `${added} items added` });
    } catch (e) {
      toast.error("Couldn't parse CSV", {
        description: e instanceof Error ? e.message : "Format error",
      });
    }
  }

  return (
    <div className="mx-auto max-w-3xl py-8">
      <Link
        to="/app/settings"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> Settings
      </Link>
      <h1 className="mt-2 font-display text-3xl tracking-tight">Import & Export</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Move your story library in and out of Chronicle. JSON exports include every status,
        reflection, shelf, and collection you've made.
      </p>

      <section className="mt-8 rounded-3xl border border-border/60 bg-white/[0.02] p-6">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          <Download className="h-3.5 w-3.5" /> Export
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-display text-xl">Full library snapshot</div>
            <div className="text-xs text-muted-foreground">
              JSON — re-importable into any Chronicle install.
            </div>
          </div>
          <button
            onClick={downloadExport}
            className="press-scale rounded-full bg-gradient-to-r from-primary to-secondary px-5 py-2 text-sm font-medium text-primary-foreground"
          >
            Download JSON
          </button>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border/60 bg-white/[0.02] p-6">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          <Upload className="h-3.5 w-3.5" /> Import — works now
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <FileTile
            icon={FileJson}
            label="Chronicle JSON"
            hint="From a previous export."
            accept="application/json,.json"
            onFile={handleJsonImport}
          />
          <FileTile
            icon={FileText}
            label="CSV"
            hint="title,kind,year,status,creator,rating,reason"
            accept="text/csv,.csv"
            onFile={handleCsvImport}
          />
        </div>
        {report && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
            <Check className="h-3 w-3" /> {report.added} added · {report.updated} updated
          </div>
        )}
      </section>

      <section className="mt-6 rounded-3xl border border-border/60 bg-white/[0.02] p-6">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          <AlertCircle className="h-3.5 w-3.5" /> Coming with the backend
        </div>
        <p className="mt-2 max-w-prose text-sm text-muted-foreground">
          Direct sync with these services needs OAuth — wired in when Chronicle's cloud is live. For
          now, export from these and import the CSV/JSON above.
        </p>
        <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {PENDING_SOURCES.map((s) => (
            <li
              key={s.id}
              className="rounded-2xl border border-border/60 bg-white/[0.02] px-3 py-2 text-sm text-muted-foreground"
            >
              {s.name}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function FileTile({
  icon: Icon,
  label,
  hint,
  accept,
  onFile,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  hint: string;
  accept: string;
  onFile: (file: File) => void;
}) {
  return (
    <label className="press-scale flex cursor-pointer items-start gap-3 rounded-2xl border border-border/60 bg-white/[0.02] p-4 transition hover:border-primary/40 hover:bg-white/[0.05]">
      <Icon className="mt-0.5 h-5 w-5 text-primary" />
      <div className="min-w-0">
        <div className="text-sm font-medium">{label}</div>
        <div className="truncate text-[11px] text-muted-foreground">{hint}</div>
      </div>
      <input
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
    </label>
  );
}

// Tiny CSV row parser — handles simple quoted commas.
function parseCsvRow(row: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < row.length; i++) {
    const c = row[i];
    if (inQ) {
      if (c === '"' && row[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (c === '"') inQ = false;
      else cur += c;
    } else {
      if (c === ",") {
        out.push(cur);
        cur = "";
      } else if (c === '"') inQ = true;
      else cur += c;
    }
  }
  out.push(cur);
  return out;
}
