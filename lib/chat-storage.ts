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
  } catch (e) {
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
  } catch (e) {
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
  } catch (e) {
    console.error("Failed to delete thread from localStorage", e);
  }
}
