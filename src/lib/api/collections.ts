import { apiGet, apiPost, apiPatch, apiDelete } from "./fetch";

export interface CollectionItemResponse {
  id: string;
  position: number;
  note: string | null;
  addedAt: string;
  mediaId: string;
  mediaType: string;
  title: string;
  slug: string;
  posterUrl: string | null;
}

export interface CollectionResponse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  visibility: string;
  sortOrder: number;
  isPinned: boolean;
  isSmartCollection: boolean;
  icon: string | null;
  color: string | null;
  itemCount: number;
  stats?: {
    totalItems: number;
    completed: number;
    favoriteCount: number;
    completionPercent: number;
    mediaTypeBreakdown: Record<string, number>;
  } | null;
  items?: CollectionItemResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface ShelfResponse {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  visibility: string;
  sortOrder: number;
  isPinned: boolean;
  icon: string | null;
  color: string | null;
  items?: CollectionItemResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCollectionInput {
  name: string;
  description?: string;
  visibility?: string;
  isPinned?: boolean;
  isSmartCollection?: boolean;
  icon?: string;
  color?: string;
}

export interface UpdateCollectionInput {
  name?: string;
  description?: string;
  visibility?: string;
  isPinned?: boolean;
  icon?: string;
  color?: string;
}

export interface AddCollectionItemInput {
  mediaId: string;
  mediaType: string;
  note?: string;
}

export interface CreateShelfInput {
  title: string;
  description?: string;
  visibility?: string;
  isPinned?: boolean;
  icon?: string;
  color?: string;
}

export interface UpdateShelfInput {
  title?: string;
  description?: string;
  visibility?: string;
  isPinned?: boolean;
  icon?: string;
  color?: string;
}

export async function createCollection(input: CreateCollectionInput): Promise<CollectionResponse> {
  return apiPost<CollectionResponse>("/collections", input);
}

export async function listCollections(): Promise<CollectionResponse[]> {
  return apiGet<CollectionResponse[]>("/collections");
}

export async function getCollection(id: string): Promise<CollectionResponse> {
  return apiGet<CollectionResponse>(`/collections/${id}`);
}

export async function updateCollection(
  id: string,
  input: UpdateCollectionInput,
): Promise<CollectionResponse> {
  return apiPatch<CollectionResponse>(`/collections/${id}`, input);
}

export async function deleteCollection(id: string): Promise<void> {
  return apiDelete(`/collections/${id}`);
}

export async function addCollectionItem(
  collectionId: string,
  input: AddCollectionItemInput,
): Promise<CollectionItemResponse> {
  return apiPost<CollectionItemResponse>(`/collections/${collectionId}/items`, input);
}

export async function removeCollectionItem(collectionId: string, itemId: string): Promise<void> {
  return apiDelete(`/collections/${collectionId}/items/${itemId}`);
}

export async function reorderCollectionItems(
  collectionId: string,
  itemIds: string[],
): Promise<void> {
  return apiPatch(`/collections/${collectionId}/items/reorder`, { itemIds });
}

export async function getCollectionStats(
  collectionId: string,
): Promise<CollectionResponse["stats"]> {
  return apiGet(`/collections/${collectionId}/stats`);
}

export async function createShelf(input: CreateShelfInput): Promise<ShelfResponse> {
  return apiPost<ShelfResponse>("/shelves", input);
}

export async function listShelves(): Promise<ShelfResponse[]> {
  return apiGet<ShelfResponse[]>("/shelves");
}

export async function getShelf(id: string): Promise<ShelfResponse> {
  return apiGet<ShelfResponse>(`/shelves/${id}`);
}

export async function updateShelf(id: string, input: UpdateShelfInput): Promise<ShelfResponse> {
  return apiPatch<ShelfResponse>(`/shelves/${id}`, input);
}

export async function deleteShelf(id: string): Promise<void> {
  return apiDelete(`/shelves/${id}`);
}
