// app/api/photos/record/route.ts
import { badRequest, success, withErrorHandler } from "@core/api";
import { createPhotoRecord } from "@/features/photos/service";

export const runtime = "nodejs";
export const maxDuration = 30;

interface PhotoMetadataInput {
  fileUrl?: unknown;
  fileName?: unknown;
  originalName?: unknown;
  fileSize?: unknown;
  mimeType?: unknown;
}

interface RecordBody {
  guestName?: unknown;
  photos?: unknown;
}

function isValidPhoto(p: PhotoMetadataInput): p is {
  fileUrl: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
} {
  return (
    typeof p.fileUrl === "string" &&
    typeof p.fileName === "string" &&
    typeof p.originalName === "string" &&
    typeof p.fileSize === "number" &&
    typeof p.mimeType === "string"
  );
}

export const POST = withErrorHandler(async (request) => {
  const body = (await request.json().catch(() => ({}))) as RecordBody;

  if (!Array.isArray(body.photos) || body.photos.length === 0) {
    return badRequest("Asnjë foto nuk u rregjistrua.");
  }

  const validPhotos = (body.photos as PhotoMetadataInput[]).filter(isValidPhoto);
  if (validPhotos.length !== body.photos.length) {
    return badRequest("Të dhënat e ndonjë fotoje janë të paplota.");
  }

  const guestName = typeof body.guestName === "string" && body.guestName.trim() ? body.guestName.trim() : undefined;

  const photos = await Promise.all(
    validPhotos.map((p) =>
      createPhotoRecord({
        guestName,
        fileUrl: p.fileUrl,
        fileName: p.fileName,
        originalName: p.originalName,
        fileSize: p.fileSize,
        mimeType: p.mimeType,
      })
    )
  );

  return success({ photos }, 201);
});
