export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  model?: string;
}

export interface ChatThread {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}

const STORAGE_KEY = "codersgpt_chat_threads";

export function getStoredThreads(): ChatThread[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to read threads from localStorage", e);
    return [];
  }
}

export function getStoredThread(id: string): ChatThread | null {
  const threads = getStoredThreads();
  return threads.find((t) => t.id === id) || null;
}

export function saveStoredThread(thread: ChatThread): void {
  if (typeof window === "undefined") return;
  try {
    const threads = getStoredThreads();
    const index = threads.findIndex((t) => t.id === thread.id);
    if (index >= 0) {
      threads[index] = thread;
    } else {
      threads.unshift(thread);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
    // Dispatch custom event to notify sidebar / listeners
    window.dispatchEvent(new Event("chat_threads_updated"));
  } catch (e) {
    console.error("Failed to save thread to localStorage", e);
  }
}

export function deleteStoredThread(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const threads = getStoredThreads().filter((t) => t.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
    window.dispatchEvent(new Event("chat_threads_updated"));
  } catch (e) {
    console.error("Failed to delete thread from localStorage", e);
  }
}
