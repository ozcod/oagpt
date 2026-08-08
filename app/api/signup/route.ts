import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Register user via BetterAuth internal API
    const res = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
    });

    if (!res || !res.user) {
      return NextResponse.json({ error: "Signup failed" }, { status: 400 });
    }

    // 2. Generate token and send email directly via Resend
    const callbackUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.ai.ozairahmad.com";

    try {
      // BetterAuth creates the token and triggers sendVerificationEmail or we invoke sendVerificationEmail directly with headers
      await auth.api.sendVerificationEmail({
        body: {
          email,
          callbackURL: callbackUrl,
        },
        headers: req.headers,
      });
      console.log(`✅ [Custom Route Signup] Direct sendVerificationEmail called for ${email}`);
    } catch (emailErr: any) {
      console.error("⚠️ sendVerificationEmail API error:", emailErr?.message || emailErr);
      
      // Fallback: send email directly
      const fallbackUrl = `${callbackUrl}/auth/signin`;
      await sendEmail({
        to: email,
        subject: "Verify your email address for OAGPT",
        html: `<p>Welcome to OAGPT, ${name}! Please <a href="${fallbackUrl}">click here to sign in</a>.</p>`,
      });
    }

    return NextResponse.json({ success: true, user: res.user });
  } catch (err: any) {
    console.error("❌ Custom Signup API Error:", err);
    return NextResponse.json({ error: err?.message || "Signup failed" }, { status: 400 });
  }
}
