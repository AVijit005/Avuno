// Character entity index — deterministic, derived from media references.
// Media lookups resolved by consuming components from live library data.
import type { MediaItem } from "@/lib/types";

export interface Character {
  id: string;
  name: string;
  mediaId: string;
  role: string;
  bio: string;
  accent: string;
  poster?: string;
  quotes?: string[];
}

export const CHARACTERS: Character[] = [];

export function findCharacter(mediaId: string): Character | undefined {
  return CHARACTERS.find((c) => c.mediaId === mediaId);
}

export function getCharacter(id: string): Character | undefined {
  return CHARACTERS.find((c) => c.id === id);
}

export function getCharacterMedia(
  _character: Character,
  _items: MediaItem[],
): MediaItem | undefined {
  return undefined;
}
