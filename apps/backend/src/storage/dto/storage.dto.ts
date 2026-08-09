export class UploadResponseDto {
  id: string;
  path: string;
  url: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  originalName: string;
}

export class MultipartUploadDto {
  files: Express.Multer.File[];
}

export class SignedUrlDto {
  url: string;
  expiresIn: number;
  method: string;
}

export class FileInfoDto {
  id: string;
  path: string;
  mimeType: string;
  size: number;
  originalName: string;
  createdAt: string;
}
