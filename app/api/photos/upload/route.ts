// app/api/photos/upload/route.ts
import { badRequest, success, withErrorHandler } from "@core/api";
import {
  createPhotoRecord,
  getMaxFilesPerUpload,
  saveUploadedFile,
  validateImageFile,
} from "@/features/photos/service";

export const runtime = "nodejs";
export const maxDuration = 60;

export const POST = withErrorHandler(async (request) => {
  const formData = await request.formData();
  const guestNameValue = formData.get("guestName");
  const guestName = typeof guestNameValue === "string" ? guestNameValue.trim() : undefined;
  const files = formData.getAll("photos").filter((value): value is File => value instanceof File);
  const maxFiles = getMaxFilesPerUpload();

  if (files.length === 0) {
    return badRequest("Ju lutemi zgjidhni të paktën një foto.");
  }

  if (files.length > maxFiles) {
    return badRequest(`Ju lutemi ngarkoni jo më shumë se ${maxFiles} foto njëherësh.`);
  }

  for (const file of files) {
    const validation = validateImageFile(file);

    if (!validation.valid) {
      return badRequest(validation.message);
    }
  }

  const photos = await Promise.all(
    files.map(async (file) => {
      const savedFile = await saveUploadedFile(file);
      return createPhotoRecord({ guestName, ...savedFile });
    })
  );

  return success({ photos }, 201);
});
