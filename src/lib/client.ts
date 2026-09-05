import type { PresenceState } from "./types";
export async function api(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<PresenceState & { sessionId?: string }> {
  const response = await fetch(`/api/v1/${path}`, {
    method,
    credentials: "same-origin",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(
      typeof data.error === "string"
        ? data.error
        : data.error?.message ||
            data.message ||
            "Something went wrong. Please try again.",
    );
  return data;
}
