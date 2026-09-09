export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  model?: string;
}

export interface ChatThread {
  id: string;
  title: string;
  userId?: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}

function getStorageKey(userId?: string): string | null {
  if (!userId) return null;
  return `oagpt_chat_threads_${userId}`;
}

export function getStoredThreads(userId?: string): ChatThread[] {
  if (typeof window === "undefined" || !userId) return [];
  const key = getStorageKey(userId);
  if (!key) return [];
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (e: unknown) {
    console.error("Failed to read threads from localStorage", e);
    return [];
  }
}

export function getStoredThread(id: string, userId?: string): ChatThread | null {
  if (!userId) return null;
  const threads = getStoredThreads(userId);
  return threads.find((t) => t.id === id) || null;
}

export function saveStoredThread(thread: ChatThread, userId?: string): void {
  if (typeof window === "undefined" || !userId) return;
  const key = getStorageKey(userId);
  if (!key) return;
  try {
    const threads = getStoredThreads(userId);
    const index = threads.findIndex((t) => t.id === thread.id);
    const updatedThread = { ...thread, userId };
    if (index >= 0) {
      threads[index] = updatedThread;
    } else {
      threads.unshift(updatedThread);
    }
    localStorage.setItem(key, JSON.stringify(threads));
    window.dispatchEvent(new Event("chat_threads_updated"));
  } catch (e: unknown) {
    console.error("Failed to save thread to localStorage", e);
  }
}

export function deleteStoredThread(id: string, userId?: string): void {
  if (typeof window === "undefined" || !userId) return;
  const key = getStorageKey(userId);
  if (!key) return;
  try {
    const threads = getStoredThreads(userId).filter((t) => t.id !== id);
    localStorage.setItem(key, JSON.stringify(threads));
    window.dispatchEvent(new Event("chat_threads_updated"));
  } catch (e: unknown) {
    console.error("Failed to delete thread from localStorage", e);
  }
}

// ==========================================
// Guest Trial & LocalStorage Identity System
// ==========================================
export const GUEST_MAX_CREDITS = 2;
const GUEST_ID_KEY = "oagpt_guest_id";
const GUEST_CREDITS_KEY = "oagpt_guest_credits_used";
const GUEST_MESSAGES_KEY = "oagpt_guest_messages";

export function getOrCreateGuestId(): string {
  if (typeof window === "undefined") return "guest";
  let guestId = localStorage.getItem(GUEST_ID_KEY);
  if (!guestId) {
    guestId = `guest_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`;
    localStorage.setItem(GUEST_ID_KEY, guestId);
  }
  return guestId;
}

export function getGuestCreditsUsed(): number {
  if (typeof window === "undefined") return 0;
  const val = localStorage.getItem(GUEST_CREDITS_KEY);
  return val ? parseInt(val, 10) || 0 : 0;
}

export function getGuestRemainingCredits(): number {
  const used = getGuestCreditsUsed();
  return Math.max(0, GUEST_MAX_CREDITS - used);
}

export function incrementGuestCredits(): number {
  if (typeof window === "undefined") return 0;
  const current = getGuestCreditsUsed();
  const next = current + 1;
  localStorage.setItem(GUEST_CREDITS_KEY, next.toString());
  window.dispatchEvent(new Event("oagpt_guest_updated"));
  return next;
}

export function getGuestMessages(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(GUEST_MESSAGES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveGuestMessages(messages: ChatMessage[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(GUEST_MESSAGES_KEY, JSON.stringify(messages));
    window.dispatchEvent(new Event("oagpt_guest_updated"));
  } catch (e: unknown) {
    console.error("Failed to save guest messages", e);
  }
}

export function clearGuestMessages(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(GUEST_MESSAGES_KEY);
  window.dispatchEvent(new Event("oagpt_guest_updated"));
}
