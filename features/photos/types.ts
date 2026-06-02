// features/photos/types.ts
export interface PhotoDto {
  id: string;
  guestName: string | null;
  fileUrl: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
}

export interface SavedUpload {
  fileUrl: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
}

export interface PhotoValidationResult {
  valid: boolean;
  message?: string;
}
