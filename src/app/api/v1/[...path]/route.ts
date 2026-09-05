import { NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { readJsonBody } from "../../../../lib/server/request";
import {
  bootstrapActor,
  COOKIE,
  HttpError,
  localDemoAllowed,
  readActor,
  sameOrigin,
  signActor,
} from "../../../../lib/server/auth";
import {
  addMemory,
  createSession,
  deleteFanMemories,
  deleteMemory,
  getState,
  patchCreator,
  patchFan,
  reset,
  sendMessage,
  takeover,
} from "../../../../lib/server/runtime";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const response = (body: unknown, status = 200) =>
  NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store, private",
      "X-Content-Type-Options": "nosniff",
    },
  });
async function handle(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  try {
    const { path } = await context.params;
    const route = path.join("/");
    const method = request.method;
    if (method !== "GET") sameOrigin(request);
    let input: unknown = {};
    if (["POST", "PATCH"].includes(method)) input = await readJsonBody(request);
    const actor = readActor(request);
    if (route === "demo" && method === "POST") {
      localDemoAllowed(request);
      const body = z
        .object({
          role: z.enum(["creator", "fan", "admin"]).default("creator"),
          fanId: z.enum(["fan-alex", "fan-jordan", "fan-sam"]).optional(),
        })
        .strict()
        .parse(input);
      const next = bootstrapActor(body.role, body.fanId, actor);
      const result = response(getState(next));
      result.cookies.set(COOKIE, signActor(next), {
        httpOnly: true,
        sameSite: "strict",
        secure: new URL(request.url).protocol === "https:",
        path: "/",
        maxAge: 8 * 3600,
      });
      return result;
    }
    if (!actor)
      throw new HttpError(
        401,
        "Open the local demo to initialize your isolated session.",
      );
    if (route === "state" && method === "GET") return response(getState(actor));
    if (route === "creator" && method === "PATCH")
      return response(patchCreator(actor, input));
    if (route === "sessions" && method === "POST")
      return response(createSession(actor, input), 201);
    if (
      path[0] === "sessions" &&
      path.length === 3 &&
      path[2] === "messages" &&
      method === "POST"
    )
      return response(sendMessage(actor, path[1], input));
    if (
      path[0] === "sessions" &&
      path.length === 3 &&
      path[2] === "takeover" &&
      method === "POST"
    )
      return response(takeover(actor, path[1], input));
    if (path[0] === "fans" && path.length === 2 && method === "PATCH")
      return response(patchFan(actor, path[1], input));
    if (
      path[0] === "fans" &&
      path.length === 3 &&
      path[2] === "memories" &&
      method === "DELETE"
    )
      return response(deleteFanMemories(actor, path[1]));
    if (route === "memories" && method === "POST")
      return response(addMemory(actor, input), 201);
    if (path[0] === "memories" && path.length === 2 && method === "DELETE")
      return response(deleteMemory(actor, path[1]));
    if (route === "reset" && method === "POST") return response(reset(actor));
    throw new HttpError(404, "Endpoint not found.");
  } catch (error) {
    if (error instanceof HttpError)
      return response({ error: error.message }, error.status);
    if (error instanceof ZodError)
      return response(
        {
          error: "Invalid request fields.",
          issues: error.issues.map((i) => ({
            path: i.path.join("."),
            message: i.message,
          })),
        },
        400,
      );
    console.error(
      "Presence API failure:",
      error instanceof Error ? error.message : "Unknown failure",
    );
    return response(
      { error: "The local runtime could not complete this request." },
      500,
    );
  }
}
export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const DELETE = handle;
