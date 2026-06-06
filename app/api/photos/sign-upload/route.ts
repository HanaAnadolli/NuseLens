// app/api/photos/sign-upload/route.ts
import { badRequest, success, withErrorHandler } from "@core/api";
import { createSupabaseUploadSession } from "@/features/photos/service";

export const runtime = "nodejs";
export const maxDuration = 30;

interface SignUploadBody {
  name?: unknown;
  mimeType?: unknown;
  fileSize?: unknown;
}

export const POST = withErrorHandler(async (request) => {
  const body = (await request.json().catch(() => ({}))) as SignUploadBody;

  if (typeof body.name !== "string" || typeof body.mimeType !== "string" || typeof body.fileSize !== "number") {
    return badRequest("Të dhënat e skedarit mungojnë.");
  }

  try {
    const session = await createSupabaseUploadSession({
      name: body.name,
      mimeType: body.mimeType,
      fileSize: body.fileSize,
    });
    return success(session);
  } catch (e) {
    return badRequest(e instanceof Error ? e.message : "Sesioni i ngarkimit nuk u krijua dot.");
  }
});
