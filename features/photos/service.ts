// features/photos/service.ts
import crypto from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { Buffer } from "buffer";
import type { Photo } from "@prisma/client";
import { error, formatError } from "@core/logger";
import type { PhotoDto, PhotoValidationResult, SavedUpload } from "@/features/photos/types";

const ALLOWED_IMAGE_TYPES = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/heic", "heic"],
  ["image/heif", "heif"],
]);

const DEFAULT_MAX_UPLOAD_SIZE_MB = 8;
const DEFAULT_MAX_FILES_PER_UPLOAD = 10;
const SUPABASE_STORAGE = "supabase";
const DEFAULT_SUPABASE_STORAGE_BUCKET = "photos";
const GOOGLE_DRIVE_STORAGE = "google_drive";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_DRIVE_API_URL = "https://www.googleapis.com/drive/v3";
const GOOGLE_DRIVE_UPLOAD_URL = "https://www.googleapis.com/upload/drive/v3";
const GOOGLE_DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";

let cachedGoogleAccessToken: {
  accessToken: string;
  expiresAt: number;
} | null = null;

export function getMaxUploadSizeBytes(): number {
  try {
    const parsed = Number(process.env.MAX_UPLOAD_SIZE_MB ?? DEFAULT_MAX_UPLOAD_SIZE_MB);
    const maxMb = Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_MAX_UPLOAD_SIZE_MB;
    return maxMb * 1024 * 1024;
  } catch (e) {
    error("Couldn't read upload size limit", {
      file: "features/photos/service.ts",
      function: "getMaxUploadSizeBytes",
      error: formatError(e),
    });
    return DEFAULT_MAX_UPLOAD_SIZE_MB * 1024 * 1024;
  }
}

export function getMaxFilesPerUpload(): number {
  try {
    const parsed = Number(process.env.MAX_FILES_PER_UPLOAD ?? DEFAULT_MAX_FILES_PER_UPLOAD);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_MAX_FILES_PER_UPLOAD;
  } catch (e) {
    error("Couldn't read upload file count limit", {
      file: "features/photos/service.ts",
      function: "getMaxFilesPerUpload",
      error: formatError(e),
    });
    return DEFAULT_MAX_FILES_PER_UPLOAD;
  }
}

export function photoToDto(photo: Photo): PhotoDto {
  try {
    return {
      id: photo.id,
      guestName: photo.guestName,
      fileUrl: photo.fileUrl,
      fileName: photo.fileName,
      originalName: photo.originalName,
      fileSize: photo.fileSize,
      mimeType: photo.mimeType,
      createdAt: photo.createdAt.toISOString(),
    };
  } catch (e) {
    error("Couldn't prepare photo data", {
      file: "features/photos/service.ts",
      function: "photoToDto",
      error: formatError(e),
    });
    throw new Error("Të dhënat e fotos nuk u përgatitën dot.");
  }
}

export async function getPhotos(): Promise<PhotoDto[]> {
  try {
    const prisma = await getPhotoPrisma();
    const photos = await prisma.photo.findMany({
      orderBy: { createdAt: "desc" },
    });

    return photos.map(photoToDto);
  } catch (e) {
    error("Fotot nuk u ngarkuan dot. Ju lutemi provoni përsëri më vonë.", {
      file: "features/photos/service.ts",
      function: "getPhotos",
      error: formatError(e),
    });
    throw new Error("Fotot nuk u ngarkuan dot. Ju lutemi provoni përsëri më vonë.");
  }
}

export async function createPhotoRecord(input: {
  guestName?: string;
  fileUrl: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
}): Promise<PhotoDto> {
  try {
    const prisma = await getPhotoPrisma();
    const photo = await prisma.photo.create({
      data: {
        guestName: input.guestName?.trim() || null,
        fileUrl: input.fileUrl,
        fileName: input.fileName,
        originalName: input.originalName,
        fileSize: input.fileSize,
        mimeType: input.mimeType,
      },
    });

    return photoToDto(photo);
  } catch (e) {
    error("Të dhënat e fotos nuk u ruajtën dot. Ju lutemi provoni përsëri më vonë.", {
      file: "features/photos/service.ts",
      function: "createPhotoRecord",
      error: formatError(e),
    });
    throw new Error("Të dhënat e fotos nuk u ruajtën dot. Ju lutemi provoni përsëri më vonë.");
  }
}

