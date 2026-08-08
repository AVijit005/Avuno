/**
 * Journal adapter: API responses → UIJournalEntry, UIMemory, UITimelineEvent
 */

import type { UIJournalEntry, UIMemory, UITimelineEvent } from "./types";
import type {
  JournalEntryResponse,
  MemoryResponse,
  TimelineEventResponse,
} from "@/lib/api/journal";

const MOOD_MAP: Record<string, string> = {
  VERY_HAPPY: "Happy",
  HAPPY: "Happy",
  CALM: "Calm",
  NEUTRAL: "Neutral",
  SAD: "Sad",
  VERY_SAD: "Sad",
  EXCITED: "Excited",
  EMOTIONAL: "Emotional",
  ANGRY: "Angry",
  NOSTALGIC: "Nostalgic",
};

export function adaptJournalEntry(e: JournalEntryResponse): UIJournalEntry {
  return {
    id: e.id,
    title: e.title,
    content: e.content,
    mood: e.mood ? (MOOD_MAP[e.mood] ?? e.mood) : null,
    weather: e.weather,
    location: e.location,
    isPrivate: e.isPrivate,
    coverImage: e.coverImage,
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
  };
}

export function adaptMemory(m: MemoryResponse): UIMemory {
  return {
    id: m.id,
    title: m.title,
    description: m.description,
    memoryDate: m.memoryDate,
    emotion: m.emotion,
    isPinned: m.isPinned,
    coverImage: m.coverImage,
    mediaCount: m.mediaCount,
    createdAt: m.createdAt,
  };
}

export function adaptTimelineEvent(e: TimelineEventResponse): UITimelineEvent {
  return {
    id: e.id,
    type: e.type,
    title: e.title,
    description: e.description,
    eventDate: e.eventDate,
    icon: e.icon,
    color: e.color,
    createdAt: e.createdAt,
  };
}
