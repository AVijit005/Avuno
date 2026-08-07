export interface WorkspaceNote {
  id: string;
  text: string;
}

export interface WorkspaceQuote {
  id: string;
  quote: string;
  source?: string;
}

export interface WorkspaceMemory {
  id: string;
  note: string;
}

export interface CollectionWorkspace {
  notes: WorkspaceNote[];
  quotes: WorkspaceQuote[];
  memories: WorkspaceMemory[];
  questions: string[];
  materials: string[];
}

export const getWorkspace = (_collectionId: string): CollectionWorkspace => ({
  notes: [],
  quotes: [],
  memories: [],
  questions: [],
  materials: [],
});
