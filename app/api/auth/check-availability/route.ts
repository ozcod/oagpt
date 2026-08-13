import { NextResponse } from "next/server";
import { db } from "@/db";
import { user } from "@/db/schema/auth-schema";
import { sql } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email")?.trim().toLowerCase();
    const username = searchParams.get("username")?.trim();

    let emailExists = false;
    let usernameExists = false;
    const suggestions: string[] = [];

    if (email) {
      const existingEmail = await db
        .select({ id: user.id })
        .from(user)
        .where(sql`LOWER(${user.email}) = ${email}`)
        .limit(1);

      emailExists = existingEmail.length > 0;
    }

    if (username) {
      const existingUser = await db
        .select({ id: user.id })
        .from(user)
        .where(sql`LOWER(${user.name}) = ${username.toLowerCase()}`)
        .limit(1);

      usernameExists = existingUser.length > 0;

      if (usernameExists) {
        const baseName = username.replace(/[^a-zA-Z0-9_-]/g, "");
        const currentYear = new Date().getFullYear();

        const candidateList = [
          `${baseName}${Math.floor(Math.random() * 89 + 10)}`,
          `${baseName}_${Math.floor(Math.random() * 899 + 100)}`,
          `${baseName}_dev`,
          `${baseName}${currentYear}`,
          `${baseName}_ai`,
          `${baseName}007`,
        ];

        for (const candidate of candidateList) {
          if (suggestions.length >= 3) break;
          const checkCandidate = await db
            .select({ id: user.id })
            .from(user)
            .where(sql`LOWER(${user.name}) = ${candidate.toLowerCase()}`)
            .limit(1);

          if (checkCandidate.length === 0 && !suggestions.includes(candidate)) {
            suggestions.push(candidate);
          }
        }
      }
    }

    return NextResponse.json({
      emailExists,
      usernameExists,
      suggestions,
    });
  } catch (error: any) {
    return NextResponse.json(
      { emailExists: false, usernameExists: false, suggestions: [] },
      { status: 500 }
    );
  }
}
