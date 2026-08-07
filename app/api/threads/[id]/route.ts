import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { chatThread, chatMessage } from "@/db/schema";
import { eq, asc, and } from "drizzle-orm";
import { checkRateLimit } from "@/lib/rate-limit";

// GET /api/threads/[id] - Fetch a specific thread and its messages
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const rateLimitError = checkRateLimit(req, "thread-detail-get", { limit: 60, windowSeconds: 60 });
  if (rateLimitError) return rateLimitError;

  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: threadId } = await params;

    const [thread] = await db
      .select()
      .from(chatThread)
      .where(and(eq(chatThread.id, threadId), eq(chatThread.userId, session.user.id)));

    if (!thread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    const messages = await db
      .select()
      .from(chatMessage)
      .where(eq(chatMessage.threadId, threadId))
      .orderBy(asc(chatMessage.createdAt));

    return NextResponse.json({ ...thread, messages });
  } catch (error: any) {
    console.error("Error fetching thread detail:", error);
    return NextResponse.json({ error: error?.message || "Failed to fetch thread" }, { status: 500 });
  }
}

// DELETE /api/threads/[id] - Delete a chat thread and all its messages
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const rateLimitError = checkRateLimit(req, "thread-delete", { limit: 20, windowSeconds: 60 });
  if (rateLimitError) return rateLimitError;

  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: threadId } = await params;

    await db
      .delete(chatThread)
      .where(and(eq(chatThread.id, threadId), eq(chatThread.userId, session.user.id)));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting thread:", error);
    return NextResponse.json({ error: error?.message || "Failed to delete thread" }, { status: 500 });
  }
}
