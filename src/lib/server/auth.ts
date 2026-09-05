import { createHmac, timingSafeEqual, randomUUID } from "node:crypto";
import type { Actor } from "../types";
import { signingSecret } from "./store";
export const COOKIE = "presence_demo";
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function signActor(actor: Actor): string {
  const payload = Buffer.from(
    JSON.stringify({ ...actor, expires: Date.now() + 8 * 3600e3 }),
  ).toString("base64url");
  return `${payload}.${createHmac("sha256", signingSecret()).update(payload).digest("base64url")}`;
}
export function readActor(request: Request): Actor | null {
  const token = request.headers
    .get("cookie")
    ?.split(";")
    .map((x) => x.trim())
    .find((x) => x.startsWith(`${COOKIE}=`))
    ?.slice(COOKIE.length + 1);
  if (!token || token.length > 2000) return null;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return null;
  const expected = createHmac("sha256", signingSecret())
    .update(payload)
    .digest("base64url");
  if (
    signature.length !== expected.length ||
    !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  )
    return null;
  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (
      decoded.expires < Date.now() ||
      !["creator", "fan", "admin"].includes(decoded.role) ||
      typeof decoded.workspaceId !== "string"
    )
      return null;
    if (
      decoded.role === "fan" &&
      !["fan-alex", "fan-jordan", "fan-sam"].includes(decoded.fanId)
    )
      return null;
    return {
      role: decoded.role,
      workspaceId: decoded.workspaceId,
      ...(decoded.fanId ? { fanId: decoded.fanId } : {}),
    };
  } catch {
    return null;
  }
}
function requestOrigin(request: Request): URL {
  const url = new URL(request.url);
  const host = request.headers.get("host");
  if (!host) return url;
  // Next may canonicalize request.url to localhost although the browser used
  // 127.0.0.1. Only the actual HTTP Host is considered; forwarding headers are
  // never trusted. Both endpoints must be loopback before this local override.
  const loopback = ["localhost", "127.0.0.1", "[::1]"];
  let direct: URL;
  try { direct = new URL(`${url.protocol}//${host}`); }
  catch { throw new HttpError(403, "Invalid request host."); }
  if (direct.host !== host || direct.username || direct.password || direct.pathname !== "/")
    throw new HttpError(403, "Invalid request host.");
  if (direct.origin !== url.origin && (!loopback.includes(url.hostname) || !loopback.includes(direct.hostname)))
    throw new HttpError(403, "Request host does not match the local runtime.");
  return direct;
}
export function localDemoAllowed(request: Request) {
  const url = requestOrigin(request);
  if (!["localhost", "127.0.0.1", "[::1]"].includes(url.hostname))
    throw new HttpError(
      403,
      "The demo role selector is available only on localhost.",
    );
  if (
    process.env.NODE_ENV === "production" &&
    process.env.PRESENCE_ENABLE_LOCAL_DEMO !== "true"
  )
    throw new HttpError(
      403,
      "Enable PRESENCE_ENABLE_LOCAL_DEMO=true explicitly for a local production preview.",
    );
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (
    !origin ||
    origin !== requestOrigin(request).origin ||
    request.headers.get("sec-fetch-site") === "cross-site"
  )
    throw new HttpError(403, "A same-origin request is required.");
}
export function bootstrapActor(
  role: Actor["role"],
  fanId: string | undefined,
  prior: Actor | null,
): Actor {
  return {
    role,
    workspaceId: prior?.workspaceId || randomUUID(),
    ...(role === "fan" ? { fanId: fanId || "fan-alex" } : {}),
  };
}
