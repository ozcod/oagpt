"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function PricingSection() {
  return (
    <section id="pricing" className="py-16 border-t border-white/[0.06] bg-[#151515]/40">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
              Straightforward pricing.
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-zinc-400">
              Start free. Upgrade when you need deep reasoning and image generation.
            </p>
          </div>
          <span className="text-xs font-mono text-zinc-500">
            Cancel anytime
          </span>
        </div>

        {/* Compact Two-Card Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Free Tier */}
          <div className="flex flex-col justify-between rounded-xl border border-white/[0.06] bg-[#181818] p-5 sm:p-6 transition-colors hover:border-white/10">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">Free</span>
                <span className="text-xl font-semibold text-white font-mono">€0</span>
              </div>
              <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                Gemini 2.5 Flash &amp; Llama 3.3 70B with persistent conversation history,
                instant search, and Markdown exports.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.04] flex items-center justify-between">
              <span className="text-[11px] font-mono text-zinc-500">
                No credit card required
              </span>
              <Link href="/auth/signup">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 rounded-lg border-white/10 bg-white/[0.04] text-xs font-medium text-white hover:bg-white/[0.08]"
                >
                  Start free
                </Button>
              </Link>
            </div>
          </div>

          {/* Plus Tier */}
          <div className="flex flex-col justify-between rounded-xl border border-white/20 bg-[#1c1c1c] p-5 sm:p-6 shadow-lg transition-colors hover:border-white/30">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">OAGPT Plus</span>
                  <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                    Pro
                  </span>
                </div>
                <div className="flex items-baseline gap-1 font-mono">
                  <span className="text-xl font-semibold text-white">€20</span>
                  <span className="text-xs text-zinc-500">/ mo</span>
                </div>
              </div>
              <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                Unrestricted access to DeepSeek R1 reasoning, OpenAI GPT-4o, Claude 3.5 Sonnet,
                and dedicated FLUX 1 Schnell image studio.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between">
              <span className="text-[11px] font-mono text-zinc-500">
                Priority GPU queue
              </span>
              <Link href="/upgrade">
                <Button
                  size="sm"
                  className="h-8 rounded-lg bg-white text-xs font-semibold text-black hover:bg-zinc-200 gap-1"
                >
                  <span>Upgrade to Plus</span>
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
