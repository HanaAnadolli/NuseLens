// app/api/auth/me/route.ts
import { success, unauthorized, withErrorHandler } from "@core/api";
import { requireUserFromRequest } from "@/features/auth/service";

export const runtime = "nodejs";

export const GET = withErrorHandler(async (request) => {
  const user = await requireUserFromRequest(request);

  if (!user) {
    return unauthorized();
  }

  return success({ user });
});
