import { NextResponse, type NextRequest } from "next/server";
import type { z } from "zod";
import { error, formatError } from "./logger";

type ApiResponse = Response | Promise<Response>;

type ParseBodyResult<TSchema extends z.ZodType> =
  | { success: true; data: z.infer<TSchema> }
  | { success: false; response: NextResponse };

export function success<TData>(data: TData, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

export function badRequest(message = "Kërkesa nuk është e vlefshme."): NextResponse {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function unauthorized(message = "Ju lutemi hyni për të vazhduar."): NextResponse {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function conflict(message = "Konflikt me të dhënat ekzistuese."): NextResponse {
  return NextResponse.json({ error: message }, { status: 409 });
}

export function notFound(message = "Nuk u gjet."): NextResponse {
  return NextResponse.json({ error: message }, { status: 404 });
}

export async function parseBody<TSchema extends z.ZodType>(
  request: NextRequest,
  schema: TSchema
): Promise<ParseBodyResult<TSchema>> {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return {
        success: false,
        response: badRequest(parsed.error.issues[0]?.message),
      };
    }

    return { success: true, data: parsed.data };
  } catch {
    return {
      success: false,
      response: badRequest("Kërkesa duhet të përmbajë JSON të vlefshëm."),
    };
  }
}

export function withErrorHandler(handler: (request: NextRequest) => ApiResponse): (request: NextRequest) => Promise<Response>;
export function withErrorHandler<TContext>(
  handler: (request: NextRequest, context: TContext) => ApiResponse
): (request: NextRequest, context: TContext) => Promise<Response>;
export function withErrorHandler<TContext>(
  handler: (request: NextRequest, context?: TContext) => ApiResponse
): (request: NextRequest, context?: TContext) => Promise<Response> {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (e) {
      error("API request failed", {
        file: "lib/core/api.ts",
        function: "withErrorHandler",
        error: formatError(e),
      });

      return NextResponse.json(
        { error: e instanceof Error ? e.message : "Kërkesa nuk u përpunua dot." },
        { status: 500 }
      );
    }
  };
}
