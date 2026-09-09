"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowUp, Sparkles } from "lucide-react";

const QUICK_MODELS = [
  { id: "deepseek", name: "DeepSeek R1", badge: "Reasoning" },
  { id: "gemini", name: "Gemini 2.5", badge: "Speed" },
  { id: "claude", name: "Claude 3.5", badge: "Code" },
  { id: "gpt4o", name: "GPT-4o", badge: "General" },
  { id: "flux", name: "FLUX 1", badge: "Studio" },
];

const SUGGESTIONS = [
  { label: "Refactor API with Drizzle ORM", href: "/chat" },
  { label: "Analyze complexity bounds with DeepSeek", href: "/chat" },
  { label: "Render 1024x1024 concept art with FLUX", href: "/images" },
];

export function HeroSection() {
  const router = useRouter();
  const [selectedModel, setSelectedModel] = useState(QUICK_MODELS[0].id);
  const [promptText, setPromptText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/chat");
  };

  return (
    <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 overflow-hidden text-center">
      {/* Subtle neutral glow */}
      <div
        className="pointer-events-none absolute top-1/4 left-1/2 -z-10 h-64 w-[600px] -translate-x-1/2 rounded-full bg-white/[0.03] blur-3xl"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        {/* Abstracted Headline */}
        <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight text-white leading-[1.1]">
          Every model.
          <br />
          <span className="text-zinc-400 font-normal">
            One calm workspace.
          </span>
        </h1>

        {/* Concise Subline */}
        <p className="mt-4 text-base sm:text-lg text-zinc-400 max-w-md mx-auto leading-relaxed">
          Frontier reasoning, code synthesis, and image generation in a single, focused interface.
        </p>

        {/* Minimal CTAs */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href="/chat">
            <Button
              size="lg"
              className="h-10 rounded-full bg-white px-5 text-xs font-medium text-black hover:bg-zinc-200 transition-all gap-1.5 shadow-sm"
            >
              <span>Start chatting</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>

          <Link href="/images">
            <Button
              variant="ghost"
              size="lg"
              className="h-10 rounded-full px-4 text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/[0.06]"
            >
              Explore Studio →
            </Button>
          </Link>
        </div>

        {/* Abstracted Workspace Prompt Capsule */}
        <div className="mt-12 mx-auto max-w-2xl text-left">
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-white/[0.08] bg-[#1a1a1a]/95 p-4 sm:p-5 shadow-2xl shadow-black/50 transition-colors hover:border-white/15"
          >
            {/* Top Model Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-3 border-b border-white/[0.06] text-xs">
              <span className="text-[11px] font-mono text-zinc-500 mr-1 hidden sm:inline">
                Model:
              </span>
              {QUICK_MODELS.map((m) => {
                const isActive = selectedModel === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedModel(m.id)}
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs transition-all ${
                      isActive
                        ? "bg-white/10 text-white font-medium border border-white/20"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] border border-transparent"
                    }`}
                  >
                    <span>{m.name}</span>
                    <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">
                      {m.badge}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Prompt Input Row */}
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Ask anything, reason through code, or synthesize imagery..."
                className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 outline-none"
              />
              <button
                type="submit"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-black hover:bg-zinc-200 transition-transform active:scale-95"
                aria-label="Send prompt to chat"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Suggestions Strip */}
            <div className="mt-4 pt-3 border-t border-white/[0.04] flex flex-wrap items-center gap-2 text-[11px]">
              <span className="text-zinc-500 font-mono flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-zinc-400" />
                <span>Try:</span>
              </span>
              {SUGGESTIONS.map((s, i) => (
                <Link
                  key={i}
                  href={s.href}
                  className="rounded-md bg-white/[0.03] px-2 py-1 text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors truncate"
                >
                  {s.label}
                </Link>
              ))}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
