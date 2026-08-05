"use client";

import { useState } from "react";
import { Check, Sparkles, Zap, Shield, Crown, ArrowRight } from "lucide-react";
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
    }, 1200);
  };

  return (
    <div className="flex flex-col flex-1 h-full w-full overflow-y-auto p-4 md:p-6 max-w-5xl mx-auto text-[#ececec]">
      {/* Header */}
      <div className="flex flex-col items-center text-center gap-2">
        <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#373669]/60 text-purple-300 text-xs font-semibold border border-purple-500/30">
          <Crown className="h-3.5 w-3.5 text-amber-400" />
          OAGPT Plus
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
          Upgrade your intelligence
        </h1>
        <p className="text-[#a1a1a1] max-w-md text-xs md:text-sm">
          Get unlimited access to flagship AI models, faster response times, and exclusive developer features.
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center bg-[#252525] p-1 rounded-full border border-[#333] mt-2">
          <button
            onClick={() => setSelectedBilling("monthly")}
            className={`px-4 py-1 rounded-full text-xs font-medium transition-colors ${
              selectedBilling === "monthly"
                ? "bg-[#373669] text-white"
                : "text-[#888] hover:text-white"
            }`}
          >
            Monthly billing
          </button>
          <button
            onClick={() => setSelectedBilling("yearly")}
            className={`px-4 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
              selectedBilling === "yearly"
                ? "bg-[#373669] text-white"
                : "text-[#888] hover:text-white"
            }`}
          >
            Annual billing
            <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4 flex-1 items-center">
        {/* Free Plan */}
        <div className="bg-[#242424] rounded-2xl p-5 border border-[#333] flex flex-col justify-between h-full max-h-[380px]">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-white">Free Plan</h2>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#1c1c1c] text-[#888]">
                Current Plan
              </span>
            </div>
            <div className="flex items-baseline gap-1 mb-3">
              <span className="text-3xl font-bold text-white">$0</span>
              <span className="text-xs text-[#888]">/ month</span>
            </div>
            <p className="text-xs text-[#999] mb-4">
              Essential AI access for casual browsing and basic code assistance.
            </p>

            <ul className="space-y-2.5 text-xs text-[#ccc]">
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-green-400 shrink-0" />
                Access to standard models (Gemini Flash, GPT-4o Mini)
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-green-400 shrink-0" />
                Standard response speeds
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-green-400 shrink-0" />
                Local chat history & search
              </li>
            </ul>
          </div>

          <Button
            variant="outline"
            disabled
            className="w-full mt-4 border-[#3a3a3a] bg-[#1c1c1c] text-[#666] cursor-default h-9 text-xs"
          >
            Your Active Plan
          </Button>
        </div>

        {/* Plus Plan */}
        <div className="relative bg-gradient-to-b from-[#2a294d] to-[#1d1c36] rounded-2xl p-5 border-2 border-purple-500/50 flex flex-col justify-between shadow-2xl h-full max-h-[380px]">
          <div className="absolute -top-3 right-6 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
            Popular Choice
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                OAGPT Plus
              </h2>
            </div>
            <div className="flex items-baseline gap-1 mb-3">
              <span className="text-3xl font-bold text-white">
                {selectedBilling === "monthly" ? "$20" : "$16"}
              </span>
              <span className="text-xs text-purple-200">/ month</span>
            </div>
            <p className="text-xs text-purple-200/80 mb-4">
              Supercharge your workflow with flagship reasoning models and priority compute.
            </p>

            <ul className="space-y-2.5 text-xs text-white">
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <strong>Unlimited access</strong> to Gemini Pro, GPT-4o & Claude 3.5
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <strong>5x faster</strong> response speed & zero queue wait times
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                High-resolution AI Image Studio generation
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                Advanced code execution & repository analysis
              </li>
            </ul>
          </div>

          <Button
            onClick={handleUpgrade}
            disabled={isSubmitting || upgraded}
            className="w-full mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium h-9 text-xs rounded-xl transition-all shadow-lg"
          >
            {upgraded ? (
              <span className="flex items-center gap-2 text-amber-300">
                <Sparkles className="h-4 w-4" /> This feature will be available soon!
              </span>
            ) : isSubmitting ? (
              "Processing..."
            ) : (
              <span className="flex items-center justify-center gap-2">
                Upgrade to Plus <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-2">
        <div className="bg-[#242424] p-3 rounded-xl border border-[#333] flex items-center gap-3">
          <Zap className="h-5 w-5 text-amber-400 shrink-0" />
          <div>
            <div className="text-xs font-semibold text-white">Ultra-Fast Speeds</div>
            <div className="text-[10px] text-[#888]">Powered by dedicated GPU clusters</div>
          </div>
        </div>

        <div className="bg-[#242424] p-3 rounded-xl border border-[#333] flex items-center gap-3">
          <Shield className="h-5 w-5 text-blue-400 shrink-0" />
          <div>
            <div className="text-xs font-semibold text-white">Enterprise Security</div>
            <div className="text-[10px] text-[#888]">Data privacy & zero retention</div>
          </div>
        </div>

        <div className="bg-[#242424] p-3 rounded-xl border border-[#333] flex items-center gap-3">
          <Crown className="h-5 w-5 text-purple-400 shrink-0" />
          <div>
            <div className="text-xs font-semibold text-white">Priority Support</div>
            <div className="text-[10px] text-[#888]">Direct 24/7 developer assistance</div>
          </div>
        </div>
      </div>
    </div>
  );
}