export async function deletePhoto(id: string): Promise<boolean> {
  try {
    const prisma = await getPhotoPrisma();
    const photo = await prisma.photo.findUnique({ where: { id } });

    if (!photo) {
      return false;
    }

    await prisma.photo.delete({ where: { id } });
    await deleteUploadedFile(photo.fileUrl, photo.fileName);
    return true;
  } catch (e) {
    error("Fotoja nuk u fshi dot. Ju lutemi provoni përsëri më vonë.", {
      file: "features/photos/service.ts",
      function: "deletePhoto",
      id,
      error: formatError(e),
    });

    throw new Error("Fotoja nuk u fshi dot. Ju lutemi provoni përsëri më vonë.");
  }
}

export async function saveUploadedFile(file: File): Promise<SavedUpload> {
  try {
    const validation = validateImageFile(file);

    if (!validation.valid) {
      throw new Error(validation.message ?? "Ju lutemi ngarkoni një foto të vlefshme.");
    }

    if (getPhotoStorageDriver() === GOOGLE_DRIVE_STORAGE) {
      return saveUploadedFileToGoogleDrive(file);
    }

    if (getPhotoStorageDriver() === SUPABASE_STORAGE) {
      return saveUploadedFileToSupabase(file);
    }

    return saveUploadedFileToDisk(file);
  } catch (e) {
    error("Skedari i ngarkuar nuk u ruajt dot. Ju lutemi provoni përsëri më vonë.", {
      file: "features/photos/service.ts",
      function: "saveUploadedFile",
      error: formatError(e),
    });

    if (e instanceof Error && e.message.startsWith("Ju lutemi")) {
      throw e;
    }

    throw new Error("Skedari i ngarkuar nuk u ruajt dot. Ju lutemi provoni përsëri më vonë.");
  }
}

export interface UploadSession {
  signedUrl: string;
  path: string;
  publicUrl: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
}

