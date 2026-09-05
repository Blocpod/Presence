# PRESENCE architecture

PRESENCE is a single-node, API-first demonstration of a licensed digital presence. The central execution chain is authorization → governed interaction → isolated memory → sandbox metering → creator control. A Next.js application renders the creator studio and fan preview; a Node.js runtime owns the domain and database. It works without credentials or external inference.

## Components and ownership

| Component | Implementation | Responsibility |
|---|---|---|
| Creator and fan UI | `src/components/studio.tsx` | Onboarding, versioned creator controls, relationship memory, conversation, takeover, usage and economics |
| Surface renderers | `src/lib/voice.ts`, `src/components/spatial-stage.tsx` | Browser voice and interactive 3D; same governed session and fan memory |
| API | `src/app/api/v1/[...path]/route.ts` | JSON routes, strict validation, signed-session identification, same-origin mutation boundary |
| Authentication boundary | `src/lib/server/auth.ts` | Local-only role bootstrap, HttpOnly HMAC cookie, eight-hour expiry, workspace scope |
| Runtime | `src/lib/server/runtime.ts` | Authorization, role checks, entitlements, input/output policy, relationships, takeover, ledger and audit |
| Provider seam | `src/lib/server/provider.ts` | Typed `PresenceProvider.generate(context)` interface and deterministic local adapter |
| Persistence | `src/lib/server/store.ts` | SQLite transactions, workspace state, seed fixtures, retention, local signing material |
| Shared API contract | `src/lib/types.ts`, `docs/API.md` | Creator, fan, session, memory, metering and response definitions |

## Actual storage model

SQLite is used as an embedded durable store, through `better-sqlite3`. The database is `.data/presence.sqlite` unless `PRESENCE_DB_PATH` is configured. WAL and a 5-second busy timeout are enabled. The schema currently has **two tables**, not a normalized relationship database:

- `workspaces(id TEXT PRIMARY KEY, data TEXT NOT NULL, updated_at TEXT NOT NULL)`: each row contains a serialized JSON aggregate for one browser demo workspace.
- `settings(key TEXT PRIMARY KEY, value TEXT NOT NULL)`: local cookie-signing material generated on first use.

The workspace aggregate contains one creator, three fictional adult fans, sessions and authored messages, relationship memories, sandbox metering events, audit events, and request-id fingerprints. These arrays encode relational references (`creatorId`, `fanId`, `sessionId`, `memoryIds`) in application data. SQLite foreign keys and per-entity indexes are **not** implemented. Application functions enforce access and reference checks.

Each read or mutation runs through a synchronous database transaction: load the aggregate, apply additive defaults and memory expiry, execute domain logic, serialize the aggregate, and upsert the workspace row. Provider generation is currently synchronous and local, so a successful response, message, metering event, idempotency record and audit event commit together. Throwing rolls back the operation. This gives a useful single-node consistency boundary; it also means full aggregate parsing/rewriting and synchronous work limit throughput. Reads can write because they perform retention cleanup. This is intentionally a local demo design, not an OnlyFans-scale storage claim.

Browser role changes retain a workspace identifier. A new cookie-less browser receives a new workspace; it cannot enumerate another workspace through API parameters. Local role switching is an executive-demo convenience and does not establish real creator ownership. Seeded fan consent and memories are fictional examples, never verified real consent.

## Governed interaction flow

