"use client";

import * as z from "zod";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";

import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FieldError, FieldGroup } from "@/components/ui/field";

import { GithubIcon, GoogleIcon } from "../icons";

const signupSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username cannot exceed 30 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, hyphens, or underscores"),
  email: z
    .string()
    .trim()
    .min(1, "Email address is required")
    .email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long")
    .regex(/^(?=.*[A-Za-z])(?=.*\d)/, "Password must contain at least 1 letter and 1 number"),
});

type SocialProvider = "google" | "github";

export default function SignupForm() {
  const router = useRouter();
  const [pendingProvider, setPendingProvider] = useState<SocialProvider | null>(
    null,
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (session) {
      if (session.user.emailVerified) {
        router.push("/");
      } else {
        router.push(`/auth/verify-email?email=${encodeURIComponent(session.user.email)}`);
      }
    }
  }, [session, router]);

  const handleSocialSignIn = async (provider: SocialProvider) => {
    try {
      await authClient.signIn.social({
        provider: provider,
        callbackURL: "/",
      });
    } catch (err) {
      toast.error(`Sign in with ${provider} failed!`);
    }
  };

  const form = useForm({
    defaultValues: { username: "", email: "", password: "" },
    validators: {
      onChange: signupSchema,
    },
    onSubmit: async ({ value }) => {
      const cleanUsername = value.username.trim();
      const cleanEmail = value.email.trim().toLowerCase();
      const cleanPassword = value.password;

      setIsLoading(true);
      setUsernameError(null);
      setSuggestions([]);

      try {
        // Pre-check availability for existing email or username
        const checkRes = await fetch(
          `/api/auth/check-availability?email=${encodeURIComponent(cleanEmail)}&username=${encodeURIComponent(cleanUsername)}`
        );
        if (checkRes.ok) {
          const data = await checkRes.json();

          if (data.emailExists) {
            setIsLoading(false);
            toast.info("An account with this email address already exists. Redirecting to Sign In...");
            router.push(`/auth/signin?email=${encodeURIComponent(cleanEmail)}`);
            return;
          }

          if (data.usernameExists) {
            setIsLoading(false);
            setUsernameError(`Username "${cleanUsername}" is already taken.`);
            setSuggestions(data.suggestions || []);
            toast.error("Username is already taken. Please pick a suggested username.");
            return;
          }
        }

        await authClient.signUp.email(
          {
            name: cleanUsername,
            email: cleanEmail,
            password: cleanPassword,
            callbackURL: "/",
          },
          {
            onRequest: () => setIsLoading(true),
            onSuccess: () => {
              setIsLoading(false);
              toast.success("Account created! Please check your email to verify your account.");
              router.push(`/auth/verify-email?email=${encodeURIComponent(cleanEmail)}`);
            },
            onError: (ctx) => {
              setIsLoading(false);
              const msg = ctx.error.message || "Signup failed. Please check your details.";
              if (
                msg.toLowerCase().includes("email") &&
                (msg.toLowerCase().includes("exist") ||
                  msg.toLowerCase().includes("in use") ||
                  msg.toLowerCase().includes("registered"))
              ) {
                toast.info("An account with this email address already exists. Redirecting to Sign In...");
                router.push(`/auth/signin?email=${encodeURIComponent(cleanEmail)}`);
              } else {
                toast.error(msg);
              }
            },
          }
        );
      } catch (err: any) {
        setIsLoading(false);
        toast.error(err?.message || "An unexpected error occurred during signup.");
      }
    },
  });

  return (
    <div className="flex items-center justify-center h-dvh">
      <Card className="w-full max-w-110 border-[#262626] bg-[#121212] text-white">
        <CardHeader className="space-y-4 pt-4 text-center">
          <Image
            src={"/logo.png"}
            className="h-10 w-10 mx-auto"
            height={40}
            width={40}
            alt="OAGPT"
          />
          <CardTitle className="text-[32px] font-semibold tracking-tight text-[#ececec]">
            Create an account
          </CardTitle>
          <CardDescription className="mx-auto max-w-80 text-[15px] leading-relaxed text-[#b4b4b4]">
            Join OAGPT to get smarter responses and start building today.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-3 px-10">
          {/* Social Buttons */}
          <div className="flex flex-col gap-3">
            {/* Google Button */}
            <Button
              variant="outline"
              disabled={false}
              className="h-13 w-full rounded-xl border-[#424242] bg-transparent text-[15px] font-normal transition-colors hover:bg-[#2f2f2f] hover:text-white disabled:opacity-70"
              onClick={() => {
                setPendingProvider("google");
                handleSocialSignIn("google");
              }}
            >
              {pendingProvider === "google" ? (
                <Loader2 className="mr-2 size-5 animate-spin" />
              ) : (
                <GoogleIcon className="mr-2 size-5" />
              )}
              Continue with Google
            </Button>

            {/* GitHub Button */}
            <Button
              variant="outline"
              disabled={false}
              className="h-13 w-full rounded-xl border-[#424242] bg-transparent text-[15px] font-normal transition-colors hover:bg-[#2f2f2f] hover:text-white disabled:opacity-70"
              onClick={() => {
                setPendingProvider("github");
                handleSocialSignIn("github");
              }}
            >
              {pendingProvider === "github" ? (
                <Loader2 className="mr-2 size-5 animate-spin" />
              ) : (
                <GithubIcon className="mr-2 size-5" />
              )}
              Continue with GitHub
            </Button>
          </div>

          <div className="relative my-4 flex items-center justify-center">
            <div className="absolute w-full border-t border-[#333]"></div>
            <span className="relative bg-[#121212] px-3 text-[11px] font-medium uppercase tracking-widest text-[#888]">
              OR
            </span>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <FieldGroup className="flex flex-col gap-1">
              {/* Username Field */}
              <form.Field
                name="username"
                children={(field) => {
                  const hasError =
                    (field.state.meta.isTouched && field.state.meta.errors.length > 0) ||
                    !!usernameError;
                  return (
                    <div className="flex flex-col">
                      <Input
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => {
                          field.handleChange(e.target.value);
                          if (usernameError) setUsernameError(null);
                        }}
                        placeholder="Username"
                        className={cn(
                          "h-13 rounded-xl border-[#424242] bg-transparent px-4 text-base transition-colors focus:ring-0",
                          hasError
                            ? "border-red-500"
                            : "focus:border-[#676767]",
                        )}
                      />
                      <div className="min-h-5 px-1 py-0.5">
                        {field.state.meta.isTouched && field.state.meta.errors.length > 0 ? (
                          <FieldError
                            className="text-xs text-red-500 animate-in fade-in slide-in-from-top-1 duration-200"
                            errors={field.state.meta.errors}
                          />
                        ) : usernameError ? (
                          <span className="text-xs text-red-500 animate-in fade-in slide-in-from-top-1 duration-200">
                            {usernameError}
                          </span>
                        ) : null}
                      </div>

                      {suggestions.length > 0 && (
                        <div className="mb-2 flex flex-col gap-1.5 rounded-xl border border-[#333] bg-[#1a1a1a] p-3 text-xs">
                          <span className="font-medium text-[#a1a1a1]">Suggested usernames:</span>
                          <div className="flex flex-wrap gap-2">
                            {suggestions.map((sug) => (
                              <button
                                key={sug}
                                type="button"
                                onClick={() => {
                                  field.handleChange(sug);
                                  setUsernameError(null);
                                  setSuggestions([]);
                                }}
                                className="rounded-lg border border-[#424242] bg-[#262626] px-2.5 py-1 text-xs font-medium text-white transition-colors hover:border-blue-500 hover:bg-blue-600/20 hover:text-blue-400"
                              >
                                {sug}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }}
              />

              {/* Email Field */}
              <form.Field
                name="email"
                children={(field) => {
                  const hasError =
                    field.state.meta.isTouched &&
                    field.state.meta.errors.length > 0;
                  return (
                    <div className="flex flex-col">
                      <Input
                        type="email"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Email address"
                        className={cn(
                          "h-13 rounded-xl border-[#424242] bg-transparent px-4 text-base transition-colors focus:ring-0",
                          hasError
                            ? "border-red-500"
                            : "focus:border-[#676767]",
                        )}
                      />
                      <div className="min-h-5 px-1 py-0.5">
                        {hasError && (
                          <FieldError
                            className="text-xs text-red-500 animate-in fade-in slide-in-from-top-1 duration-200"
                            errors={field.state.meta.errors}
                          />
                        )}
                      </div>
                    </div>
                  );
                }}
              />

              {/* Password Field */}
              <form.Field
                name="password"
                children={(field) => {
                  const hasError =
                    field.state.meta.isTouched &&
                    field.state.meta.errors.length > 0;
                  return (
                    <div className="flex flex-col">
                      <Input
                        type="password"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Password"
                        className={cn(
                          "h-13 rounded-xl border-[#424242] bg-transparent px-4 text-base transition-colors focus:ring-0",
                          hasError
                            ? "border-red-500"
                            : "focus:border-[#676767]",
                        )}
                      />
                      <div className="min-h-5 px-1 py-0.5">
                        {hasError && (
                          <FieldError
                            className="text-xs text-red-500 animate-in fade-in slide-in-from-top-1 duration-200"
                            errors={field.state.meta.errors}
                          />
                        )}
                      </div>
                    </div>
                  );
                }}
              />

              <form.Subscribe
                selector={(state) => [
                  state.canSubmit,
                  state.isSubmitting,
                  state.isDirty,
                ]}
                children={([canSubmit, isSubmitting, isDirty]) => (
                  <Button
                    type="submit"
                    className="mt-2 h-13 w-full rounded-full bg-[#ececec] text-[16px] font-semibold text-black hover:bg-white disabled:opacity-50"
                    disabled={!canSubmit || !isDirty}
                  >
                    {isSubmitting || isLoading ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : (
                      "Sign Up"
                    )}
                  </Button>
                )}
              />
            </FieldGroup>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col items-center pb-6">
          <div className="text-sm text-[#b4b4b4]">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-white hover:underline">
              Sign In
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

// Icons (GoogleIcon, etc.) should remain as they were in the login file...