export async function createSupabaseUploadSession(input: {
  name: string;
  mimeType: string;
  fileSize: number;
}): Promise<UploadSession> {
  try {
    const validation = validateFileMetadata({ mimeType: input.mimeType, fileSize: input.fileSize });
    if (!validation.valid) {
      throw new Error(validation.message ?? "Ju lutemi ngarkoni një foto të vlefshme.");
    }

    const extension = ALLOWED_IMAGE_TYPES.get(input.mimeType);
    if (!extension) {
      throw new Error("Ju lutemi ngarkoni një foto të vlefshme.");
    }

    const bucket = getSupabaseStorageBucket();
    const supabase = getSupabaseAdminClient();
    const originalName = sanitizeOriginalName(input.name);
    const objectPath = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${originalName || `uploaded-photo.${extension}`}`;

    const signEndpoint = `${supabase.url}/storage/v1/object/upload/sign/${encodeURIComponent(bucket)}/${encodeSupabaseStoragePath(objectPath)}`;
    const response = await fetch(signEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${supabase.serviceRoleKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      throw new Error(await getSupabaseErrorMessage(response, "Sesioni i ngarkimit nuk u krijua dot."));
    }

    const data = (await response.json().catch(() => null)) as { url?: string; token?: string } | null;
    if (!data?.url) {
      throw new Error("Sesioni i ngarkimit nuk u krijua dot.");
    }

    const signedUrl = data.url.startsWith("http") ? data.url : `${supabase.url}${data.url.startsWith("/") ? "" : "/"}${data.url}`;

    return {
      signedUrl,
      path: objectPath,
      publicUrl: getSupabaseStoragePublicUrl(bucket, objectPath),
      originalName,
      fileSize: input.fileSize,
      mimeType: input.mimeType,
    };
  } catch (e) {
    error("Couldn't create Supabase upload session", {
      file: "features/photos/service.ts",
      function: "createSupabaseUploadSession",
      error: formatError(e),
    });
    throw e instanceof Error ? e : new Error("Sesioni i ngarkimit nuk u krijua dot.");
  }
}

export function validateFileMetadata(file: { mimeType: string; fileSize: number }): PhotoValidationResult {
  if (!ALLOWED_IMAGE_TYPES.has(file.mimeType)) {
    return {
      valid: false,
      message: "Ju lutemi ngarkoni vetëm foto JPEG, PNG, WebP, HEIC ose HEIF.",
    };
  }

  if (file.fileSize <= 0) {
    return { valid: false, message: "Një nga skedarët e zgjedhur është bosh." };
  }

  if (file.fileSize > getMaxUploadSizeBytes()) {
    return {
      valid: false,
      message: `Çdo foto duhet të jetë ${process.env.MAX_UPLOAD_SIZE_MB ?? DEFAULT_MAX_UPLOAD_SIZE_MB}MB ose më e vogël.`,
    };
  }

  return { valid: true };
}

export function validateImageFile(file: File): PhotoValidationResult {
  try {
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return {
        valid: false,
        message: "Ju lutemi ngarkoni vetëm foto JPEG, PNG, WebP, HEIC ose HEIF.",
      };
    }

    if (file.size <= 0) {
      return {
        valid: false,
        message: "Një nga skedarët e zgjedhur është bosh.",
      };
    }

    if (file.size > getMaxUploadSizeBytes()) {
      return {
        valid: false,
        message: `Çdo foto duhet të jetë ${process.env.MAX_UPLOAD_SIZE_MB ?? DEFAULT_MAX_UPLOAD_SIZE_MB}MB ose më e vogël.`,
      };
    }

    return { valid: true };
  } catch (e) {
    error("Couldn't validate uploaded file", {
      file: "features/photos/service.ts",
      function: "validateImageFile",
      error: formatError(e),
    });
    return {
      valid: false,
      message: "Ju lutemi ngarkoni një foto të vlefshme.",
    };
  }
}

function resolveUploadDir(): string {
  try {
    const configuredDir = process.env.UPLOAD_DIR;

    if (!configuredDir) {
      return path.join(process.cwd(), "public", "uploads");
    }

    if (path.isAbsolute(configuredDir)) {
      return path.resolve(configuredDir);
    }

    return path.join(/*turbopackIgnore: true*/ process.cwd(), configuredDir);
  } catch (e) {
    error("Couldn't resolve upload directory", {
      file: "features/photos/service.ts",
      function: "resolveUploadDir",
      error: formatError(e),
    });
    return path.join(process.cwd(), "public", "uploads");
  }
}

function getPhotoStorageDriver(): string {
  return process.env.PHOTO_STORAGE?.trim() || "local";
}

async function getPhotoPrisma() {
  const { getPrisma } = await import("@core/db");
  return getPrisma();
}

async function saveUploadedFileToDisk(file: File): Promise<SavedUpload> {
  const uploadDir = resolveUploadDir();
  await mkdir(uploadDir, { recursive: true });

  const extension = ALLOWED_IMAGE_TYPES.get(file.type);
  if (!extension) {
    throw new Error("Ju lutemi ngarkoni një foto të vlefshme.");
  }

  const generatedName = `${crypto.randomUUID()}.${extension}`;
  const destination = path.join(uploadDir, generatedName);
  const resolvedDestination = path.resolve(destination);

  if (!resolvedDestination.startsWith(uploadDir + path.sep)) {
    throw new Error("Ju lutemi ngarkoni një foto të vlefshme.");
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(resolvedDestination, bytes);

  return {
    fileUrl: `/uploads/${generatedName}`,
    fileName: generatedName,
    originalName: sanitizeOriginalName(file.name),
    fileSize: file.size,
    mimeType: file.type,
  };
}

async function saveUploadedFileToGoogleDrive(file: File): Promise<SavedUpload> {
  const folderId = getRequiredEnv("GOOGLE_DRIVE_FOLDER_ID");
  const extension = ALLOWED_IMAGE_TYPES.get(file.type);

  if (!extension) {
    throw new Error("Ju lutemi ngarkoni një foto të vlefshme.");
  }

  const originalName = sanitizeOriginalName(file.name);
  const generatedName = `${crypto.randomUUID()}-${originalName || `uploaded-photo.${extension}`}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  const accessToken = await getGoogleAccessToken();
  const createdFile = await createGoogleDriveFile({
    accessToken,
    folderId,
    fileName: generatedName,
    mimeType: file.type,
    bytes,
  });

  if (shouldMakeGoogleDriveFilesPublic()) {
    await makeGoogleDriveFilePublic(accessToken, createdFile.id);
  }

  return {
    fileUrl: getGoogleDriveImageUrl(createdFile.id),
    fileName: createdFile.id,
    originalName,
    fileSize: file.size,
    mimeType: file.type,
  };
}

async function saveUploadedFileToSupabase(file: File): Promise<SavedUpload> {
  const bucket = getSupabaseStorageBucket();
  const extension = ALLOWED_IMAGE_TYPES.get(file.type);

  if (!extension) {
    throw new Error("Ju lutemi ngarkoni një foto të vlefshme.");
  }

  const supabase = getSupabaseAdminClient();
  const originalName = sanitizeOriginalName(file.name);
  const objectPath = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${originalName || `uploaded-photo.${extension}`}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  const response = await fetch(`${supabase.url}/storage/v1/object/${encodeURIComponent(bucket)}/${encodeSupabaseStoragePath(objectPath)}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${supabase.serviceRoleKey}`,
      "Content-Type": file.type,
      "Cache-Control": "31536000",
    },
    body: bytes,
  });

  if (!response.ok) {
    throw new Error(await getSupabaseErrorMessage(response, "Supabase Storage upload failed."));
  }

  return {
    fileUrl: getSupabaseStoragePublicUrl(bucket, objectPath),
    fileName: objectPath,
    originalName,
    fileSize: file.size,
    mimeType: file.type,
  };
}

