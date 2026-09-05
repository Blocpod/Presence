import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import type {
  Actor,
  AuditEvent,
  Creator,
  Fan,
  Memory,
  MeterEvent,
  Session,
} from "../types";
export type Data = {
  creator: Creator;
  fans: Fan[];
  sessions: Session[];
  memories: Memory[];
  events: MeterEvent[];
  audit: AuditEvent[];
  requests: Record<string, { sessionId: string; text: string }>;
};
let database: Database.Database | undefined;
export const now = () => new Date().toISOString();
export const id = (prefix: string) => `${prefix}-${randomUUID()}`;
const representationRules = {
  relationshipRules: [
    "Retrieve memories only from the current creator-fan relationship",
    "Remember ordinary preferences only with explicit fan opt-in",
    "Never claim exclusive affection or encourage dependence",
    "Keep AI and operator authorship distinct during takeover",
  ],
  appearanceRules: [
    "Use only the generated fictional adult demo portrait",
    "Do not imply live synthetic video or verified real-person likeness",
    "Carry AI disclosure across visual and spatial renderers",
  ],
  voiceRules: [
    "Require active creator voice authorization for voice interactions",
    "Use a generic browser voice; never claim it is Mira’s cloned voice",
    "Stop playback when the session or creator permission is revoked",
  ],
};
export function seed(): Data {
  const createdAt = now();
  const fans: Fan[] = [
    {
      id: "fan-alex",
      name: "Alex Chen",
      age: 29,
      initials: "AC",
      color: "#d7c1a1",
      membership: "Patron",
      interests: ["Kyoto", "Film photography"],
      memoryConsent: true,
      interactionConsent: true,
      surfaces: ["text", "voice", "visual", "spatial"],
      monthlyAllowance: 100,
    },
    {
      id: "fan-jordan",
      name: "Jordan Ellis",
      age: 32,
      initials: "JE",
      color: "#b5c6bc",
      membership: "Plus",
      interests: ["First half marathon", "Travel"],
      memoryConsent: true,
      interactionConsent: true,
      surfaces: ["text", "voice", "visual"],
      monthlyAllowance: 60,
    },
    {
      id: "fan-sam",
      name: "Sam Rivera",
      age: 26,
      initials: "SR",
      color: "#bab8d0",
      membership: "Essential",
      interests: ["Ambient music", "Sound design"],
      memoryConsent: true,
      interactionConsent: true,
      surfaces: ["text"],
      monthlyAllowance: 30,
    },
  ];
  return {
    creator: {
      ...structuredClone(representationRules),
      id: "creator-mira",
      name: "Mira Vale",
      age: 28,
      occupation: "Photographer · storyteller · collector of quiet moments",
      bio: "A fictional travel and music photographer exploring the spaces between cities, light, and sound.",
      identityStatus: "fictional-demo",
      licenseStatus: "pending",
      licenseVersion: 1,
      policyVersion: 1,
      authorizedAt: null,
      expiresAt: new Date(Date.now() + 365 * 864e5).toISOString(),
      enabled: false,
      surfaces: ["text", "voice", "visual", "spatial"],
      memoryEnabled: true,
      memoryRetentionDays: 90,
      tone: "Warm & curious",
      facts: [
        "Fictional adult creator, age 28",
        "Creative focus: travel, film photography, and ambient music",
      ],
      style: [
        "Warm and observant",
        "Specific details, gentle humor",
        "Invite creative reflection",
      ],
      behavior: [
        "Ask thoughtful follow-up questions",
        "Stay within approved creative topics",
      ],
      boundaries: [
        "Never claim to be the human creator",
        "No explicit sexual content",
        "No medical, legal, or financial advice",
        "No exclusive or dependent relationship claims",
        "No unauthorized real-person likenesses",
      ],
      allowedTopics: ["photography", "travel", "music", "creative process"],
      forbiddenTopics: [
        "explicit sexual content",
        "financial advice",
        "medical diagnosis",
        "unauthorized likeness",
      ],
      brandEndorsements: false,
      pricePerMessageCents: 25,
      platformTakeRate: 20,
      disclosure:
        "You are interacting with an AI representation of a fictional adult creator. Local demonstration only.",
      likenessAuthorized: false,
      voiceAuthorized: false,
      sourceProvenance:
        "Fictional identity authored for PRESENCE. Visual asset generated for this demonstration; no real-person verification or voice clone.",
    },
    fans,
    sessions: [],
    events: [],
    requests: {},
    memories: [
      {
        fanId: "fan-alex",
        text: "Planning a Kyoto trip and experimenting with 35mm film photography.",
        category: "preference" as const,
      },
      {
        fanId: "fan-jordan",
        text: "Preparing for a first half marathon and documenting the journey in photos.",
        category: "milestone" as const,
      },
      {
        fanId: "fan-sam",
        text: "Making an ambient music project inspired by late-night city sounds.",
        category: "preference" as const,
      },
    ].map((m) => ({
      ...m,
      id: id("mem"),
      creatorId: "creator-mira",
      source: "Seeded fictional fan preference · demo consent",
      confidence: 1,
      sensitivity: "ordinary" as const,
      createdAt,
      expiresAt: new Date(Date.now() + 90 * 864e5).toISOString(),
      seeded: true,
    })),
    audit: [
      {
        id: id("audit"),
        action: "workspace.created",
        actor: "system",
        target: "creator-mira",
        detail:
          "Isolated local demo workspace with fictional adult identities and seeded consent examples.",
        createdAt,
      },
    ],
  };
}
export function db(): Database.Database {
  if (!database) {
    const filename =
      process.env.PRESENCE_DB_PATH ||
      resolve(process.cwd(), ".data/presence.sqlite");
    if (filename !== ":memory:")
      mkdirSync(dirname(filename), { recursive: true });
    database = new Database(filename);
    database.pragma("journal_mode = WAL");
    database.pragma("busy_timeout = 5000");
    database.exec(
      "CREATE TABLE IF NOT EXISTS workspaces (id TEXT PRIMARY KEY, data TEXT NOT NULL, updated_at TEXT NOT NULL); CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);",
    );
  }
  return database;
}
export function signingSecret(): string {
  const connection = db();
  const value = connection
    .prepare("SELECT value FROM settings WHERE key = ?")
    .get("cookie_secret") as { value: string } | undefined;
  if (value) return value.value;
  const secret = randomUUID() + randomUUID();
  connection
    .prepare("INSERT OR IGNORE INTO settings (key,value) VALUES (?,?)")
    .run("cookie_secret", secret);
  return (
    connection
      .prepare("SELECT value FROM settings WHERE key = ?")
      .get("cookie_secret") as { value: string }
  ).value;
}
export function transact<T>(workspace: string, fn: (data: Data, isNewWorkspace: boolean) => T): T {
  return db().transaction(() => {
    const row = db()
      .prepare("SELECT data FROM workspaces WHERE id = ?")
      .get(workspace) as { data: string } | undefined;
    const data: Data = row ? JSON.parse(row.data) : seed();
    // Additive local schema migration: preserve existing workspaces and their controls.
    data.creator.relationshipRules ??= [...representationRules.relationshipRules];
    data.creator.appearanceRules ??= [...representationRules.appearanceRules];
    data.creator.voiceRules ??= [...representationRules.voiceRules];
    // Expired memory is physically removed before any retrieval.
    const expired = new Set(
      data.memories
        .filter((memory) => Date.parse(memory.expiresAt) <= Date.now())
        .map((memory) => memory.id),
    );
    data.memories = data.memories.filter((memory) => !expired.has(memory.id));
    for (const session of data.sessions)
      for (const message of session.messages)
        if (message.memoryIds.some((memoryId) => expired.has(memoryId))) {
          message.text =
            "[Personalized content removed by memory retention policy.]";
          message.memoryIds = [];
        }
    const result = fn(data, !row);
    db()
      .prepare(
        "INSERT INTO workspaces (id,data,updated_at) VALUES (?,?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data,updated_at=excluded.updated_at",
      )
      .run(workspace, JSON.stringify(data), now());
    return result;
  })();
}
export function audit(
  data: Data,
  actor: Actor,
  action: string,
  target: string,
  detail: string,
) {
  data.audit.unshift({
    id: id("audit"),
    action,
    actor: actor.role === "fan" ? actor.fanId! : actor.role,
    target,
    detail,
    createdAt: now(),
  });
}
