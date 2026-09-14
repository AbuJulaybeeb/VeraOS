// Base API client utilities & simulation helpers
export const SIMULATED_LATENCY_MS = 250;

export async function delay(ms = SIMULATED_LATENCY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Local storage persistent mock store keys
export const STORAGE_KEYS = {
  VERIFICATIONS: "vera_verifications_store_v1",
  AGENTS: "vera_agents_store_v1",
};

export function getFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn("Storage write error:", err);
  }
}
