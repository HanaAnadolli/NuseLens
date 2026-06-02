// features/photos/service.ts
import crypto from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import type { Photo } from "@prisma/client";
import { getPrisma } from "@core/db";
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
    const prisma = getPrisma();
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
    const prisma = getPrisma();
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
    const prisma = getPrisma();
    const photo = await prisma.photo.findUnique({ where: { id } });

    if (!photo) {
      return false;
    }

    await prisma.photo.delete({ where: { id } });
    await deleteUploadedFile(photo.fileUrl);
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

async function deleteUploadedFile(fileUrl: string): Promise<void> {
  try {
    if (!fileUrl.startsWith("/uploads/")) {
      return;
    }

    const uploadDir = resolveUploadDir();
    const fileName = path.basename(fileUrl);
    const target = path.resolve(uploadDir, fileName);

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
