import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db/index"; // your drizzle instance
import { schema } from "@/db/schema/auth-schema";
import { sendEmail } from "@/lib/email";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: (request) => {
    const origin = request?.headers?.get("origin") || request?.headers?.get("referer");
    const allowed = [
      process.env.BETTER_AUTH_URL,
      process.env.NEXT_PUBLIC_APP_URL,
      "https://www.ai.ozairahmad.com",
      "https://ai.ozairahmad.com",
      "http://localhost:3000",
    ].filter(Boolean) as string[];

    // Dynamically trust any Vercel preview domain (*.vercel.app)
    if (origin) {
      try {
        const url = new URL(origin);
        if (url.hostname.endsWith(".vercel.app") || allowed.includes(url.origin)) {
          return [url.origin];
        }
      } catch (e) {}
    }
    return allowed;
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    async sendVerificationEmail({ user, url }: { user: { name?: string; email: string }; url: string }) {
      await sendEmail({
        to: user.email,
        subject: "Verify your email address - OAGPT",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #212121; color: #ffffff; border-radius: 12px;">
            <h2 style="color: #ffffff; margin-bottom: 16px;">Welcome to OAGPT, ${user.name || "User"}! 👋</h2>
            <p style="color: #b4b4b4; font-size: 14px; line-height: 1.6;">
              Please verify your email address to unlock full access to OAGPT.
            </p>
            <div style="margin: 28px 0;">
              <a href="${url}" style="background-color: #ffffff; color: #000000; padding: 12px 24px; font-weight: bold; font-size: 14px; text-decoration: none; border-radius: 8px; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            <p style="color: #71717a; font-size: 12px;">
              If you did not sign up for OAGPT, please ignore this email.
            </p>
          </div>
        `,
      });
    },
  },

  socialProviders: {
    google: {
      accessType: "offline",
      prompt: "select_account consent",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },

    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
});
