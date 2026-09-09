"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Mail, RotateCw, Send, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = authClient.useSession();
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (session?.user?.emailVerified) {
      router.push("/chat");
    }
  }, [session, router]);

  const queryEmail = searchParams.get("email") || "";
  const sessionEmail = session?.user?.email || "";

  const [inputEmail, setInputEmail] = useState(queryEmail || sessionEmail);

  const displayEmail = sessionEmail || inputEmail || queryEmail;

  const handleResend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const targetEmail = inputEmail || sessionEmail || queryEmail;

    if (!targetEmail) {
      toast.error("Please enter your email address to resend.");
      return;
    }

    setIsResending(true);
    try {
      await authClient.sendVerificationEmail({
        email: targetEmail,
        callbackURL: "/chat",
      });
      toast.success("Verification email sent! Please check your inbox.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to resend verification email";
      toast.error(msg);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#141414] text-[#ececec] flex flex-col justify-between p-4 sm:p-6 antialiased font-sans">
      {/* Background neutral glow */}
      <div
        className="pointer-events-none absolute top-1/3 left-1/2 -z-10 h-64 w-[500px] -translate-x-1/2 rounded-full bg-white/[0.03] blur-3xl"
        aria-hidden="true"
      />

      {/* Top minimal header */}
      <header className="mx-auto w-full max-w-5xl flex items-center justify-between py-2">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-zinc-400 hover:text-white transition-colors"
        >
          <Image
            src="/logo-white.png"
            alt="OAGPT"
            width={22}
            height={22}
            className="rounded opacity-90"
          />
          <span className="text-sm font-semibold tracking-tight text-white">
            OAGPT
          </span>
        </Link>

        <Link
          href="/"
          className="text-xs font-medium text-zinc-400 hover:text-white transition-colors"
        >
          Back to home
        </Link>
      </header>

      {/* Main Card */}
      <main className="flex items-center justify-center my-auto py-8">
        <div className="w-full max-w-sm rounded-2xl border border-white/[0.08] bg-[#1a1a1a]/95 p-6 sm:p-8 text-center shadow-2xl shadow-black/50 backdrop-blur-xl">
          <div className="w-12 h-12 rounded-full bg-white/[0.05] border border-white/10 text-white flex items-center justify-center mx-auto mb-4">
            <Mail className="w-5 h-5 text-zinc-200" />
          </div>

          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white mb-2">
            Check your inbox
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 mb-6 leading-relaxed">
            We sent a verification link to{" "}
            <span className="text-white font-medium">{displayEmail || "your email"}</span>.
            Click the link in the email to activate your account.
          </p>

          <form onSubmit={handleResend} className="flex flex-col gap-2.5">
            {!sessionEmail && (
              <Input
                type="email"
                placeholder="Enter your email address"
                value={inputEmail}
                onChange={(e) => setInputEmail(e.target.value)}
                className="h-10 rounded-xl border-white/[0.08] bg-[#121212] px-3.5 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-white/20 focus:ring-0"
              />
            )}

            <Button
              type="submit"
              disabled={isResending}
              className="h-10 w-full rounded-full bg-white text-xs sm:text-sm font-semibold text-black hover:bg-zinc-200 transition-all active:scale-[0.98] disabled:opacity-40"
            >
              {isResending ? (
                <span className="flex items-center gap-2">
                  <RotateCw className="w-3.5 h-3.5 animate-spin" /> Sending...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1.5">
                  <Send className="w-3.5 h-3.5" /> Resend Verification Email
                </span>
              )}
            </Button>

            <Link href="/auth/signin" className="w-full block mt-1">
              <Button
                type="button"
                variant="outline"
                className="h-10 w-full rounded-full border-white/[0.08] bg-white/[0.02] text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.06] hover:border-white/15"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                Back to Sign in
              </Button>
            </Link>
          </form>
        </div>
      </main>

      {/* Bottom attribution */}
      <footer className="mx-auto w-full max-w-5xl py-2 text-center text-[11px] text-zinc-500">
        &copy; {new Date().getFullYear()} OAGPT. A project by{" "}
        <a
          href="https://ozairahmad.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-400 hover:text-white transition-colors"
        >
          ozairahmad.com
        </a>
      </footer>
    </div>
  );
}
