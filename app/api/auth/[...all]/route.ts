import { NextResponse } from "next/server";
import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

// Wrap better-auth handlers and log server errors clearly
const authHandlers = toNextJsHandler(auth);

export async function POST(req: Request) {
  const rateLimitError = checkRateLimit(req, "auth-api-post", {
    limit: 30,
    windowSeconds: 60,
  });
  if (rateLimitError) return rateLimitError;

  try {
    const res = await authHandlers.POST(req);
    return res;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Auth POST Error";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}

export async function GET(req: Request) {
  const rateLimitError = checkRateLimit(req, "auth-api-get", {
    limit: 60,
    windowSeconds: 60,
  });
  if (rateLimitError) return rateLimitError;

  try {
    return await authHandlers.GET(req);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Auth GET Error";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}

export async function OPTIONS(req: Request) {
  try {
    const handlers = authHandlers as Record<string, unknown>;
    if (typeof handlers.OPTIONS === "function") {
      return await (handlers.OPTIONS as (req: Request) => Promise<Response>)(req);
    }
    return await auth.handler(req);
  } catch {
    return new Response(null, { status: 204 });
  }
}

