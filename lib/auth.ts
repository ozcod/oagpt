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
    sendVerificationOnSignUp: true,
    autoSignIn: false,
    async sendVerificationEmail({ user, url }: { user: { name?: string; email: string }; url: string }) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.ai.ozairahmad.com";
      const signinCallback = `${baseUrl}/auth/signin?verified=true`;
      const verificationLink = `${url}${url.includes("?") ? "&" : "?"}callbackURL=${encodeURIComponent(signinCallback)}`;

      console.log(`📧 [BetterAuth Trigger] Sending verification email to ${user.email} with link ${verificationLink}`);

      try {
        await sendEmail({
          to: user.email,
          subject: "Verify your email address - OAGPT",
          html: `
            <!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Verify your email address</title>
              </head>
              <body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 520px; margin: 40px auto; background-color: #121212; border-radius: 16px; border: 1px solid #27272a; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
                  <!-- Header Logo -->
                  <tr>
                    <td style="padding: 32px 32px 24px 32px; border-bottom: 1px solid #27272a; text-align: center;">
                      <span style="font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px; display: inline-flex; items-center: center;">
                        OAGPT
                      </span>
                    </td>
                  </tr>
                  <!-- Content Body -->
                  <tr>
                    <td style="padding: 36px 32px;">
                      <h1 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600; color: #ffffff; line-height: 28px; text-align: center;">
                        Verify your email address
                      </h1>
                      <p style="margin: 0 0 24px 0; font-size: 14px; color: #a1a1aa; line-height: 22px; text-align: center;">
                        Welcome to OAGPT, <strong style="color: #ffffff;">${user.name || "there"}</strong>! Please confirm your email address to activate your account and log in.
                      </p>
                      <!-- Call To Action Button -->
                      <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 32px auto;">
                        <tr>
                          <td align="center" style="border-radius: 10px; background-color: #ffffff;">
                            <a href="${verificationLink}" target="_blank" style="background-color: #ffffff; color: #000000; padding: 14px 32px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 10px; display: inline-block; letter-spacing: -0.2px;">
                              Verify Email &amp; Sign In →
                            </a>
                          </td>
                        </tr>
                      </table>
                      <p style="margin: 24px 0 0 0; font-size: 13px; color: #71717a; line-height: 20px; text-align: center;">
                        Once verified, you will be redirected to log in with your email and password.
                      </p>
                      <hr style="margin: 32px 0 24px 0; border: none; border-top: 1px solid #27272a;" />
                      <p style="margin: 0; font-size: 12px; color: #71717a; line-height: 18px; word-break: break-all;">
                        If the button above does not work, copy and paste this URL into your browser:<br />
                        <a href="${verificationLink}" style="color: #3b82f6; text-decoration: underline;">${verificationLink}</a>
                      </p>
                    </td>
                  </tr>
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 20px 32px; background-color: #09090b; border-top: 1px solid #18181b; text-align: center;">
                      <p style="margin: 0; font-size: 12px; color: #52525b;">
                        &copy; ${new Date().getFullYear()} OAGPT. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </body>
            </html>
          `,
        });
      } catch (err) {
        console.error("Failed to dispatch verification email:", err);
      }
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
