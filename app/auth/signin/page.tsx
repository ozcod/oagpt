"use client";

import * as z from "zod";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { Loader2, ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldError, FieldGroup } from "@/components/ui/field";
import { GithubIcon, GoogleIcon } from "../icons";

const formSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email address is required")
    .email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type SocialProvider = "google" | "github";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pendingProvider, setPendingProvider] = useState<SocialProvider | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (session) {
      if (session.user.emailVerified) {
        router.push("/chat");
      } else {
        router.push(`/auth/verify-email?email=${encodeURIComponent(session.user.email)}`);
      }
    }
  }, [session, router]);

  useEffect(() => {
    if (searchParams.get("verified") === "true") {
      toast.success("Email verified successfully! Please sign in to continue.");
    }
  }, [searchParams]);

  const handleSocialSignIn = async (provider: SocialProvider) => {
    try {
      await authClient.signIn.social({
        provider: provider,
        callbackURL: "/chat",
      });
    } catch {
      toast.error(`Sign in with ${provider} failed!`);
    }
  };

  const queryEmail = searchParams.get("email") || "";

  const form = useForm({
    defaultValues: { email: queryEmail, password: "" },
    validators: {
      onChange: formSchema,
    },
    onSubmit: async ({ value }) => {
      const cleanEmail = value.email.trim().toLowerCase();
      const cleanPassword = value.password;

      setIsLoading(true);
      try {
        await authClient.signIn.email(
          {
            email: cleanEmail,
            password: cleanPassword,
            callbackURL: "/chat",
          },
          {
            onRequest: () => setIsLoading(true),
            onSuccess: () => {
              setIsLoading(false);
              toast.success("Signed in successfully!");
              router.push("/chat");
              router.refresh();
            },
            onError: (ctx) => {
              setIsLoading(false);
              const errMsg = ctx.error.message || "Sign in failed. Invalid email or password.";
              if (
                errMsg.toLowerCase().includes("verify") ||
                errMsg.toLowerCase().includes("email not verified")
              ) {
                toast.error("Please verify your email before signing in.");
                router.push(`/auth/verify-email?email=${encodeURIComponent(cleanEmail)}`);
              } else {
                toast.error(errMsg);
              }
            },
          },
        );
      } catch (err: unknown) {
        setIsLoading(false);
        const msg = err instanceof Error ? err.message : "An unexpected error occurred during sign in.";
        toast.error(msg);
      }
    },
  });

  return (
    <div className="relative min-h-screen bg-[#141414] text-[#ececec] flex flex-col justify-between p-4 sm:p-6 antialiased font-sans">
      {/* Ambient background glow matching homepage */}
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

      {/* Main Form Card */}
      <main className="flex items-center justify-center my-auto py-8">
        <div className="w-full max-w-sm rounded-2xl border border-white/[0.08] bg-[#1a1a1a]/95 p-6 sm:p-8 shadow-2xl shadow-black/50 backdrop-blur-xl">
          {/* Card Header */}
          <div className="text-center mb-6">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
              Welcome back
            </h1>
            <p className="mt-1.5 text-xs text-zinc-400">
              Log in to OAGPT to continue your conversations.
            </p>
          </div>

          {/* Social Logins */}
          <div className="flex flex-col gap-2.5">
            <Button
              variant="outline"
              className="h-10 w-full rounded-xl border-white/[0.08] bg-white/[0.03] text-xs font-medium text-white transition-all hover:bg-white/[0.06] hover:border-white/15"
              onClick={() => {
                setPendingProvider("google");
                handleSocialSignIn("google");
              }}
            >
              {pendingProvider === "google" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-zinc-400" />
              ) : (
                <GoogleIcon className="mr-2 h-4 w-4" />
              )}
              Continue with Google
            </Button>

            <Button
              variant="outline"
              className="h-10 w-full rounded-xl border-white/[0.08] bg-white/[0.03] text-xs font-medium text-white transition-all hover:bg-white/[0.06] hover:border-white/15"
              onClick={() => {
                setPendingProvider("github");
                handleSocialSignIn("github");
              }}
            >
              {pendingProvider === "github" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-zinc-400" />
              ) : (
                <GithubIcon className="mr-2 h-4 w-4" />
              )}
              Continue with GitHub
            </Button>
          </div>

          {/* Divider */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="absolute w-full border-t border-white/[0.06]"></div>
            <span className="relative bg-[#1a1a1a] px-3 text-[10px] font-mono uppercase tracking-widest text-zinc-500">
              or
            </span>
          </div>

          {/* Email / Password Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <FieldGroup className="flex flex-col gap-1">
              {/* Email Field */}
              <form.Field name="email">
                {(field) => {
                  const hasError =
                    field.state.meta.isTouched && field.state.meta.errors.length > 0;
                  return (
                    <div className="flex flex-col">
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        type="email"
                        placeholder="Email address"
                        className={cn(
                          "h-10 rounded-xl border-white/[0.08] bg-[#121212] px-3.5 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 transition-colors focus:border-white/20 focus:ring-0",
                          hasError && "border-red-500/80 focus:border-red-500",
                        )}
                      />
                      <div className="min-h-5 px-1 py-0.5">
                        {hasError && (
                          <FieldError
                            className="text-[11px] text-red-400"
                            errors={field.state.meta.errors}
                          />
                        )}
                      </div>
                    </div>
                  );
                }}
              </form.Field>

              {/* Password Field */}
              <form.Field name="password">
                {(field) => {
                  const hasError =
                    field.state.meta.isTouched && field.state.meta.errors.length > 0;
                  return (
                    <div className="flex flex-col">
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        type="password"
                        placeholder="Password"
                        className={cn(
                          "h-10 rounded-xl border-white/[0.08] bg-[#121212] px-3.5 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 transition-colors focus:border-white/20 focus:ring-0",
                          hasError && "border-red-500/80 focus:border-red-500",
                        )}
                      />
                      <div className="min-h-5 px-1 py-0.5">
                        {hasError && (
                          <FieldError
                            className="text-[11px] text-red-400"
                            errors={field.state.meta.errors}
                          />
                        )}
                      </div>
                    </div>
                  );
                }}
              </form.Field>

              {/* Submit Button */}
              <form.Subscribe
                selector={(state) => [
                  state.canSubmit,
                  state.isSubmitting,
                  state.isDirty,
                ]}
              >
                {([canSubmit, isSubmitting, isDirty]) => (
                  <Button
                    type="submit"
                    className="mt-1 h-10 w-full rounded-full bg-white text-xs sm:text-sm font-semibold text-black hover:bg-zinc-200 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                    disabled={!canSubmit || !isDirty || isSubmitting || isLoading}
                  >
                    {isSubmitting || isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-black" />
                    ) : (
                      <span className="flex items-center justify-center gap-1">
                        <span>Continue</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </Button>
                )}
              </form.Subscribe>
            </FieldGroup>
          </form>

          {/* Footer toggle */}
          <div className="mt-6 pt-5 border-t border-white/[0.06] text-center text-xs text-zinc-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/signup"
              className="text-white hover:underline underline-offset-4 transition-colors font-medium"
            >
              Sign up
            </Link>
          </div>
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
