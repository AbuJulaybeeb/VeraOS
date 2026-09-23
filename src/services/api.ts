// Core API client storage utilities
export const STORAGE_KEYS = {
  VERIFICATIONS: "vera_verifications_store_v1",
  AGENTS: "vera_agents_store_v1",
};

const memoryStore = new Map<string, string>();

export function getFromStorage<T>(key: string, fallback: T): T {
  try {
    if (typeof window !== "undefined" && typeof localStorage !== "undefined" && localStorage) {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw) as T;
    }
    const mem = memoryStore.get(key);
    if (mem) return JSON.parse(mem) as T;
    return fallback;
  } catch {
    return fallback;
  }
}

export function saveToStorage<T>(key: string, data: T): void {
  try {
    const serialized = JSON.stringify(data);
    memoryStore.set(key, serialized);
    if (typeof window !== "undefined" && typeof localStorage !== "undefined" && localStorage) {
      localStorage.setItem(key, serialized);
    }
  } catch (err) {
    console.warn("Storage write error:", err);
  }
}
