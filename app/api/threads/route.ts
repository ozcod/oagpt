import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { chatThread, chatMessage } from "@/db/schema";
import { eq, desc, asc } from "drizzle-orm";
import { checkRateLimit } from "@/lib/rate-limit";

// GET /api/threads - Fetch all chat threads for authenticated user
export async function GET(req: Request) {
  const rateLimitError = checkRateLimit(req, "threads-get", { limit: 60, windowSeconds: 60 });
  if (rateLimitError) return rateLimitError;

  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const threads = await db
      .select()
      .from(chatThread)
      .where(eq(chatThread.userId, session.user.id))
      .orderBy(desc(chatThread.updatedAt));

    return NextResponse.json(threads);
  } catch (error: any) {
    console.error("Error fetching threads:", error);
    return NextResponse.json({ error: error?.message || "Failed to fetch threads" }, { status: 500 });
  }
}
