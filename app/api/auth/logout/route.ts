// app/api/auth/logout/route.ts
import { success, withErrorHandler } from "@core/api";
import { logoutUser } from "@/features/auth/service";

export const runtime = "nodejs";

export const POST = withErrorHandler(async () => {
  await logoutUser();
  return success({ ok: true });
});
