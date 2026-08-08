import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db/index";
import { user } from "@/db/schema/auth-schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json({ error: "Missing email/username or password" }, { status: 400 });
    }

    let targetEmail = identifier.trim();

    // If identifier doesn't look like an email, lookup email by username (user.name) in database
    if (!targetEmail.includes("@")) {
      const foundUsers = await db.select().from(user).where(eq(user.name, targetEmail)).limit(1);

      if (foundUsers.length > 0) {
        targetEmail = foundUsers[0].email;
      }
    }

    // Authenticate via BetterAuth email signin
    const res = await auth.api.signInEmail({
      body: {
        email: targetEmail,
        password,
      },
      headers: req.headers,
    });

    if (!res) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
    }

    return NextResponse.json({ success: true, user: res.user });
  } catch (err: any) {
    console.error("❌ Custom Signin API Error:", err);
    return NextResponse.json({ error: err?.message || "Invalid email or password" }, { status: 400 });
  }
}
