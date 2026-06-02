type LogContext = Record<string, unknown>;

export function error(message: string, context?: LogContext): void {
  console.error(message, context);
}

export function info(message: string, context?: LogContext): void {
  console.info(message, context);
}

export function formatError(value: unknown): string {
  if (value instanceof Error) {
    return value.stack ?? value.message;
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
