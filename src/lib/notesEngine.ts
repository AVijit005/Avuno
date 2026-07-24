// Universal notes — localStorage-backed, SSR-safe.
const KEY = "memora:notes:v1";

export type NoteEntityKind =
  | "media"
  | "collection"
  | "achievement"
  | "goal"
  | "timeline"
  | "character"
  | "creator"
  | "quote";

export interface Note {
  id: string;
  kind: NoteEntityKind;
  refId: string;
  text: string;
  createdAt: string;
}

function read(): Note[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Note[]) : [];
  } catch {
    return [];
  }
}
function writem(list: Note[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save notes', e);
  }
}

export function listNotes(kind?: NoteEntityKind, refId?: string): Note[] {
  return read().filter(
    (n) => (kind ? n.kind === kind : true) && (refId ? n.refId === refId : true),
  );
}

export function addNote(kind: NoteEntityKind, refId: string, text: string) {
  const note: Note = {
    id: `n_${Date.now().toString(36)}`,
    kind,
    refId,
    text,
    createdAt: new Date().toISOString(),
  };
  writem([note, ...read()]);
  return note;
}

export function removeNote(id: string) {
  writem(read().filter((n) => n.id !== id));
}

export function searchNotes(term: string): Note[] {
  const t = term.trim().toLowerCase();
  if (!t) return [];
  return read().filter((n) => n.text.toLowerCase().includes(t));
}