function sanitizeOriginalName(originalName: string): string {
  try {
    const baseName = path.basename(originalName);
    return baseName.replace(/[^\w.\- ]/g, "").slice(0, 180) || "uploaded-photo";
  } catch (e) {
    error("Couldn't sanitize original filename", {
      file: "features/photos/service.ts",
      function: "sanitizeOriginalName",
      error: formatError(e),
    });
    return "uploaded-photo";
  }
}

async function deleteUploadedFile(fileUrl: string, fileName?: string): Promise<void> {
  try {
    if (getPhotoStorageDriver() === SUPABASE_STORAGE || isSupabaseStorageUrl(fileUrl)) {
      const objectPath = fileName || getSupabaseStorageObjectPath(fileUrl);

      if (objectPath) {
        await deleteSupabaseStorageFile(objectPath);
        return;
      }
    }

    if (isGoogleDriveUrl(fileUrl)) {
      const driveFileId = getGoogleDriveFileId(fileUrl) ?? (fileName && !fileName.includes("/") ? fileName : null);

      if (driveFileId) {
        await deleteGoogleDriveFile(driveFileId);
        return;
      }
    }

    if (!fileUrl.startsWith("/uploads/")) {
      return;
    }

    const uploadDir = resolveUploadDir();
    const localFileName = path.basename(fileUrl);
    const target = path.resolve(uploadDir, localFileName);

    if (!target.startsWith(uploadDir + path.sep)) {
      return;
    }

    await unlink(target).catch((e: unknown) => {
      if (e instanceof Error && "code" in e && e.code === "ENOENT") {
        return;
      }
      throw e;
    });
  } catch (e) {
    error("Couldn't delete uploaded file from disk", {
      file: "features/photos/service.ts",
      function: "deleteUploadedFile",
      error: formatError(e),
    });
  }
}

function getSupabaseStorageBucket(): string {
  return process.env.SUPABASE_STORAGE_BUCKET?.trim() || DEFAULT_SUPABASE_STORAGE_BUCKET;
}

function getSupabaseAdminClient() {
  return {
    url: getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL").replace(/\/$/, ""),
    serviceRoleKey: getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
  };
}

async function deleteSupabaseStorageFile(objectPath: string): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const response = await fetch(`${supabase.url}/storage/v1/object/${encodeURIComponent(getSupabaseStorageBucket())}/${encodeSupabaseStoragePath(objectPath)}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${supabase.serviceRoleKey}`,
    },
  });

  if (!response.ok && response.status !== 404) {
    throw new Error(await getSupabaseErrorMessage(response, "Supabase Storage file could not be deleted."));
  }
}

async function getGoogleAccessToken(): Promise<string> {
  if (cachedGoogleAccessToken && cachedGoogleAccessToken.expiresAt > Date.now() + 60_000) {
    return cachedGoogleAccessToken.accessToken;
  }

  const serviceAccountEmail = getRequiredEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  const privateKey = getGooglePrivateKey();
  const now = Math.floor(Date.now() / 1000);
  const assertion = signJwt(
    { alg: "RS256", typ: "JWT" },
    {
      iss: serviceAccountEmail,
      scope: GOOGLE_DRIVE_SCOPE,
      aud: GOOGLE_TOKEN_URL,
      exp: now + 3600,
      iat: now,
    },
    privateKey
  );

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  const data = (await response.json().catch(() => null)) as { access_token?: string; expires_in?: number; error_description?: string } | null;

  if (!response.ok || !data?.access_token) {
    throw new Error(data?.error_description || "Google Drive authorization failed.");
  }

  cachedGoogleAccessToken = {
    accessToken: data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
  };

  return data.access_token;
}

