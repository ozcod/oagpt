import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db/index"; // your drizzle instance
import { schema } from "@/db/schema/auth-schema";

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
