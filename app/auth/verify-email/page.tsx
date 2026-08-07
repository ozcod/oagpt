"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Mail, CheckCircle2, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";

export default function VerifyEmailPage() {
  const { data: session } = authClient.useSession();
  const [isResending, setIsResending] = useState(false);

  const userEmail = session?.user?.email;

  const handleResend = async () => {
    if (!userEmail) {
      toast.error("No user session found. Please sign in again.");
      return;
    }
    setIsResending(true);
    try {
      await authClient.sendVerificationEmail({
        email: userEmail,
        callbackURL: "/",
      });
      toast.success("Verification email resent! Please check your inbox.");
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

        <h1 className="text-2xl font-bold text-white mb-2">Verify your email</h1>
        
        <p className="text-xs md:text-sm text-[#a1a1a1] mb-6 leading-relaxed">
          We sent a verification link to{" "}
          <span className="text-white font-medium">{userEmail || "your email address"}</span>.
          Please click the link in the email to activate your account and start using OAGPT.
        </p>

        <div className="flex flex-col gap-3">
          <Button
            onClick={handleResend}
            disabled={isResending}
            className="w-full bg-white hover:bg-[#e0e0e0] text-black font-medium h-10 text-xs rounded-xl"
          >
            {isResending ? (
              <span className="flex items-center gap-2">
                <RotateCw className="w-3.5 h-3.5 animate-spin" /> Resending...
              </span>
            ) : (
              "Resend Verification Email"
            )}
          </Button>

          <Link href="/auth/signin">
            <Button
              variant="outline"
              className="w-full border-[#383838] bg-[#2a2a2a] text-[#aaa] hover:text-white hover:bg-[#333] h-10 text-xs rounded-xl"
            >
              Back to Sign In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
