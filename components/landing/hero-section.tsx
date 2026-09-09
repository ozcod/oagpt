"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Loader2,
  Copy,
  Check,
  RotateCcw,
  Lock,
  Info,
  Square,
  X,
} from "lucide-react";
import {
  ChatMessage,
  GUEST_MAX_CREDITS,
  getGuestMessages,
  getGuestRemainingCredits,
  getOrCreateGuestId,
  incrementGuestCredits,
  saveGuestMessages,
  clearGuestMessages,
} from "@/lib/chat-storage";
import { toast } from "sonner";
import { MessageResponse } from "@/components/ai-elements/message";

const QUICK_MODELS = [
  { id: "deepseek-r1-free", name: "DeepSeek R1", badge: "Reasoning", isPaid: false },
  { id: "gemini-2.5-flash", name: "Gemini 2.5", badge: "Speed", isPaid: false },
  { id: "llama-3-3-70b-free", name: "Llama 3.3", badge: "Plus", isPaid: true },
  { id: "claude-3-5-sonnet", name: "Claude 3.5", badge: "Plus", isPaid: true },
  { id: "gpt-4o", name: "GPT-4o", badge: "Plus", isPaid: true },
];

const SUGGESTIONS = [
  "Explain quantum computing in one analogy",
  "Write an optimized TypeScript debounce utility",
  "Compare PostgreSQL vs Redis for sessions",
];

const PLAYFUL_THOUGHTS: Record<string, string[]> = {
  "deepseek-r1-free": [
    "Untangling recursive proof trees...",
    "Traversing latent logic branches...",
    "Consulting mathematical axioms...",
    "Verifying boundary constraints...",
    "Formulating the solution...",
  ],
  "gemini-2.5-flash": [
    "Warming up neural tensor cores...",
    "Scanning 1M token context horizon...",
    "Connecting cognitive synapses...",
    "Brewing a rapid response...",
    "Polishing the final insight...",
  ],
  default: [
    "Thinking through your prompt...",
    "Synthesizing knowledge...",
    "Connecting the dots...",
    "Formulating the response...",
  ],
};

function TypingResponse({
  content,
  isNew,
  onProgress,
  onComplete,
}: {
  content: string;
  isNew: boolean;
  onProgress?: () => void;
  onComplete?: () => void;
}) {
  const [displayed, setDisplayed] = useState(isNew ? "" : content);
  const [isTyping, setIsTyping] = useState(isNew);

  useEffect(() => {
    if (!isNew) {
      setDisplayed(content);
      setIsTyping(false);
      return;
    }

    const words = content.split(" ");
    let i = 0;
    let timer: NodeJS.Timeout;
    setDisplayed("");
    setIsTyping(true);

    const typeNextWord = () => {
      if (i < words.length) {
        const word = words[i];
        setDisplayed(words.slice(0, i + 1).join(" "));
        i++;
        onProgress?.();

        // Smooth natural cadence: 42ms base with brief breathing room on punctuation
        let delay = 42;
        if (word.endsWith(".") || word.endsWith("?") || word.endsWith("!")) {
          delay = 110;
        } else if (word.endsWith(",") || word.endsWith(":") || word.endsWith(";")) {
          delay = 70;
        } else if (word.includes("\n")) {
          delay = 90;
        }

        timer = setTimeout(typeNextWord, delay);
      } else {
        setIsTyping(false);
        onComplete?.();
      }
    };

    timer = setTimeout(typeNextWord, 50);
    return () => clearTimeout(timer);
  }, [content, isNew, onProgress, onComplete]);

  return (
    <div className="relative font-sans text-xs sm:text-sm leading-relaxed">
      <MessageResponse className="size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 space-y-2 text-xs sm:text-sm leading-relaxed text-zinc-200 [&_h1]:text-base [&_h1]:font-semibold [&_h1]:text-white [&_h1]:mt-3 [&_h1]:mb-1 [&_h2]:text-sm [&_h2]:font-semibold [&_h2]:text-white [&_h2]:mt-2.5 [&_h2]:mb-1 [&_h3]:text-xs [&_h3]:font-semibold [&_h3]:text-white [&_h3]:mt-2 [&_h3]:mb-0.5 [&_h4]:text-xs [&_h4]:font-semibold [&_h4]:text-zinc-100 [&_h4]:mt-2 [&_h4]:mb-0.5 [&_strong]:text-white [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:space-y-1 [&_li]:leading-relaxed [&_code]:bg-white/10 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-zinc-200 [&_code]:text-[11px] [&_pre]:bg-black/50 [&_pre]:border [&_pre]:border-white/10 [&_pre]:rounded-lg [&_pre]:p-3 [&_pre]:my-2">
        {displayed}
      </MessageResponse>
      {isTyping && (
        <span className="inline-block w-1.5 h-3.5 ml-0.5 align-middle bg-white/70 animate-pulse" />
      )}
    </div>
  );
}

