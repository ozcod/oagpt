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
      const callbackUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.ai.ozairahmad.com";
      const verificationLink = `${url}${url.includes("?") ? "&" : "?"}callbackURL=${encodeURIComponent(callbackUrl)}`;

      console.log(`📧 [BetterAuth Trigger] Sending verification email to ${user.email} with link ${verificationLink}`);

      try {
        await sendEmail({
          to: user.email,
          subject: "Verify your email address for OAGPT",
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 560px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; border: 1px solid #e4e4e7; overflow: hidden;">
                  <tr>
                    <td style="padding: 32px 32px 24px 32px; border-bottom: 1px solid #f4f4f5;">
                      <span style="font-size: 20px; font-weight: 700; color: #18181b; letter-spacing: -0.5px;">OAGPT</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 32px;">
                      <h1 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #18181b; line-height: 24px;">
                        Verify your email address
                      </h1>
                      <p style="margin: 0 0 24px 0; font-size: 14px; color: #52525b; line-height: 22px;">
                        Hello ${user.name || "there"}, thank you for signing up for OAGPT. Please click the button below to confirm your email address and activate your account.
                      </p>
                      <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
                        <tr>
                          <td align="center">
                            <a href="${verificationLink}" target="_blank" style="background-color: #18181b; color: #ffffff; padding: 12px 24px; font-size: 14px; font-weight: 500; text-decoration: none; border-radius: 6px; display: inline-block;">
                              Confirm Email Address
                            </a>
                          </td>
                        </tr>
                      </table>
                      <p style="margin: 24px 0 0 0; font-size: 13px; color: #71717a; line-height: 20px;">
                        If you didn't create an account with OAGPT, you can safely ignore this email.
                      </p>
                      <hr style="margin: 32px 0 24px 0; border: none; border-top: 1px solid #e4e4e7;" />
                      <p style="margin: 0; font-size: 12px; color: #a1a1aa; line-height: 18px;">
                        If the button doesn't work, copy and paste this URL into your web browser:<br />
                        <a href="${verificationLink}" style="color: #2563eb; word-break: break-all;">${verificationLink}</a>
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
