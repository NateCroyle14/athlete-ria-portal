// Simple helper used by both server and client components

export const API =
  (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001").replace(
    /\/+$/,
    ""
  );

/**
 * Try one or more paths (in order). Returns parsed JSON or null.
 * Never throws — perfect for keeping the page stable.
 */
export async function safeGetJson<T = unknown>(
  paths: string[] | string,
  init?: RequestInit
): Promise<T | null> {
  const list = Array.isArray(paths) ? paths : [paths];

  for (const p of list) {
    try {
      const res = await fetch(`${API}${p}`, {
        cache: "no-store",
        ...init,
      });
      if (res.ok) {
        return (await res.json()) as T;
      }
    } catch {
      // ignore and move to next path
    }
  }
  return null;
}
