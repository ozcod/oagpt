"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Mail, RotateCw, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = authClient.useSession();
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (session?.user?.emailVerified) {
      router.push("/");
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
        callbackURL: "/",
      });
      toast.success("Verification email sent! Please check your inbox.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to resend verification email");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#181818] text-[#ececec] p-4">
      <div className="w-full max-w-md bg-[#212121] border border-[#333] rounded-2xl p-6 md:p-8 text-center shadow-xl">
        <div className="w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-5">
          <Mail className="w-7 h-7" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Check your inbox</h1>
        
        <p className="text-xs md:text-sm text-[#a1a1a1] mb-6 leading-relaxed">
          We sent a verification link to{" "}
          <span className="text-white font-medium">{displayEmail || "your email address"}</span>.
          Please click the link in the email to verify your account and start using OAGPT.
        </p>

        <form onSubmit={handleResend} className="flex flex-col gap-3">
          {!sessionEmail && (
            <Input
              type="email"
              placeholder="Enter your email address"
              value={inputEmail}
              onChange={(e) => setInputEmail(e.target.value)}
              className="bg-[#2a2a2a] border-[#383838] text-white text-xs h-10 rounded-xl"
            />
          )}

          <Button
            type="submit"
            disabled={isResending}
            className="w-full bg-white hover:bg-[#e0e0e0] text-black font-medium h-10 text-xs rounded-xl"
          >
            {isResending ? (
              <span className="flex items-center gap-2">
                <RotateCw className="w-3.5 h-3.5 animate-spin" /> Resending email...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Send className="w-3.5 h-3.5" /> Resend Verification Email
              </span>
            )}
          </Button>

          <Link href="/auth/signin">
            <Button
              type="button"
              variant="outline"
              className="w-full border-[#383838] bg-[#2a2a2a] text-[#aaa] hover:text-white hover:bg-[#333] h-10 text-xs rounded-xl"
            >
              Back to Sign In
            </Button>
          </Link>
        </form>
      </div>
    </div>
  );
}

