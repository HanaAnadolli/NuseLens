// app/api/auth/login/route.ts
import { parseBody, success, withErrorHandler } from "@core/api";
import { loginSchema, loginUser } from "@/features/auth/service";

export const runtime = "nodejs";

export const POST = withErrorHandler(async (request) => {
  const parsed = await parseBody(request, loginSchema);

  if (!parsed.success) {
    return parsed.response;
  }

  const result = await loginUser(parsed.data);
  return success(result);
});
