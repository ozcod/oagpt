import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const requireEmailVerification = process.env.REQUIRE_EMAIL_VERIFICATION !== "false";

  if (session) {
    // Only redirect to home if user's email is verified (or verification is disabled)
    if (!requireEmailVerification || session.user.emailVerified) {
      redirect("/");
    }
  }

  return <>{children}</>;
}
