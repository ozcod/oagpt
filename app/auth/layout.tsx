import { redirect } from "next/dist/client/components/navigation";
import { headers } from "next/dist/server/request/headers";
import { auth } from "@/lib/auth";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session) {
    redirect("/");
  }

  return <>{children}</>;
}
