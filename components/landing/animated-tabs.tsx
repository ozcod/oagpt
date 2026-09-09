"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Cpu,
  ImageIcon,
  Code2,
  Search,
  ArrowRight,
  Sparkles,
  Bot,
  Copy,
  Check,
  Command,
} from "lucide-react";

interface TabItem {
  id: string;
  label: string;
  category: string;
  icon: typeof Cpu;
  title: string;
  description: string;
  bullets: string[];
  ctaLabel: string;
  ctaHref: string;
}

const TABS: TabItem[] = [
  {
    id: "engines",
    label: "Frontier Engines",
    category: "MULTI-MODEL ORCHESTRATION",
    icon: Cpu,
    title: "Switch engines mid-thought. Zero context loss.",
    description:
      "Never re-explain your problem between separate apps. Change models on any prompt in the same thread: design architecture with Claude, solve rigorous proofs with DeepSeek, and draft tests with Gemini.",
    bullets: [
      "DeepSeek R1 for deep mathematical logic & competitive coding",
      "Gemini 2.5 Flash for ultra-fast 1M token throughput",
      "GPT-4o & Claude 3.5 Sonnet for nuanced synthesis",
    ],
    ctaLabel: "Open Chat Workspace",
    ctaHref: "/chat",
  },
  {
    id: "studio",
    label: "FLUX 1 Studio",
    category: "CREATIVE DIFFUSION",
    icon: ImageIcon,
    title: "From text prompt to 1024x1024 photorealism in seconds.",
    description:
      "A dedicated generative studio built right into your workflow at /images. Powered by FLUX 1 Schnell 12B diffusion transformer with instant parameter control, seed locking, and downloads.",
    bullets: [
      "1024x1024 high-resolution generation in under 3 seconds",
      "High prompt fidelity with complex lighting and typography",
      "Integrated directly without third-party subscriptions",
    ],
    ctaLabel: "Launch Image Studio",
    ctaHref: "/images",
  },
  {
    id: "code",
    label: "Developer Canvas",
    category: "SYNTAX & MATHEMATICS",
    icon: Code2,
    title: "Shiki syntax highlighting, KaTeX proofs, and clean exports.",
    description:
      "Engineered for deep work. Formatted code blocks with auto-detected languages, one-click copy, and full mathematical typesetting for theorems, equations, and algorithmic analysis.",
    bullets: [
      "Full Shiki syntax parsing across TypeScript, Python, Rust, SQL",
      "LaTeX mathematical equations rendered with KaTeX",
      "Export entire conversations to clean Markdown or JSON",
    ],
    ctaLabel: "Try Code Assistant",
    ctaHref: "/chat",
  },
  {
    id: "search",
    label: "Instant Search",
    category: "WORKSPACE PRODUCTIVITY",
    icon: Search,
    title: "Locate any past discussion or snippet in milliseconds.",
    description:
      "Instant client-indexed and database-backed search across your entire conversation history. Jump back into any previous proof, code snippet, or prompt with keyboard-first navigation.",
    bullets: [
      "Quick-launch command palette via ⌘ / Ctrl + K",
      "Sub-millisecond query filtering across all thread messages",
      "Persistent thread storage with PostgreSQL and Better Auth",
    ],
    ctaLabel: "Search Conversations",
    ctaHref: "/chat",
  },
];

const DURATION = 5000; // 5 seconds per tab
const INTERVAL = 50; // 50ms tick

