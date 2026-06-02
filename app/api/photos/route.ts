// app/api/photos/route.ts
import { success, unauthorized, withErrorHandler } from "@core/api";
import { requireAdminFromRequest } from "@/features/auth/service";
import { getPhotos } from "@/features/photos/service";

export const runtime = "nodejs";

export const GET = withErrorHandler(async (request) => {
  const admin = await requireAdminFromRequest(request);

  if (!admin) {
    return unauthorized();
  }

  const photos = await getPhotos();
  return success({ photos });
});
