import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

// Wrap better-auth handlers and log server errors clearly
const authHandlers = toNextJsHandler(auth);

import { toNextJsHandler } from "better-auth/next-js";

export async function POST(req: Request) {
  const rateLimitError = checkRateLimit(req, "auth-api-post", {
    limit: 30,
    windowSeconds: 60,
  });
  if (rateLimitError) return rateLimitError;

  try {
    const res = await authHandlers.POST(req);
    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Auth POST Error" }, { status: 400 });
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
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Auth GET Error" }, { status: 400 });
  }
}

export async function OPTIONS(req: Request) {
  try {
    if (typeof (authHandlers as any).OPTIONS === "function") {
      return await (authHandlers as any).OPTIONS(req);
    }
    return await auth.handler(req);
  } catch (err: any) {
    return new Response(null, { status: 204 });
  }
}

