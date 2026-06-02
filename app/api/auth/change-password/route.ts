// app/api/auth/change-password/route.ts
import { parseBody, success, unauthorized, withErrorHandler } from "@core/api";
import { changePassword, changePasswordSchema, requireUserFromRequest } from "@/features/auth/service";

export const runtime = "nodejs";

export const POST = withErrorHandler(async (request) => {
  const user = await requireUserFromRequest(request);

  if (!user) {
    return unauthorized();
  }

  const parsed = await parseBody(request, changePasswordSchema);

  if (!parsed.success) {
    return parsed.response;
  }

  await changePassword(user.id, parsed.data);
  return success({ ok: true });
});