1. The API verifies the signed cookie and scopes the actor to a workspace. Mutations require an exact same-origin header. Direct loopback `Host` handles Next.js canonicalizing `127.0.0.1` to `localhost`; arbitrary forwarding headers are not trusted. Demo cookie minting is loopback-only and requires explicit enablement in production mode.
2. Domain access checks prevent a fan from reading or changing another fan's relationship, creator controls, takeover, or membership permissions.
3. Every session creation and interaction checks active license, expiry, creator availability, likeness permission, fan adult status and participation consent, enabled surface, surface entitlement, and voice permission where applicable. Revoked sessions cannot be revived; reauthorization permits new sessions.
4. Input moderation checks immutable demo boundaries, configured forbidden topics and brand permission. The adapter is deliberately basic pattern matching. Creator facts, tone and structured behavior remain separate; arbitrary prose boundaries are inspectable configuration rather than a complete policy language.
5. When AI is active, retrieval selects only memories matching both the session creator and fan, and only with creator memory enabled and fan opt-in. Memory has provenance, confidence, sensitivity, creation and expiry metadata. Nothing is silently extracted from conversation.
6. The provider generates a deterministic creative response. It selects controlled warm, calm, curious or reflective phrasing and reads current approved facts for biographical requests. Generated output is policy-checked again before persistence or billing, so a newly forbidden topic cannot escape through saved memory or creator facts.
7. A successful AI or operator response creates a sandbox usage event. SHA-256 input fingerprints plus actor-scoped request IDs prevent duplicate billing and reject reuse for different content. Prices are demonstration units, not real transactions. Richer surface replies are 2× base; human operator replies 4×. Voice is not billed by minute.
8. Every message records its author role, license version, policy version and retrieved memory identifiers. An explicit takeover pauses AI responses. A fan message while human mode is active queues without an automated answer; only an operator submission creates a human-authored message.

## Identity and surface continuity

Text, voice, visual and spatial sessions share the same creator model and isolated relationship state. Rendering is kept outside provider orchestration. Voice uses browser capabilities, not a cloned creator voice. Visual mode animates a generated fictional portrait, not live synthetic video. Spatial mode is a browser 3D concept, with device capability-dependent WebXR behavior. These are replaceable surface adapters; no headset certification or production real-time avatar infrastructure is claimed.

Creator authorization records include fictional identity status, likeness and voice consent, license version/expiry/revocation, source provenance and immutable disclosure. Read-only relationship, appearance and voice rules make representation constraints inspectable. Runtime and renderer checks implement the applicable concrete controls; natural-language rules alone do not guarantee enforcement. HMAC cookie signatures protect local session integrity; they are not cryptographic likeness provenance or real-world ownership verification.

## Privacy and deletion

Saved memory requires explicit fan opt-in and creator permission. Individual deletion removes the saved note and redacts responses that cite its memory ID. Account-memory deletion or opt-out removes all relationship memories and retained conversation content. Usage ledger records retain only identifiers and amounts; idempotency retains content hashes, never submitted text. Expired memories and dependent response copies are removed before retrieval. Retention cleanup occurs on workspace access; there is no background purge worker. Host files, WAL, backups and hashes require a production erasure policy; local logical deletion is not a promise of forensic disk erasure.

The demo database and signing material are ignored by Git. No external provider is enabled. A non-demo provider setting fails closed; implementing a paid inference adapter requires explicit configuration and review. Browser speech recognition may use the browser vendor's services and is separately disclosed in the interface.

## Migration to a platform pilot

Keep the API and provider boundary, and replace the internals in stages:

1. Add a versioned migration runner and normalize creator licenses, creator configurations, platform identities, fan consents, sessions, messages, memories, usage events and audit events into PostgreSQL tables. Preserve workspace/platform tenant keys, add foreign keys and compound relationship indexes, and enforce row-level tenant policies. Current additive defaults only migrate newly introduced read-only presentation fields; they are not a general schema migration system.
2. Replace local role bootstrap with platform-issued authentication and server-to-server authorization. Map verified platform age/ownership/consent evidence to explicit expiring permission records. Add revocation distribution, administrator separation, rate limits and operational audit retention.
3. Make provider orchestration asynchronous. Reserve a request with a unique `(tenant, actor, requestId)` constraint, authorize immediately before dispatch, and recheck license/policy before releasing output. Use an outbox and idempotent platform billing callbacks; do not hold a database transaction across a network inference call.
4. Add realtime delivery, session leases and distributed revocation. Measure actual voice duration and delivery acknowledgments before introducing time-based billing. Replace illustrative 30-second-per-AI-reply effort estimates with validated measurements.
5. Add reviewed inference, speech and avatar adapters only behind explicit configuration, budgets, consent and contractual rights. Add output classifiers, adversarial evaluations, provenance attestations, encryption/backup/erasure controls, monitoring and incident response.
6. Validate data minimization and usefulness of persistent memory with consenting pilot participants before adding semantic retrieval or more sensitive relationship attributes.

The extension path is platform integration: the incumbent keeps distribution, identity verification, subscriptions and checkout; PRESENCE supplies the governed presence runtime, representation controls, scoped relationship context and auditable usage events.
