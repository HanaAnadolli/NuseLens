// app/api/photos/[id]/route.ts
import type { NextRequest } from "next/server";
import { notFound, success, unauthorized, withErrorHandler } from "@core/api";
import { requireAdminFromRequest } from "@/features/auth/service";
import { deletePhoto } from "@/features/photos/service";

export const runtime = "nodejs";

interface PhotoRouteContext {
  params: Promise<{ id: string }>;
}

export const DELETE = withErrorHandler(async (request: NextRequest, context: PhotoRouteContext) => {
  const admin = await requireAdminFromRequest(request);

  if (!admin) {
    return unauthorized();
  }

  const params = await context.params;
  const id = params.id;

  if (!id) {
    return notFound("Fotoja nuk u gjet.");
  }

  const deleted = await deletePhoto(id);

  if (!deleted) {
    return notFound("Fotoja nuk u gjet.");
  }

  return success({ ok: true });
});
