import { NextResponse } from "next/server";
import { ZodError } from "zod";

export type ApiError = {
  error: string;
  details?: unknown;
};

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function created<T>(data: T) {
  return NextResponse.json(data, { status: 201 });
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}

export function badRequest(message: string, details?: unknown) {
  return NextResponse.json({ error: message, details } satisfies ApiError, { status: 400 });
}

export function notFound(message = "Resource not found") {
  return NextResponse.json({ error: message } satisfies ApiError, { status: 404 });
}

export function tooMany(message = "Too many requests") {
  return NextResponse.json({ error: message } satisfies ApiError, { status: 429 });
}

export function serverError(message = "Internal server error") {
  return NextResponse.json({ error: message } satisfies ApiError, { status: 500 });
}

export function handleZodError(err: ZodError) {
  return badRequest("Validation failed", err.errors.map((e) => ({ path: e.path.join("."), message: e.message })));
}
