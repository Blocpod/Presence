# Local Presence runtime API

The API lives at `/api/v1`. This is a fictional, credential-free local integration demonstration. It is not a production identity or payment service. Every response uses `Cache-Control: no-store, private`. The browser cookie is HttpOnly, SameSite=Strict, HMAC signed, expires in eight hours, and scopes data to an independent SQLite workspace. Role selection is a local demonstration affordance, not verified identity.

All mutations require the exact same `Origin` as the direct request host (with an explicit localhost/127.0.0.1 canonicalization accommodation for Next.js and no trust in forwarding headers); POST/PATCH also require `Content-Type: application/json`. Bodies are limited to 16 KiB. Validation errors return `{error, issues?}` with 400; unauthenticated 401, denied 403, missing 404, idempotency collision 409.

| Method | Path | Body / behavior |
|---|---|---|
| POST | `/demo` | `{role: 'creator'|'fan'|'admin', fanId?}`; mints signed cookie on loopback hosts only. Production mode additionally requires `PRESENCE_ENABLE_LOCAL_DEMO=true`. Switching roles preserves the current workspace. |
| GET | `/state` | Complete role-scoped state; fans see only their relationship. |
| PATCH | `/creator` | Validated `CreatorPatch`; operator only. Initial activation requires `{licenseStatus:'active',likenessAuthorized:true,enabled:true}`. `voiceAuthorized:true` enables voice consent. |
| POST | `/sessions` | `{fanId,surface:'text'|'voice'|'visual'|'spatial'}`; returns state plus `sessionId`. |
| POST | `/sessions/:id/messages` | `{text,requestId}`; idempotent, bounded message. Operator in AI mode simulates the fan. Operator in human mode writes an explicitly human-authored message. Fan in human mode queues a message without an AI reply. |
| POST | `/sessions/:id/takeover` | `{mode:'human'|'ai'}`; operator only. |
| PATCH | `/fans/:id` | `{memoryConsent?,interactionConsent?}`; fan self-service or operator. `{surfaces?,membership?}` requires operator. Memory opt-out deletes saved memory and retained conversation content. |
| POST | `/memories` | `{fanId,text}`; explicit ordinary creative preference, consent required, at most 20 per fan. |
| DELETE | `/memories/:id` | Deletes saved note and redacts messages that retrieved it. |
| DELETE | `/fans/:id/memories` | Deletes all relationship memory and redacts retained conversation content. Billing identifiers remain, with no message text. |
| POST | `/reset` | `{}`; operator-only reset of this workspace. |

All successful mutations return `PresenceState` (`src/lib/types.ts`). Fans: `fan-alex`, `fan-jordan`, `fan-sam`. Creator: `creator-mira`. `platformTakeRate` is percent (20), prices are integer cents. Sandbox metering: text = configured base price, richer surfaces = 2×, operator message = 4×. These are per-message demo products; **no time-based voice charge occurs**. Voice minutes derive from session elapsed time and AI time/hours saved are explicitly 30-second-per-reply illustrative estimates, not measured creator labor. The UI must label these distinctions.

Every interaction checks active license, expiry, enabled state, surface permission, voice authorization, fan adult status/consent, membership entitlement, and revoked session status before provider execution. Every generated response stores the current license and policy versions plus only its own relationship’s memory references. Revocation permanently invalidates existing sessions; reauthorization permits new sessions. Dynamic forbidden topics and brand permission are enforced by the local policy adapter, alongside non-removable baseline boundaries. Moderation is deterministic pattern matching; it is not production abuse prevention. Creator tone selects controlled warm, calm, curious or reflective response patterns, and biography requests use current creator-approved facts. Style, behavior and freeform boundaries are inspectable configuration; the demo response adapter implements a deliberately limited creative-topic vocabulary rather than arbitrary custom instruction execution. Read-only relationshipRules, appearanceRules and voiceRules expose representation constraints.

SQLite stores each workspace atomically in one transaction, so generation and sandbox ledger writes cannot partially commit. Idempotency keys are scoped by actor and compared with SHA-256 content fingerprints, never the original request text. Physical memory expiry runs before every read/write and removes personalized response copies. Database backups and host-level erasure require operational policies before deployment. Cookie signing material is generated locally in the ignored database, never checked into Git. `PRESENCE_DB_PATH` selects storage; default `.data/presence.sqlite`.

`PresenceProvider` is a replaceable server-side interface. Default deterministic mode makes no network calls. Any `PRESENCE_PROVIDER` other than `demo` fails closed until an explicitly configured and reviewed adapter is implemented. Browser voice, animated portrait, and browser 3D are renderer demonstrations, not cloned voice, real-time synthetic video, or verified headset support. The API itself makes no external provider calls and cannot spend money.
