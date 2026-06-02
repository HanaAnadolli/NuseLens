// app/api/auth/register/route.ts
import { conflict, parseBody, success, withErrorHandler } from "@core/api";
import { registerSchema, registerUser } from "@/features/auth/service";

export const runtime = "nodejs";

export const POST = withErrorHandler(async (request) => {
  const parsed = await parseBody(request, registerSchema);

  if (!parsed.success) {
    return parsed.response;
  }

  const result = await registerUser(parsed.data);

  if ("conflictMessage" in result) {
    return conflict(result.conflictMessage);
  }

  return success(result, 201);
});
