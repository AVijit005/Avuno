// Global keyboard shortcut registry — mounted via useShortcuts hook.
import { useEffect } from "react";

export type ShortcutHandler = () => void;

export interface ShortcutMap {
  [keyCombo: string]: ShortcutHandler;
}

// Tracks pending leading key ("g") for chord shortcuts.
let pendingChord: string | null = null;
let pendingTimer: ReturnType<typeof setTimeout> | null = null;

export function useShortcuts(map: ShortcutMap) {
  useEffect(() => {
    const isEditable = (el: EventTarget | null) => {
      if (!(el instanceof HTMLElement)) return false;
      const tag = el.tagName;
      return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable;
    };

    const handler = (e: KeyboardEvent) => {
      if (isEditable(e.target)) return;
      const key = e.key.toLowerCase();

      // Handle chord (g + letter)
      if (pendingChord) {
        const combo = `${pendingChord} ${key}`;
        if (map[combo]) {
          e.preventDefault();
          map[combo]!();
        }
        pendingChord = null;
        if (pendingTimer) clearTimeout(pendingTimer);
        return;
      }
      if (key === "g") {
        pendingChord = "g";
        if (pendingTimer) clearTimeout(pendingTimer);
        pendingTimer = setTimeout(() => {
          pendingChord = null;
        }, 800);
        return;
      }

      if (e.shiftKey) {
        const combo = `shift+${key}`;
        if (map[combo]) {
          e.preventDefault();
          map[combo]!();
        }
      } else if (map[key]) {
        e.preventDefault();
        map[key]!();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(map)]);
}

export const SHORTCUT_HELP = [
  { keys: "⌘K", desc: "Open command palette" },
  { keys: "G H", desc: "Go to Home" },
  { keys: "G L", desc: "Go to Library" },
  { keys: "G C", desc: "Go to Collections" },
  { keys: "G J", desc: "Go to Journal" },
  { keys: "G T", desc: "Go to Timeline" },
  { keys: "G A", desc: "Go to Analytics" },
  { keys: "G W", desc: "Go to Wrapped" },
  { keys: "Shift J", desc: "New journal entry" },
  { keys: "Shift C", desc: "New collection" },
  { keys: "?", desc: "Show shortcut guide" },
  { keys: "Esc", desc: "Close" },
];
