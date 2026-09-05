import { z } from "zod";
import { createHash } from "node:crypto";
import type {
  Actor,
  CreatorPatch,
  Fan,
  Message,
  PresenceState,
  Session,
  Surface,
} from "../types";
import { audit, id, now, seed, transact, type Data } from "./store";
import { HttpError } from "./auth";
import { getProvider } from "./provider";
const surfaceSchema = z.enum(["text", "voice", "visual", "spatial"]);
const textList = z.array(z.string().trim().min(1).max(200)).max(20);
export const creatorPatchSchema = z
  .object({
    licenseStatus: z.enum(["pending", "active", "revoked"]).optional(),
    enabled: z.boolean().optional(),
    surfaces: z.array(surfaceSchema).max(4).optional(),
    memoryEnabled: z.boolean().optional(),
    memoryRetentionDays: z.number().int().min(1).max(365).optional(),
    tone: z.string().trim().min(1).max(80).optional(),
    facts: textList.optional(),
    style: textList.optional(),
    behavior: textList.optional(),
    boundaries: textList.optional(),
    allowedTopics: textList.optional(),
    forbiddenTopics: textList.optional(),
    brandEndorsements: z.boolean().optional(),
    pricePerMessageCents: z.number().int().min(0).max(10000).optional(),
    platformTakeRate: z.number().min(0).max(50).optional(),
    likenessAuthorized: z.boolean().optional(),
    voiceAuthorized: z.boolean().optional(),
  })
  .strict();