export function AnimatedTabs() {
  const [activeTab, setActiveTab] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveTab((cur) => (cur + 1) % TABS.length);
          return 0;
        }
        return prev + (INTERVAL / DURATION) * 100;
      });
    }, INTERVAL);

    return () => clearInterval(timer);
  }, [isPaused]);

  const handleTabClick = (index: number) => {
    setActiveTab(index);
    setProgress(0);
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const current = TABS[activeTab];

  return (
    <section
      className="py-20 border-t border-white/[0.06] bg-[#141414]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section Title */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-500 mb-2">
              <Sparkles className="h-3.5 w-3.5 text-zinc-400" />
              <span>CAPABILITIES AT A GLANCE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
              Designed around your flow.
            </h2>
          </div>
          <span className="text-xs font-mono text-zinc-500">
            {isPaused ? "Paused on hover" : "Auto-playing showcase"}
          </span>
        </div>

        {/* Tab Navigation Buttons with Animated Progress Bars */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 border-b border-white/[0.06] pb-4">
          {TABS.map((tab, idx) => {
            const isActive = activeTab === idx;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(idx)}
                className={`group relative text-left p-3.5 rounded-xl transition-all ${
                  isActive ? "bg-white/[0.04]" : "hover:bg-white/[0.02]"
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Icon
                    className={`h-4 w-4 ${
                      isActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-400"
                    }`}
                  />
                  <span
                    className={`text-xs font-medium ${
                      isActive ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"
                    }`}
                  >
                    {tab.label}
                  </span>
                </div>

                {/* Progress bar line */}
                <div className="h-0.5 w-full bg-white/[0.06] rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-white transition-all duration-75 ease-linear rounded-full"
                    style={{
                      width: isActive ? `${progress}%` : "0%",
                    }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Dynamic Tab Content Area */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[420px]">
          {/* Left Column: Narrative */}
          <div className="lg:col-span-5 space-y-4">
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
              {current.category}
            </span>

            <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-white leading-snug">
              {current.title}
            </h3>

            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              {current.description}
            </p>

            <ul className="space-y-2 pt-2 text-xs text-zinc-300">
              {current.bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-white/40 mt-1.5 shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <div className="pt-3">
              <Link
                href={current.ctaHref}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-white hover:text-zinc-300 transition-colors"
              >
                <span>{current.ctaLabel}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Right Column: Tailored Visual Card */}
          <div className="lg:col-span-7 rounded-2xl border border-white/[0.08] bg-[#181818] p-5 sm:p-6 shadow-xl shadow-black/40">
            {/* Visual 0: Multi-Model Switcher simulation */}
            {activeTab === 0 && (
              <div className="space-y-3 font-sans">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] text-xs font-mono text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <Bot className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Single Thread • Model Handoff</span>
                  </div>
                  <span className="text-zinc-500">Thread #394</span>
                </div>

                <div className="space-y-2.5">
                  <div className="rounded-xl bg-[#202020] p-3 text-xs text-zinc-300">
                    <div className="flex items-center justify-between font-mono text-[10px] text-zinc-500 mb-1">
                      <span className="text-purple-300">Claude 3.5 Sonnet</span>
                      <span>Turn 1</span>
                    </div>
                    &ldquo;Recommended system topology: WebSocket ingress + Redis pub/sub queue with worker pools.&rdquo;
                  </div>

                  <div className="rounded-xl bg-[#1e1c22] border-l-2 border-purple-500/60 p-3 text-xs text-zinc-300">
                    <div className="flex items-center justify-between font-mono text-[10px] text-zinc-500 mb-1">
                      <span className="text-purple-300 font-medium">DeepSeek R1 • Reasoning</span>
                      <span>Turn 2</span>
                    </div>
                    &ldquo;Under 10k req/s load, maximum thread queue saturation holds at latency &le; 18ms.&rdquo;
                  </div>

                  <div className="rounded-xl bg-[#1b2024] border-l-2 border-blue-500/60 p-3 text-xs text-zinc-300">
                    <div className="flex items-center justify-between font-mono text-[10px] text-zinc-500 mb-1">
                      <span className="text-blue-300 font-medium">Gemini 2.5 Flash • Streaming</span>
                      <span>Turn 3</span>
                    </div>
                    &ldquo;Vitest test benchmark suite generated and validated in 240ms.&rdquo;
                  </div>
                </div>
              </div>
            )}

            {/* Visual 1: FLUX 1 Schnell Studio card */}
            {activeTab === 1 && (
              <div className="space-y-4 font-sans">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] text-xs font-mono text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <ImageIcon className="h-3.5 w-3.5 text-pink-400" />
                    <span>FLUX.1-schnell Studio</span>
                  </div>
                  <span className="text-emerald-400 text-[11px]">Generation &lt; 2.1s</span>
                </div>

                <div className="rounded-xl bg-[#201d24] border border-white/[0.06] p-4 space-y-3">
                  <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
                    Input Prompt:
                  </div>
                  <p className="text-xs text-zinc-200 leading-relaxed font-sans">
                    &ldquo;Cinematic isometric view of a minimalist cybernetic workspace on Mars, neon cyan wiring,
                    soft natural dusk backlight, 8k resolution.&rdquo;
                  </p>

                  <div className="pt-2 border-t border-white/[0.04] grid grid-cols-3 gap-2 text-center text-[11px] font-mono text-zinc-400">
                    <div className="rounded bg-black/30 p-1.5">
                      <span className="text-zinc-500 block text-[9px]">SIZE</span>
                      1024 &times; 1024
                    </div>
                    <div className="rounded bg-black/30 p-1.5">
                      <span className="text-zinc-500 block text-[9px]">STEPS</span>
                      4 (Schnell)
                    </div>
                    <div className="rounded bg-black/30 p-1.5">
                      <span className="text-zinc-500 block text-[9px]">SEED</span>
                      4892019
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
                  <span className="text-[11px] font-mono text-zinc-500">
                    Available at /images
                  </span>
                  <Link
                    href="/images"
                    className="text-xs font-medium text-pink-400 hover:text-pink-300 flex items-center gap-1"
                  >
                    <span>Open studio canvas</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            )}

            {/* Visual 2: Developer Canvas (Shiki + KaTeX) */}
            {activeTab === 2 && (
              <div className="space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <Code2 className="h-3.5 w-3.5 text-blue-400" />
                    <span>streamdown-code.tsx</span>
                  </div>
                  <button
                    onClick={() =>
                      handleCopy(`export const calculateEntropy = (probs: number[]): number => {
  return -probs.reduce((sum, p) => (p > 0 ? sum + p * Math.log2(p) : sum), 0);
};`)
                    }
                    className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="rounded-xl bg-[#111111] p-4 text-zinc-300 leading-relaxed overflow-x-auto">
                  <pre>
                    <code>
                      <span className="text-purple-400">export const</span>{" "}
                      <span className="text-blue-400">calculateEntropy</span> = (
                      probs: <span className="text-emerald-300">number[]</span>
                      ): <span className="text-emerald-300">number</span> =&gt; &#123;
                      {"\n"}  <span className="text-purple-400">return</span> -probs.
                      <span className="text-blue-300">reduce</span>((sum, p) =&gt;{"\n"}
                      {"    "}p &gt; <span className="text-amber-300">0</span> ? sum +
                      p * <span className="text-emerald-300">Math</span>.
                      <span className="text-blue-300">log2</span>(p) : sum,{"\n"}
                      {"    "}<span className="text-amber-300">0</span>
                      {"\n"}  );{"\n"}&#125;;
                    </code>
                  </pre>
                </div>

                <div className="rounded-lg bg-[#202020] px-3.5 py-2 text-[11px] text-zinc-400 flex items-center justify-between font-sans">
                  <span>LaTeX Formulation:</span>
                  <span className="font-mono text-zinc-200">H(X) = -&sum; P(x) log₂ P(x)</span>
                </div>
              </div>
            )}

            {/* Visual 3: Instant ⌘K Search modal simulation */}
            {activeTab === 3 && (
              <div className="space-y-3 font-sans">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] text-xs font-mono text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <Command className="h-3.5 w-3.5 text-zinc-300" />
                    <span>Global Search Command Palette</span>
                  </div>
                  <span className="text-[11px] bg-white/10 px-1.5 py-0.5 rounded text-zinc-300">
                    ⌘K
                  </span>
                </div>

                {/* Simulated search bar */}
                <div className="rounded-xl border border-white/[0.08] bg-[#222222] px-3.5 py-2 flex items-center gap-2 text-xs text-zinc-200">
                  <Search className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                  <span className="font-medium text-white">rate limiter</span>
                  <span className="h-4 w-px bg-white/20 animate-pulse" />
                </div>

                {/* Matched results list */}
                <div className="space-y-1.5 pt-1">
                  <div className="rounded-lg bg-[#1f1f1f] p-2.5 border border-white/[0.04] text-xs">
                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 mb-0.5">
                      <span className="text-zinc-300 font-medium">Sliding Window Rate Limiter</span>
                      <span>DeepSeek R1 • 2d ago</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 truncate">
                      ...timestamps.filter(t =&gt; t &gt; windowStart); if (timestamps.length &gt;= limit)...
                    </p>
                  </div>

                  <div className="rounded-lg bg-[#1a1a1a] p-2.5 border border-white/[0.04] text-xs">
                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 mb-0.5">
                      <span className="text-zinc-300 font-medium">Token Bucket Algorithm</span>
                      <span>Claude 3.5 • 5d ago</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 truncate">
                      ...refillTokens(): capacity, refillRate, and burst tolerance calculation...
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