async function createGoogleDriveFile(input: {
  accessToken: string;
  folderId: string;
  fileName: string;
  mimeType: string;
  bytes: Buffer<ArrayBuffer>;
}): Promise<{ id: string }> {
  const createResponse = await fetch(`${GOOGLE_DRIVE_UPLOAD_URL}/files?uploadType=resumable&supportsAllDrives=true&fields=id`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.accessToken}`,
      "Content-Type": "application/json; charset=UTF-8",
      "X-Upload-Content-Type": input.mimeType,
      "X-Upload-Content-Length": String(input.bytes.byteLength),
    },
    body: JSON.stringify({
      name: input.fileName,
      parents: [input.folderId],
    }),
  });

  if (!createResponse.ok) {
    throw new Error(await getGoogleErrorMessage(createResponse, "Google Drive upload could not start."));
  }

  const uploadUrl = createResponse.headers.get("location");
  if (!uploadUrl) {
    throw new Error("Google Drive upload URL was not returned.");
  }

  const uploadResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": input.mimeType,
      "Content-Length": String(input.bytes.byteLength),
    },
    body: input.bytes,
  });

  const uploadedFile = (await uploadResponse.json().catch(() => null)) as { id?: string } | null;

  if (!uploadResponse.ok || !uploadedFile?.id) {
    throw new Error(await getGoogleErrorMessage(uploadResponse, "Google Drive upload failed."));
  }

  return { id: uploadedFile.id };
}

async function makeGoogleDriveFilePublic(accessToken: string, fileId: string): Promise<void> {
  const response = await fetch(`${GOOGLE_DRIVE_API_URL}/files/${encodeURIComponent(fileId)}/permissions?supportsAllDrives=true`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      role: "reader",
      type: "anyone",
    }),
  });

  if (!response.ok) {
    throw new Error(await getGoogleErrorMessage(response, "Google Drive file permission could not be created."));
  }
}

async function deleteGoogleDriveFile(fileId: string): Promise<void> {
  const accessToken = await getGoogleAccessToken();
  const response = await fetch(`${GOOGLE_DRIVE_API_URL}/files/${encodeURIComponent(fileId)}?supportsAllDrives=true`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok && response.status !== 404) {
    throw new Error(await getGoogleErrorMessage(response, "Google Drive file could not be deleted."));
  }
}

function signJwt(header: Record<string, unknown>, payload: Record<string, unknown>, privateKey: string): string {
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const input = `${encodedHeader}.${encodedPayload}`;
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(input);
  signer.end();
  return `${input}.${signer.sign(privateKey, "base64url")}`;
}

function base64UrlEncode(value: string): string {
  return Buffer.from(value).toString("base64url");
}

function getGooglePrivateKey(): string {
  const base64Key = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_BASE64?.trim();

  if (base64Key) {
    return Buffer.from(base64Key, "base64").toString("utf8");
  }

  return getRequiredEnv("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY").replace(/\\n/g, "\n");
}

function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
}

function shouldMakeGoogleDriveFilesPublic(): boolean {
  return process.env.GOOGLE_DRIVE_MAKE_PUBLIC !== "false";
}

function getGoogleDriveImageUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=view&id=${encodeURIComponent(fileId)}`;
}

function isGoogleDriveUrl(fileUrl: string): boolean {
  return fileUrl.startsWith("https://drive.google.com/");
}

function getSupabaseStoragePublicUrl(bucket: string, objectPath: string): string {
  const supabaseUrl = getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL").replace(/\/$/, "");
  return `${supabaseUrl}/storage/v1/object/public/${encodeURIComponent(bucket)}/${encodeSupabaseStoragePath(objectPath)}`;
}

function encodeSupabaseStoragePath(objectPath: string): string {
  return objectPath
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
}

function isSupabaseStorageUrl(fileUrl: string): boolean {
  try {
    const supabaseUrl = getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL");
    return fileUrl.startsWith(`${supabaseUrl}/storage/v1/object/public/${getSupabaseStorageBucket()}/`);
  } catch {
    return false;
  }
}

function getGoogleDriveFileId(fileUrl: string): string | null {
  try {
    const url = new URL(fileUrl);
    return url.searchParams.get("id");
  } catch {
    return null;
  }
}

function getSupabaseStorageObjectPath(fileUrl: string): string | null {
  try {
    const url = new URL(fileUrl);
    const marker = `/storage/v1/object/public/${getSupabaseStorageBucket()}/`;
    const markerIndex = url.pathname.indexOf(marker);

    if (markerIndex === -1) {
      return null;
    }

    return decodeURIComponent(url.pathname.slice(markerIndex + marker.length));
  } catch {
    return null;
  }
}

async function getGoogleErrorMessage(response: Response, fallback: string): Promise<string> {
  const data = (await response.json().catch(() => null)) as { error?: { message?: string } } | null;
  return data?.error?.message || fallback;
}

async function getSupabaseErrorMessage(response: Response, fallback: string): Promise<string> {
  const data = (await response.json().catch(() => null)) as { message?: string; error?: string } | null;
  return data?.message || data?.error || fallback;
}
