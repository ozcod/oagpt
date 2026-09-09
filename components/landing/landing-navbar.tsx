"use client";

import Link from "next/link";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function LandingNavbar() {
  const { data: session } = authClient.useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-[#141414]/80 backdrop-blur-xl transition-colors">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-85"
        >
          <Image
            src="/logo-white.png"
            alt="OAGPT"
            width={24}
            height={24}
            className="rounded object-contain"
            priority
          />
          <span className="text-sm font-semibold tracking-tight text-white">
            OAGPT
          </span>
        </Link>

        {/* Minimal Nav Links */}
        <nav className="hidden sm:flex items-center gap-6 text-xs font-medium text-zinc-400">
          <Link href="#features" className="hover:text-white transition-colors">
            Capabilities
          </Link>
          <Link href="#models" className="hover:text-white transition-colors">
            Models
          </Link>
          <Link href="/images" className="hover:text-white transition-colors">
            Studio
          </Link>
          <Link href="#pricing" className="hover:text-white transition-colors">
            Pricing
          </Link>
        </nav>

        {/* Auth CTA */}
        <div className="flex items-center gap-3">
          {session ? (
            <Link href="/chat">
              <Button
                size="sm"
                className="h-8 gap-1.5 rounded-full bg-white px-3.5 text-xs font-medium text-black hover:bg-zinc-200 transition-all"
              >
                <span>Open Chat</span>
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/signin">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 rounded-full px-3 text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/[0.06]"
                >
                  Sign in
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button
                  size="sm"
                  className="h-8 rounded-full bg-white px-3.5 text-xs font-medium text-black hover:bg-zinc-200 transition-all"
                >
                  Get started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