export function HeroSection() {
  const [selectedModel, setSelectedModel] = useState(QUICK_MODELS[0].id);
  const [promptText, setPromptText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [remainingCredits, setRemainingCredits] = useState<number>(GUEST_MAX_CREDITS);
  const [isLoading, setIsLoading] = useState(false);
  const [thinkingIndex, setThinkingIndex] = useState(0);
  const [animatingLast, setAnimatingLast] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isAutoScrollActiveRef = useRef(true);

  // Auto-scroll handler: detects if user scrolled up
  const handleContainerScroll = useCallback(() => {
    const el = chatContainerRef.current;
    if (!el) return;
    const tolerance = 48;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= tolerance;
    isAutoScrollActiveRef.current = atBottom;
    setShowScrollToBottom(!atBottom && el.scrollHeight > el.clientHeight + 60);
  }, []);

  // Smooth scroll-to-bottom utility
  const scrollToBottom = useCallback((smooth = true) => {
    const el = chatContainerRef.current;
    if (!el) return;
    el.scrollTo({
      top: el.scrollHeight,
      behavior: smooth ? "smooth" : "auto",
    });
    isAutoScrollActiveRef.current = true;
    setShowScrollToBottom(false);
  }, []);

  // Streaming typing progress auto-scroll (only if user is already at bottom)
  const handleTypingProgress = useCallback(() => {
    if (isAutoScrollActiveRef.current && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, []);

  // Initialize guest identity & local storage data silently
  useEffect(() => {
    getOrCreateGuestId();
    setRemainingCredits(getGuestRemainingCredits());
    setMessages(getGuestMessages());

    const handleGuestUpdate = () => {
      setRemainingCredits(getGuestRemainingCredits());
      setMessages(getGuestMessages());
    };

    window.addEventListener("oagpt_guest_updated", handleGuestUpdate);
    return () => window.removeEventListener("oagpt_guest_updated", handleGuestUpdate);
  }, []);

  // Cycle playful placeholder thoughts while thinking (without scrolling page)
  useEffect(() => {
    if (!isLoading) {
      setThinkingIndex(0);
      return;
    }
    const timer = setInterval(() => {
      setThinkingIndex((prev) => prev + 1);
    }, 1800);
    return () => clearInterval(timer);
  }, [isLoading]);

  const handleSendPrompt = async (textToSend?: string) => {
    const text = (textToSend || promptText).trim();
    if (!text) return;

    if (remainingCredits <= 0) {
      toast.info("Free preview limit reached. Sign up for unlimited queries.");
      return;
    }

    const targetModel = QUICK_MODELS.find((m) => m.id === selectedModel);
    if (targetModel?.isPaid) {
      toast.info(`${targetModel.name} requires a Plus plan. Please select a free trial model.`);
      return;
    }

    const updatedCreditsUsed = incrementGuestCredits();
    setRemainingCredits(Math.max(0, GUEST_MAX_CREDITS - updatedCreditsUsed));

    const userMsg: ChatMessage = {
      role: "user",
      content: text,
      model: selectedModel,
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    saveGuestMessages(updatedMessages);
    setPromptText("");
    setIsLoading(true);

    // Smooth auto-scroll down to show user's prompt and thinking indicator
    setTimeout(() => scrollToBottom(true), 40);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          model: selectedModel,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error || "Failed to receive response");
      }

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: data.content || "No response received.",
        model: selectedModel,
      };

      const finalMessages = [...updatedMessages, assistantMsg];
      setMessages(finalMessages);
      saveGuestMessages(finalMessages);
      setAnimatingLast(true);
      setTimeout(() => scrollToBottom(true), 40);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }
      console.error("Hero chat error:", err);
      const errMsg = err instanceof Error ? err.message : "Error contacting model";
      const errorAssistantMsg: ChatMessage = {
        role: "assistant",
        content: `Error: ${errMsg}. Please try again with another model.`,
        model: selectedModel,
      };
      const finalMessages = [...updatedMessages, errorAssistantMsg];
      setMessages(finalMessages);
      saveGuestMessages(finalMessages);
      setTimeout(() => scrollToBottom(true), 40);
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
      setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 100);
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
  };

  const handleRetryLast = () => {
    if (isLoading || messages.length === 0) return;
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUserMsg) return;
    handleSendPrompt(lastUserMsg.content);
  };

  const handleCopy = (content: string, index: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    toast.success("Copied");
    setTimeout(() => setCopiedIndex(null), 1800);
  };

  const handleClearChat = () => {
    clearGuestMessages();
    setMessages([]);
    setAnimatingLast(false);
    setShowScrollToBottom(false);
  };

  const handleTypingComplete = useCallback(() => {
    setAnimatingLast(false);
  }, []);

  const currentModelObj = QUICK_MODELS.find((m) => m.id === selectedModel) || QUICK_MODELS[0];
  const hasMessages = messages.length > 0;

  const currentThoughts = PLAYFUL_THOUGHTS[selectedModel] || PLAYFUL_THOUGHTS.default;
  const activeThinkingText = currentThoughts[thinkingIndex % currentThoughts.length];

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

        {/* Action CTAs */}
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

        {/* Interactive Dynamic Prompt Capsule */}
        <div className="mt-12 mx-auto max-w-3xl text-left">
          <div className="rounded-2xl border border-white/[0.08] bg-[#1a1a1a]/95 p-4 sm:p-5 shadow-2xl shadow-black/50 transition-all">
            {/* Header: Model Chips & Understated Dot Meter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 mb-3 border-b border-white/[0.06]">
              {/* Model selection chips */}
              <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 text-xs">
                {QUICK_MODELS.map((m) => {
                  const isActive = selectedModel === m.id;
                  const isPaid = m.isPaid;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      disabled={isPaid}
                      onClick={() => {
                        if (!isPaid) setSelectedModel(m.id);
                      }}
                      title={
                        isPaid
                          ? `${m.name} is a Plus model. Free trial includes DeepSeek R1 and Gemini.`
                          : undefined
                      }
                      className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] sm:text-xs transition-all ${isPaid
                          ? "opacity-35 cursor-not-allowed text-zinc-500 border border-transparent select-none"
                          : isActive
                            ? "bg-white/10 text-white font-medium border border-white/20 cursor-pointer"
                            : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] border border-transparent cursor-pointer"
                        }`}
                    >
                      {isPaid && <Lock className="h-2.5 w-2.5 text-zinc-500 shrink-0" />}
                      <span>{m.name}</span>
                      <span className="text-[10px] text-zinc-500 font-mono hidden md:inline">
                        {isPaid ? "Plus" : m.badge}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Minimalist dot indicators */}
              <div className="flex items-center justify-between sm:justify-end gap-2 text-xs shrink-0 pt-1.5 sm:pt-0 border-t sm:border-t-0 border-white/[0.04]">
                <div
                  className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400"
                  title={`${remainingCredits} free prompts remaining`}
                >
                  <span className="flex items-center gap-1">
                    <span
                      className={`h-1.5 w-1.5 rounded-full transition-colors ${remainingCredits >= 1 ? "bg-white/80" : "bg-white/20"
                        }`}
                    />
                    <span
                      className={`h-1.5 w-1.5 rounded-full transition-colors ${remainingCredits >= 2 ? "bg-white/80" : "bg-white/20"
                        }`}
                    />
                  </span>
                  <span className="text-zinc-500">
                    {remainingCredits > 0 ? `${remainingCredits} left` : "Limit"}
                  </span>
                </div>

                {hasMessages && (
                  <button
                    type="button"
                    onClick={handleClearChat}
                    className="text-zinc-500 hover:text-zinc-300 transition-colors p-1 rounded hover:bg-white/[0.05] cursor-pointer"
                    title="Reset conversation"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Live Chat Stream Display */}
            {hasMessages && (
              <div
                ref={chatContainerRef}
                onScroll={handleContainerScroll}
                className="relative max-h-[340px] sm:max-h-[400px] overflow-y-auto space-y-3.5 pr-1.5 mb-4 scrollbar-thin scrollbar-thumb-white/10 scroll-smooth"
              >
                {messages.map((m, idx) => {
                  const isUser = m.role === "user";
                  const isLastAssistant = !isUser && idx === messages.length - 1 && animatingLast;

                  return (
                    <div
                      key={idx}
                      className={`flex flex-col gap-1.5 ${isUser ? "items-end" : "items-start"
                        }`}
                    >
                      {/* Message Meta */}
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500 px-1">
                        <span>
                          {isUser
                            ? "You"
                            : QUICK_MODELS.find((mod) => mod.id === m.model)?.name || "Assistant"}
                        </span>
                      </div>

                      {/* Message Content Bubble */}
                      <div
                        className={`group relative max-w-[92%] sm:max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed ${isUser
                            ? "bg-white/[0.08] text-white border border-white/10"
                            : "bg-[#141414] text-zinc-200 border border-white/[0.06]"
                          }`}
                      >
                        {isUser ? (
                          <div className="whitespace-pre-wrap font-sans">{m.content}</div>
                        ) : (
                          <TypingResponse
                            content={m.content}
                            isNew={isLastAssistant}
                            onProgress={handleTypingProgress}
                            onComplete={handleTypingComplete}
                          />
                        )}

                        {!isUser && (
                          <div className="mt-2 pt-1.5 border-t border-white/[0.04] flex items-center justify-end gap-3">
                            <button
                              type="button"
                              onClick={() => handleCopy(m.content, idx)}
                              className="text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1 text-[10px] cursor-pointer"
                              title="Copy response"
                            >
                              {copiedIndex === idx ? (
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

                            {idx === messages.length - 1 && (
                              <button
                                type="button"
                                onClick={handleRetryLast}
                                disabled={isLoading || remainingCredits <= 0}
                                className="text-zinc-500 hover:text-zinc-300 disabled:opacity-35 transition-colors flex items-center gap-1 text-[10px] cursor-pointer"
                                title="Retry with selected model"
                              >
                                <RotateCcw className="h-3 w-3" />
                                <span>Retry</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Playful Thinking indicator */}
                {isLoading && (
                  <div className="flex flex-col items-start gap-1.5">
                    <span className="text-[10px] font-mono text-zinc-500 px-1">
                      {currentModelObj.name}
                    </span>
                    <div className="flex items-center gap-2.5 rounded-xl bg-[#141414] border border-white/[0.06] px-3.5 py-2.5 text-xs text-zinc-400">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-400 shrink-0" />
                      <span className="text-zinc-300 font-mono text-[11px] animate-pulse">
                        {activeThinkingText}
                      </span>
                    </div>
                  </div>
                )}

                {/* Floating Scroll to Bottom pill button */}
                {showScrollToBottom && (
                  <div className="sticky bottom-1 flex justify-center z-20 pointer-events-none pb-1">
                    <button
                      type="button"
                      onClick={() => scrollToBottom(true)}
                      className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-zinc-900/95 hover:bg-zinc-800 text-zinc-300 hover:text-white px-3 py-1 text-[11px] font-medium shadow-xl border border-white/15 backdrop-blur-md transition-all active:scale-95 cursor-pointer animate-in fade-in duration-200"
                      title="Jump to latest message"
                    >
                      <ArrowDown className="h-3 w-3 animate-bounce" />
                      <span>Scroll to bottom</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Minimal Inline Limit Banner */}
            {remainingCredits <= 0 && !isLoading && (
              <div className="mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-xs text-zinc-300">
                <span className="flex items-center gap-2 font-normal text-zinc-300">
                  <Info className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                  <span>Free preview limit reached.</span>
                </span>
                <div className="flex items-center gap-3">
                  <Link
                    href="/auth/signup"
                    className="font-medium text-white hover:text-zinc-200 transition-colors underline-offset-2 hover:underline"
                  >
                    Sign up free →
                  </Link>
                  <span className="text-zinc-600">•</span>
                  <Link
                    href="/auth/signin"
                    className="text-zinc-400 hover:text-white transition-colors"
                  >
                    Sign in
                  </Link>
                </div>
              </div>
            )}

            {/* Dynamic Prompt Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendPrompt();
              }}
              className="flex items-center gap-3"
            >
              <div className="relative flex-1 flex items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setPromptText("");
                    }
                  }}
                  placeholder={
                    remainingCredits > 0
                      ? hasMessages
                        ? `Ask a follow-up with ${currentModelObj.name}...`
                        : `Ask ${currentModelObj.name} anything...`
                      : "Create an account to keep chatting..."
                  }
                  disabled={isLoading || remainingCredits <= 0}
                  className="w-full bg-transparent text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 outline-none pr-6 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {promptText && !isLoading && (
                  <button
                    type="button"
                    onClick={() => {
                      setPromptText("");
                      inputRef.current?.focus({ preventScroll: true });
                    }}
                    className="absolute right-0 p-1 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                    title="Clear input"
                    aria-label="Clear input"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {isLoading ? (
                <button
                  type="button"
                  onClick={handleStop}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/30 transition-all active:scale-95 cursor-pointer shadow-sm"
                  title="Stop generating"
                  aria-label="Stop generating"
                >
                  <Square className="h-3 w-3 fill-red-400" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!promptText.trim() || remainingCredits <= 0}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-black hover:bg-zinc-200 disabled:opacity-30 disabled:hover:bg-white disabled:cursor-not-allowed transition-all active:scale-95 cursor-pointer shadow-sm"
                  aria-label="Send prompt"
                  title="Send prompt (Enter)"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
              )}
            </form>

            {/* Suggestions (Initially shown when empty) */}
            {!hasMessages && (
              <div className="mt-4 pt-3 border-t border-white/[0.04] flex flex-wrap items-center gap-2 text-[11px]">
                <span className="text-zinc-500 font-mono flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-zinc-400" />
                  <span>Try:</span>
                </span>
                {SUGGESTIONS.map((suggestion, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setPromptText(suggestion);
                      handleSendPrompt(suggestion);
                    }}
                    className="rounded-md bg-white/[0.03] px-2 py-1 text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors truncate max-w-full text-left cursor-pointer border border-white/[0.03] hover:border-white/10"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
