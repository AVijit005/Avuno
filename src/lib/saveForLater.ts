// Global Save For Later queue — localStorage-backed, SSR-safe.
const KEY = "chronicle:save-for-later:v1";

export type SaveKind =
  | "media"
  | "collection"
  | "journal-prompt"
  | "course"
  | "book"
  | "game"
  | "video";
export type SavePriority = "low" | "med" | "high";

export interface SavedItem {
  id: string;
  kind: SaveKind;
  refId: string;
  title: string;
  subtitle?: string;
  priority: SavePriority;
  reason?: string;
  expectedDate?: string;
  reminder?: string;
  createdAt: string;
}

function read(): SavedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SavedItem[]) : [];
  } catch {
    return [];
  }
}
function writem(list: SavedItem[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save items', e);
  }
}

export function listSaved(): SavedItem[] {
  return read();
}

export function saveForLater(item: Omit<SavedItem, "id" | "createdAt">) {
  const next: SavedItem = {
    ...item,
    id: `sv_${crypto.randomUUID().slice(0,8)}`,
    createdAt: new Date().toISOString(),
  };
  writem([next, ...read()]);
  return next;
}

export function removeSaved(id: string) {
  writem(read().filter((s) => s.id !== id));
}

export function updateSaved(id: string, patch: Partial<SavedItem>) {
  writem(read().map((s) => (s.id === id ? { ...s, ...patch } : s)));
}
