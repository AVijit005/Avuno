// Collection Relationships — adjacency builder.
import { type Collection } from "@/lib/types";
const COLLECTIONS: Collection[] = [];



export interface Relation {
  kind: string;
  label: string;
}

export function getCollectionRelations(c: Collection): Relation[] {
  return [
    { kind: "Category", label: c.category ?? "Story" },
    { kind: "Creator", label: c.creator ?? "You" },
    { kind: "Genre", label: c.category ?? "Genre" },
    { kind: "Theme", label: "Hope" },
    { kind: "Achievement", label: "Curator" },
    { kind: "Goal", label: "Complete the shelf" },
    { kind: "Journal", label: "Linked entries" },
    { kind: "Timeline", label: "Across years" },
  ];
}

export function getCompanionCollections(exclude: string): Collection[] {
  return COLLECTIONS.filter((x) => x.id !== exclude).slice(0, 6);
}
