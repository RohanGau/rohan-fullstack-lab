export interface PresignUploadRequest {
  filename: string;
  contentType: string;
}

export interface PresignUploadResponse {
  uploadUrl: string;
  cdnUrl: string;
  key: string;
  expiresIn: number;
}

export interface DeleteUploadRequest {
  key: string;
}
