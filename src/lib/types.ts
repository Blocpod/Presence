export type Surface = "text" | "voice" | "visual" | "spatial";
export type Role = "creator" | "fan" | "admin";
export type Actor = { role: Role; fanId?: string; workspaceId: string };
export type Creator = {
  id: string;
  name: string;
  age: number;
  occupation: string;
  bio: string;
  identityStatus: "fictional-demo";
  licenseStatus: "pending" | "active" | "revoked";
  licenseVersion: number;
  policyVersion: number;
  authorizedAt: string | null;
  expiresAt: string;
  enabled: boolean;
  surfaces: Surface[];
  memoryEnabled: boolean;
  memoryRetentionDays: number;
  tone: string;
  facts: string[];
  style: string[];
  behavior: string[];
  boundaries: string[];
  relationshipRules: string[];
  appearanceRules: string[];
  voiceRules: string[];
  allowedTopics: string[];
  forbiddenTopics: string[];
  brandEndorsements: boolean;
  pricePerMessageCents: number;
  platformTakeRate: number;
  disclosure: string;
  likenessAuthorized: boolean;
  voiceAuthorized: boolean;
  sourceProvenance: string;
};
export type Fan = {
  id: string;
  name: string;
  age: number;
  initials: string;
  color: string;
  membership: "Essential" | "Plus" | "Patron";
  interests: string[];
  memoryConsent: boolean;
  interactionConsent: boolean;
  surfaces: Surface[];
  monthlyAllowance: number;
};
export type Message = {
  id: string;
  role: "fan" | "ai" | "human" | "system";
  text: string;
  createdAt: string;
  policyVersion: number;
  licenseVersion: number;
  memoryIds: string[];
  blocked?: boolean;
};
export type Session = {
  id: string;
  creatorId: string;
  fanId: string;
  surface: Surface;
  mode: "ai" | "human";
  status: "active" | "revoked";
  createdAt: string;
  updatedAt: string;
  messages: Message[];
};
export type Memory = {
  id: string;
  creatorId: string;
  fanId: string;
  text: string;
  category: "preference" | "milestone";
  source: string;
  confidence: number;
  sensitivity: "ordinary";
  createdAt: string;
  expiresAt: string;
  seeded: boolean;
};
export type MeterEvent = {
  id: string;
  requestId: string;
  sessionId: string;
  fanId: string;
  type: "ai_message" | "human_message";
  surface: Surface;
  units: number;
  amountCents: number;
  creatorCents: number;
  platformCents: number;
  createdAt: string;
  sandbox: true;
};
export type AuditEvent = {
  id: string;
  action: string;
  actor: string;
  target: string;
  detail: string;
  createdAt: string;
};
export type Metrics = {
  activeFans: number;
  sessions: number;
  messages: number;
  aiMessages: number;
  humanMessages: number;
  sandboxRevenueCents: number;
  creatorRevenueCents: number;
  platformRevenueCents: number;
  averageSessionMinutes: number;
  voiceMinutes: number;
  premiumInteractions: number;
  aiHoursDelivered: number;
  creatorHoursSaved: number;
  concurrentRelationships: number;
  memoryCount: number;
  blockedInteractions: number;
};
export type PresenceState = {
  creator: Creator;
  fans: Fan[];
  sessions: Session[];
  memories: Memory[];
  events: MeterEvent[];
  audit: AuditEvent[];
  metrics: Metrics;
  actor: Actor;
  capabilities: {
    provider: string;
    voice: string;
    visual: string;
    spatial: string;
    billing: string;
  };
};
export type CreatorPatch = Partial<
  Pick<
    Creator,
    | "licenseStatus"
    | "enabled"
    | "surfaces"
    | "memoryEnabled"
    | "memoryRetentionDays"
    | "tone"
    | "facts"
    | "style"
    | "behavior"
    | "boundaries"
    | "allowedTopics"
    | "forbiddenTopics"
    | "brandEndorsements"
    | "pricePerMessageCents"
    | "platformTakeRate"
    | "likenessAuthorized"
    | "voiceAuthorized"
  >
>;
