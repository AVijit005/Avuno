import { apiPost, apiDelete, apiUpload } from "./fetch";

export interface UploadResponse {
  id: string;
  path: string;
  url: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  originalName: string;
}

export interface SignedUrlResponse {
  url: string;
  expiresIn: number;
  method: string;
}

export async function uploadFile(file: File, category?: string): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  const qs = category ? `?category=${encodeURIComponent(category)}` : "";
  return apiUpload<UploadResponse>(`/storage/upload${qs}`, formData);
}

export async function uploadMultipleFiles(
  files: File[],
  category?: string,
): Promise<UploadResponse[]> {
  const formData = new FormData();
  for (const file of files) {
    formData.append("files", file);
  }
  const qs = category ? `?category=${encodeURIComponent(category)}` : "";
  return apiUpload<UploadResponse[]>(`/storage/upload/multipart${qs}`, formData);
}

export async function deleteFile(id: string): Promise<void> {
  return apiDelete(`/storage/${id}`);
}

export async function generateSignedUrl(path: string): Promise<SignedUrlResponse> {
  return apiPost<SignedUrlResponse>(`/storage/signed-url?path=${encodeURIComponent(path)}`);
}

export async function uploadAvatar(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  return apiUpload<UploadResponse>("/storage/avatar", formData);
}

export async function uploadCover(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  return apiUpload<UploadResponse>("/storage/cover", formData);
}
