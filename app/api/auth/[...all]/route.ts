import { auth } from "@/lib/auth"; // path to your auth file
import { toNextJsHandler } from "better-auth/next-js";
import { checkRateLimit } from "@/lib/rate-limit";

const authHandlers = toNextJsHandler(auth);

export async function POST(req: Request) {
  const rateLimitError = checkRateLimit(req, "auth-api-post", {
    limit: 20,
    windowSeconds: 60,
  });
  if (rateLimitError) return rateLimitError;
  return authHandlers.POST(req);
}

export async function GET(req: Request) {
  const rateLimitError = checkRateLimit(req, "auth-api-get", {
    limit: 60,
    windowSeconds: 60,
  });
  if (rateLimitError) return rateLimitError;
  return authHandlers.GET(req);
}

