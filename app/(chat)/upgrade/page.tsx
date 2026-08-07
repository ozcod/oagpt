"use client";

import { useState } from "react";
import { Check, ArrowRight, Zap, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UpgradePage() {
  const [selectedBilling, setSelectedBilling] = useState<"monthly" | "yearly">("monthly");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [upgraded, setUpgraded] = useState(false);

  const handleUpgrade = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setUpgraded(true);
    }, 1000);
  };

  return (
    <div className="flex flex-col flex-1 h-full w-full overflow-y-auto p-4 md:p-8 max-w-4xl mx-auto text-[#ececec]">
      {/* Header */}
      <div className="flex flex-col items-center text-center gap-2 mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
          Plans & Pricing
        </h1>
        <p className="text-[#9e9e9e] max-w-md text-xs md:text-sm">
          Select a plan to access flagship reasoning models and priority compute.
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center bg-[#282828] p-1 rounded-lg border border-[#383838] mt-4">
          <button
            onClick={() => setSelectedBilling("monthly")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              selectedBilling === "monthly"
                ? "bg-[#383838] text-white"
                : "text-[#888] hover:text-white"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setSelectedBilling("yearly")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
              selectedBilling === "yearly"
                ? "bg-[#383838] text-white"
                : "text-[#888] hover:text-white"
            }`}
          >
            Annual
            <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded font-mono">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        {/* Free Plan */}
        <div className="bg-[#242424] rounded-xl p-6 border border-[#333] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-medium text-white">Free</h2>
              <span className="text-[11px] px-2 py-0.5 rounded bg-[#2e2e2e] text-[#888] border border-[#383838]">
                Current
              </span>
            </div>
            <div className="flex items-baseline gap-1 mb-3">
              <span className="text-3xl font-bold text-white">$0</span>
              <span className="text-xs text-[#888]">/ month</span>
            </div>
            <p className="text-xs text-[#9e9e9e] mb-6">
              For casual browsing, quick questions, and standard tasks.
            </p>

            <div className="text-xs font-medium text-[#888] mb-3 uppercase tracking-wider">
              Included Models:
            </div>
            <ul className="space-y-2.5 text-xs text-[#ccc]">
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                Gemini 2.5 Flash & 2.0 Flash Lite
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                GPT-4o Mini
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                DeepSeek R1
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                Llama 3.3 70B
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                Standard response speed
              </li>
            </ul>
          </div>

          <Button
            variant="outline"
            disabled
            className="w-full mt-6 border-[#383838] bg-[#2a2a2a] text-[#777] cursor-default h-9 text-xs"
          >
            Your Active Plan
          </Button>
        </div>

        {/* Pro Plan */}
        <div className="bg-[#262626] rounded-xl p-6 border border-[#444] flex flex-col justify-between relative shadow-lg">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-medium text-white flex items-center gap-2">
                OAGPT Pro
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase font-semibold">
                Pro
              </span>
            </div>
            <div className="flex items-baseline gap-1 mb-3">
              <span className="text-3xl font-bold text-white">
                {selectedBilling === "monthly" ? "$20" : "$16"}
              </span>
              <span className="text-xs text-[#888]">/ month</span>
            </div>
            <p className="text-xs text-[#9e9e9e] mb-6">
              Full access to flagship frontier models and high-priority compute.
            </p>

            <div className="text-xs font-medium text-[#888] mb-3 uppercase tracking-wider">
              Everything in Free, plus:
            </div>
            <ul className="space-y-2.5 text-xs text-[#ccc]">
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span><strong>Gemini 2.5 Pro</strong> (Google)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span><strong>GPT-4o</strong> (OpenAI)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span><strong>Claude 3.5 Sonnet</strong> (Anthropic)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                Higher rate limits & priority execution
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                High-resolution FLUX image generation
              </li>
            </ul>
          </div>

          <Button
            onClick={handleUpgrade}
            disabled={isSubmitting || upgraded}
            className="w-full mt-6 bg-white hover:bg-[#e0e0e0] text-black font-medium h-9 text-xs rounded-lg transition-all"
          >
            {upgraded ? (
              <span className="flex items-center gap-2 text-neutral-800">
                <Sparkles className="h-3.5 w-3.5 text-amber-600" /> Payment integration coming soon
              </span>
            ) : isSubmitting ? (
              "Processing..."
            ) : (
              <span className="flex items-center justify-center gap-1.5">
                Upgrade to Pro <ArrowRight className="h-3.5 w-3.5" />
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Subtle feature guarantees */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[#333] pt-6">
        <div className="flex items-start gap-3">
          <Zap className="h-4 w-4 text-[#888] shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-medium text-white">Priority Compute</div>
            <div className="text-[11px] text-[#888]">Instant queue bypass for Pro requests during peak hours.</div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Shield className="h-4 w-4 text-[#888] shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-medium text-white">Data Privacy</div>
            <div className="text-[11px] text-[#888]">Your inputs are never used to train public AI models.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