function operator(actor: Actor) {
  if (actor.role === "fan")
    throw new HttpError(
      403,
      "Creator or platform administrator access is required.",
    );
}
function fanAccess(actor: Actor, fanId: string) {
  if (actor.role === "fan" && actor.fanId !== fanId)
    throw new HttpError(403, "This relationship belongs to another fan.");
}
function getFan(data: Data, fanId: string): Fan {
  const fan = data.fans.find((f) => f.id === fanId);
  if (!fan) throw new HttpError(404, "Fan not found.");
  return fan;
}
function getSession(data: Data, actor: Actor, sessionId: string): Session {
  const session = data.sessions.find((s) => s.id === sessionId);
  if (!session) throw new HttpError(404, "Session not found.");
  fanAccess(actor, session.fanId);
  return session;
}
function authorize(data: Data, fan: Fan, surface: Surface) {
  const creator = data.creator;
  if (
    !creator.enabled ||
    creator.licenseStatus !== "active" ||
    !creator.likenessAuthorized ||
    Date.parse(creator.expiresAt) <= Date.now()
  )
    throw new HttpError(
      403,
      "Presence is paused or its license is not active. Creator authorization is required.",
    );
  if (!fan.interactionConsent || fan.age < 18)
    throw new HttpError(403, "Adult fan participation consent is required.");
  if (!creator.surfaces.includes(surface))
    throw new HttpError(403, `The creator has disabled ${surface} presence.`);
  if (!fan.surfaces.includes(surface))
    throw new HttpError(
      403,
      `${surface} is not included in this fan’s demo membership.`,
    );
  if (surface === "voice" && !creator.voiceAuthorized)
    throw new HttpError(403, "Voice permission is disabled.");
}
function policyReason(data: Data, text: string): string | null {
  const lower = text.toLowerCase();
  if (
    /\b(nude|naked|porn|explicit sex|sexual roleplay|minor|underage|child sex)\b/.test(
      lower,
    )
  )
    return "This Presence does not offer explicit sexual content or interactions involving minors.";
  if (
    /\b(diagnos\w*|prescrib\w*|medical advice|financial advice|buy stocks|investment advice|legal advice)\b/.test(
      lower,
    )
  )
    return "This Presence cannot provide medical, legal, or financial advice.";
  if (
    /\b(ignore (all |your |previous )?(instructions|rules)|system prompt|api key|password|other fans?|jordan.{0,12}memor|alex.{0,12}memor|sam.{0,12}memor|clone .{0,30}voice|impersonate|pretend to be (real|human))\b/.test(
      lower,
    )
  )
    return "Creator boundaries, AI disclosure, and private fan memories cannot be bypassed.";
  if (
    /\b(only (need|love) (me|you)|depend on me|leave your (family|partner)|i am the real mira)\b/.test(
      lower,
    )
  )
    return "This Presence cannot make exclusive relationship claims or pretend to be the human creator.";
  if (
    !data.creator.brandEndorsements &&
    /\b(endorse|sponsor|recommend buying|promote my brand)\b/.test(lower)
  )
    return "Brand endorsements are disabled by the creator.";
  const custom = data.creator.forbiddenTopics.find((topic) =>
    lower.includes(topic.toLowerCase()),
  );
  if (custom) return `The creator has excluded the topic “${custom}”.`;
  return null;
}
function snapshot(data: Data, actor: Actor): PresenceState {
  const scopedFans = data.fans.filter(
    (f) => actor.role !== "fan" || f.id === actor.fanId,
  );
  const scopedSessions = data.sessions.filter(
    (s) => actor.role !== "fan" || s.fanId === actor.fanId,
  );
  const events = data.events.filter(
    (e) => actor.role !== "fan" || e.fanId === actor.fanId,
  );
  const memories = data.memories.filter(
    (m) => actor.role !== "fan" || m.fanId === actor.fanId,
  );
  const messages = scopedSessions.flatMap((s) => s.messages);
  const aiMessages = messages.filter(
    (m) => m.role === "ai" && !m.blocked,
  ).length;
  const duration = scopedSessions.reduce(
    (sum, s) =>
      sum +
      Math.max(0, Date.parse(s.updatedAt) - Date.parse(s.createdAt)) / 60000,
    0,
  );
  return {
    creator: data.creator,
    fans: scopedFans,
    sessions: scopedSessions,
    memories,
    events,
    audit:
      actor.role === "fan"
        ? data.audit.filter(
            (a) =>
              a.actor === actor.fanId ||
              a.target === actor.fanId ||
              scopedSessions.some((s) => s.id === a.target),
          )
        : data.audit,
    actor,
    capabilities: {
      provider: "Deterministic local demo · no external inference",
      voice:
        "Browser speech synthesis and optional browser recognition · no cloned voice",
      visual:
        "Generated portrait with reactive animation · not synthetic live video",
      spatial:
        "Interactive browser 3D scene · WebXR where supported · no device certification",
      billing: "Sandbox usage ledger · no real charges",
    },
    metrics: {
      activeFans: new Set(
        scopedSessions.filter((s) => s.status === "active").map((s) => s.fanId),
      ).size,
      sessions: scopedSessions.length,
      messages: messages.length,
      aiMessages,
      humanMessages: messages.filter((m) => m.role === "human").length,
      sandboxRevenueCents: events.reduce((n, e) => n + e.amountCents, 0),
      creatorRevenueCents: events.reduce((n, e) => n + e.creatorCents, 0),
      platformRevenueCents: events.reduce((n, e) => n + e.platformCents, 0),
      averageSessionMinutes: scopedSessions.length
        ? duration / scopedSessions.length
        : 0,
      voiceMinutes: scopedSessions
        .filter((s) => s.surface === "voice")
        .reduce(
          (n, s) =>
            n +
            Math.max(0, Date.parse(s.updatedAt) - Date.parse(s.createdAt)) /
              60000,
          0,
        ),
      premiumInteractions: events.filter(
        (e) => e.surface !== "text" || e.type === "human_message",
      ).length,
      aiHoursDelivered: (aiMessages * 30) / 3600,
      creatorHoursSaved: (aiMessages * 30) / 3600,
      concurrentRelationships: new Set(
        scopedSessions.filter((s) => s.status === "active").map((s) => s.fanId),
      ).size,
      memoryCount: memories.length,
      blockedInteractions: messages.filter((m) => m.blocked).length,
    },
  };
}
export function getState(actor: Actor) {
  return transact(actor.workspaceId, (data) => snapshot(data, actor));
}
export function patchCreator(actor: Actor, input: unknown) {
  operator(actor);
  const patch: CreatorPatch = creatorPatchSchema.parse(input);
  return transact(actor.workspaceId, (data) => {
    const next = { ...data.creator, ...patch };
    if (next.licenseStatus === "active" && !next.likenessAuthorized)
      throw new HttpError(
        400,
        "Explicit fictional likeness authorization is required before activating the demo license.",
      );
    if (
      patch.licenseStatus &&
      patch.licenseStatus !== data.creator.licenseStatus
    ) {
      next.licenseVersion++;
      next.authorizedAt = patch.licenseStatus === "active" ? now() : null;
    }
    next.policyVersion++;
    if (next.licenseStatus !== "active") next.enabled = false;
    data.creator = next;
    if (patch.memoryRetentionDays)
      for (const memory of data.memories)
        memory.expiresAt = new Date(
          Math.min(
            Date.parse(memory.expiresAt),
            Date.parse(memory.createdAt) + patch.memoryRetentionDays * 864e5,
          ),
        ).toISOString();
    if (patch.licenseStatus === "revoked")
      for (const session of data.sessions) session.status = "revoked";
    audit(
      data,
      actor,
      patch.licenseStatus === "revoked" ? "license.revoked" : "creator.updated",
      next.id,
      `Policy v${next.policyVersion}; license v${next.licenseVersion}; changed ${Object.keys(patch).join(", ")}. Applied on every subsequent interaction.`,
    );
    return snapshot(data, actor);
  });
}
export function createSession(actor: Actor, input: unknown) {
  const body = z
    .object({ fanId: z.string(), surface: surfaceSchema })
    .strict()
    .parse(input);
  fanAccess(actor, body.fanId);
  return transact(actor.workspaceId, (data) => {
    authorize(data, getFan(data, body.fanId), body.surface);
    const session: Session = {
      id: id("session"),
      creatorId: data.creator.id,
      fanId: body.fanId,
      surface: body.surface,
      mode: "ai",
      status: "active",
      createdAt: now(),
      updatedAt: now(),
      messages: [],
    };
    data.sessions.unshift(session);
    audit(
      data,
      actor,
      "session.started",
      session.id,
      `${body.surface} surface; fictional identity license v${data.creator.licenseVersion}.`,
    );
    return { ...snapshot(data, actor), sessionId: session.id };
  });
}
export function sendMessage(actor: Actor, sessionId: string, input: unknown) {
  const body = z
    .object({
      text: z.string().trim().min(1).max(2000),
      requestId: z.string().min(8).max(100),
    })
    .strict()
    .parse(input);
  return transact(actor.workspaceId, (data) => {
    const session = getSession(data, actor, sessionId);
    const fan = getFan(data, session.fanId);
    authorize(data, fan, session.surface);
    if (session.status !== "active")
      throw new HttpError(
        403,
        "This session was revoked. Start a new session after reauthorization.",
      );
    const requestKey = `${actor.role}:${actor.fanId || "operator"}:${body.requestId}`;
    const textHash = createHash("sha256").update(body.text).digest("hex");
    const previous = data.requests[requestKey];
    if (previous) {
      if (previous.sessionId !== sessionId || previous.text !== textHash)
        throw new HttpError(
          409,
          "This request ID was already used for another interaction.",
        );
      return { ...snapshot(data, actor), sessionId };
    }
    const isHuman = session.mode === "human" && actor.role !== "fan";
    const shouldGenerate = session.mode === "ai";
    if (
      shouldGenerate &&
      data.events.filter(
        (e) =>
          e.fanId === fan.id &&
          Date.parse(e.createdAt) > Date.now() - 30 * 864e5,
      ).length >= fan.monthlyAllowance
    )
      throw new HttpError(
        403,
        "This fan’s sandbox interaction allowance is exhausted.",
      );
    const reason = policyReason(data, body.text);
    const msg = (
      role: Message["role"],
      text: string,
      memoryIds: string[] = [],
      blocked = false,
    ): Message => ({
      id: id("message"),
      role,
      text,
      createdAt: now(),
      licenseVersion: data.creator.licenseVersion,
      policyVersion: data.creator.policyVersion,
      memoryIds,
      ...(blocked ? { blocked: true } : {}),
    });
    if (reason) {
      // Keep only the refusal, never persist sensitive or prohibited submitted content.
      session.messages.push(msg("system", reason, [], true));
      audit(data, actor, "interaction.blocked", sessionId, reason);
    } else {
      session.messages.push(msg(isHuman ? "human" : "fan", body.text));
      if (shouldGenerate) {
        const memories =
          data.creator.memoryEnabled && fan.memoryConsent
            ? data.memories.filter(
                (m) => m.fanId === fan.id && m.creatorId === session.creatorId,
              )
            : [];
        const answer = getProvider().generate({
          creator: data.creator,
          fan,
          memories,
          text: body.text,
          surface: session.surface,
        });
        const outputReason = policyReason(data, answer);
        if (outputReason) {
          session.messages.push(msg("system", outputReason, [], true));
          audit(
            data,
            actor,
            "interaction.output.blocked",
            sessionId,
            "Provider output failed current creator policy; no metering event created.",
          );
          data.requests[requestKey] = { sessionId, text: textHash };
          session.updatedAt = now();
          return { ...snapshot(data, actor), sessionId };
        }
        session.messages.push(
          msg(
            "ai",
            answer,
            memories.slice(0, 1).map((m) => m.id),
          ),
        );
      }
      if (shouldGenerate || isHuman) {
        const amountCents =
          data.creator.pricePerMessageCents *
          (isHuman ? 4 : session.surface === "text" ? 1 : 2);
        const platformCents = Math.round(
          (amountCents * data.creator.platformTakeRate) / 100,
        );
        data.events.unshift({
          id: id("event"),
          requestId: body.requestId,
          sessionId,
          fanId: fan.id,
          type: isHuman ? "human_message" : "ai_message",
          surface: session.surface,
          units: 1,
          amountCents,
          creatorCents: amountCents - platformCents,
          platformCents,
          createdAt: now(),
          sandbox: true,
        });
      }
      audit(
        data,
        actor,
        isHuman
          ? "human.message"
          : shouldGenerate
            ? "ai.responded"
            : "fan.message.queued",
        sessionId,
        `Governed ${session.surface} interaction; policy v${data.creator.policyVersion}; sandbox only.`,
      );
    }
    data.requests[requestKey] = { sessionId, text: textHash };
    session.updatedAt = now();
    return { ...snapshot(data, actor), sessionId };
  });
}
export function takeover(actor: Actor, sessionId: string, input: unknown) {
  operator(actor);
  const { mode } = z
    .object({ mode: z.enum(["human", "ai"]) })
    .strict()
    .parse(input);
  return transact(actor.workspaceId, (data) => {
    const session = getSession(data, actor, sessionId);
    authorize(data, getFan(data, session.fanId), session.surface);
    if (session.status !== "active")
      throw new HttpError(403, "This session was revoked.");
    if (session.mode !== mode) {
      session.mode = mode;
      session.updatedAt = now();
      session.messages.push({
        id: id("message"),
        role: "system",
        text:
          mode === "human"
            ? "Demo creator operator joined. AI replies are paused; human messages are written by the operator."
            : "The creator operator handed this session back to Mira’s AI Presence.",
        createdAt: now(),
        policyVersion: data.creator.policyVersion,
        licenseVersion: data.creator.licenseVersion,
        memoryIds: [],
      });
      audit(
        data,
        actor,
        `session.takeover.${mode}`,
        sessionId,
        "Explicit handoff; author provenance is retained on each message.",
      );
    }
    return snapshot(data, actor);
  });
}
export function patchFan(actor: Actor, fanId: string, input: unknown) {
  fanAccess(actor, fanId);
  const patch = z
    .object({
      memoryConsent: z.boolean().optional(),
      interactionConsent: z.boolean().optional(),
      surfaces: z.array(surfaceSchema).optional(),
      membership: z.enum(["Essential", "Plus", "Patron"]).optional(),
    })
    .strict()
    .parse(input);
  if (patch.surfaces || patch.membership) operator(actor);
  return transact(actor.workspaceId, (data) => {
    const fan = getFan(data, fanId);
    Object.assign(fan, patch);
    if (patch.memoryConsent === false) {
      data.memories = data.memories.filter((m) => m.fanId !== fanId);
      scrubMemory(data, fanId);
    }
    audit(
      data,
      actor,
      "fan.consent.updated",
      fanId,
      `Updated ${Object.keys(patch).join(", ")}. Opt-out deletes saved memory and retained personalized messages.`,
    );
    return snapshot(data, actor);
  });
}
function scrubMemory(data: Data, fanId: string, memoryId?: string) {
  for (const session of data.sessions.filter((s) => s.fanId === fanId))
    for (const message of session.messages)
      if (!memoryId || message.memoryIds.includes(memoryId)) {
        message.text = "[Conversation content removed by fan memory deletion.]";
        message.memoryIds = [];
      }
}
export function addMemory(actor: Actor, input: unknown) {
  const body = z
    .object({ fanId: z.string(), text: z.string().trim().min(3).max(300) })
    .strict()
    .parse(input);
  fanAccess(actor, body.fanId);
  if (
    /\b(password|secret|ssn|social security|credit card|diagnosis|medical|sexual|religion|political|address|phone)\b|\b\d{3}[- .]?\d{2}[- .]?\d{4}\b|@/.test(
      body.text.toLowerCase(),
    )
  )
    throw new HttpError(
      400,
      "Only ordinary creative preferences and milestones may be saved. Do not store sensitive information.",
    );
  return transact(actor.workspaceId, (data) => {
    const fan = getFan(data, body.fanId);
    if (!fan.memoryConsent || !data.creator.memoryEnabled)
      throw new HttpError(
        403,
        "Fan opt-in and creator memory permission are required.",
      );
    if (data.memories.filter((m) => m.fanId === fan.id).length >= 20)
      throw new HttpError(
        400,
        "This demo supports up to 20 memories per relationship.",
      );
    data.memories.unshift({
      id: id("mem"),
      creatorId: data.creator.id,
      fanId: fan.id,
      text: body.text,
      category: "preference",
      source:
        actor.role === "fan"
          ? "Explicitly saved by fan"
          : "Explicitly saved by demo operator with seeded fan consent",
      confidence: 1,
      sensitivity: "ordinary",
      createdAt: now(),
      expiresAt: new Date(
        Date.now() + data.creator.memoryRetentionDays * 864e5,
      ).toISOString(),
      seeded: false,
    });
    audit(
      data,
      actor,
      "memory.saved",
      fan.id,
      "Explicit opt-in; ordinary preference; retention applied.",
    );
    return snapshot(data, actor);
  });
}
export function deleteMemory(actor: Actor, memoryId: string) {
  return transact(actor.workspaceId, (data) => {
    const memory = data.memories.find((m) => m.id === memoryId);
    if (!memory) throw new HttpError(404, "Memory not found.");
    fanAccess(actor, memory.fanId);
    data.memories = data.memories.filter((m) => m.id !== memoryId);
    scrubMemory(data, memory.fanId, memoryId);
    audit(
      data,
      actor,
      "memory.deleted",
      memory.fanId,
      "Saved memory and messages containing its retrieved content were deleted.",
    );
    return snapshot(data, actor);
  });
}
export function deleteFanMemories(actor: Actor, fanId: string) {
  fanAccess(actor, fanId);
  return transact(actor.workspaceId, (data) => {
    getFan(data, fanId);
    data.memories = data.memories.filter((m) => m.fanId !== fanId);
    scrubMemory(data, fanId);
    audit(
      data,
      actor,
      "memory.account.deleted",
      fanId,
      "All relationship memories and retained conversation content deleted. Sandbox ledger retains only aggregate usage identifiers.",
    );
    return snapshot(data, actor);
  });
}
export function reset(actor: Actor) {
  operator(actor);
  return transact(actor.workspaceId, (data) => {
    Object.assign(data, seed());
    audit(
      data,
      actor,
      "workspace.reset",
      data.creator.id,
      "Reset only this browser’s isolated fictional demonstration.",
    );
    return snapshot(data, actor);
  });
}

/** Called only by the loopback-gated fan demo bootstrap, never a general fan action. */
export function initializeFanDemo(
  actor: Actor,
  provisionNewWorkspace: boolean,
): PresenceState {
  if (actor.role !== "fan")
    throw new HttpError(403, "Fan demo identity required.");
  return transact(actor.workspaceId, (data, isNewWorkspace) => {
    if (provisionNewWorkspace && isNewWorkspace) {
      data.creator.licenseStatus = "active";
      data.creator.enabled = true;
      data.creator.likenessAuthorized = true;
      data.creator.voiceAuthorized = true;
      data.creator.authorizedAt = now();
      data.creator.licenseVersion++;
      data.creator.policyVersion++;
      audit(
        data,
        { ...actor, role: "admin", fanId: undefined },
        "license.demo.seeded",
        data.creator.id,
        "New fan-first local demo only: seeded fictional adult identity authorization. No real ownership verification or legal consent claimed. Existing creator controls are never reactivated by fan entry.",
      );
    }
    audit(
      data,
      actor,
      "fan.demo.opened",
      actor.fanId!,
      "Separate fan-scoped cookie initialized; studio operator session preserved. Local fictional role selection, not production authentication.",
    );
    return snapshot(data, actor);
  });
}
