// app/api/photos/by-guest/[slug]/route.ts
import type { NextRequest } from "next/server";
import { success, unauthorized, withErrorHandler } from "@core/api";
import { requireAdminFromRequest } from "@/features/auth/service";
import { deletePhotosByGuest, revalidatePhotosCache } from "@/features/photos/service";

export const runtime = "nodejs";
export const maxDuration = 60;

const ANON_SLUG = "_anonim";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export const DELETE = withErrorHandler(async (request: NextRequest, context: RouteContext) => {
  const admin = await requireAdminFromRequest(request);
  if (!admin) {
    return unauthorized();
  }

  const { slug } = await context.params;
  const decoded = decodeURIComponent(slug);
  const guestName = decoded === ANON_SLUG ? null : decoded;

  const result = await deletePhotosByGuest(guestName);
  revalidatePhotosCache();
  return success(result);
});
