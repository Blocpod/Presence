# Decision records

Decisions made 2026-09-05. [RESEARCH.md](RESEARCH.md) records evidence; [ARCHITECTURE.md](ARCHITECTURE.md) describes the implemented system.

## ADR 001 — One modular runtime, multiple surfaces

**Decision:** Build a Next.js 16 / React 19 / TypeScript application with server-owned authorization, policy, relationship memory and metering. Keep provider and renderer boundaries explicit.

**Reason:** The identity and relationship should survive a change from text to voice or spatial rendering. A modular monolith makes that contract testable without a distributed deployment.

**Rejected for this release:** Separate microservices, a custom foundation model and a renderer-owned persona. These add coordination cost before the core product hypothesis is evaluated.

**Consequence:** Production scale and failure isolation require subsequent architecture work; a local application is not evidence of global concurrency capacity.

## ADR 002 — SQLite for a credential-free demonstration

**Decision:** Use a local relational SQLite store for durable demo state. Keep data access server-side and use explicit creator/fan scoping. The preferred pilot destination is PostgreSQL, potentially Supabase.

**Reason:** No hosted database credentials are necessary, while persistence and transactions are demonstrable. SQLite's single-writer constraint is acceptable for this local scope. [SQLite guidance](https://www.sqlite.org/whentouse.html)

**Rejected for this release:** Requiring a Supabase project before the demo can start; browser-only localStorage as authoritative governance state.

**Migration:** Implement PostgreSQL schema and access adapter; map authenticated partner identities; add RLS for every operation and vector query; migrate seeded/demo state only if useful; run cross-tenant negative tests and concurrent revocation/metering tests. No automatic claim of RLS in SQLite.

## ADR 003 — Deterministic responses before paid inference

**Decision:** A credential-free deterministic provider is the default. External model, speech and avatar providers require explicit configuration and a reviewed data flow.

**Reason:** Governance, isolation and demo reproducibility must remain testable without spending or transmitting private material. Provider abstraction supports later quality and cost comparisons.

**Consequence:** The demo does not establish general conversational intelligence, realtime model latency or production moderation performance. Rules and curated replies are intentionally limited.

## ADR 004 — Fictional adult identity and generic browser voice

**Decision:** Mira Vale, 28, and all fans are fictional adults. Voice demonstration uses a generic browser voice, where supported; it is not Mira's cloned voice. Identity/consent records demonstrate a workflow, not verified identity.

**Reason:** A product demonstration needs no unauthorized likeness or biometric collection. A production license must specify media, permitted acts, duration, geography, model/provider use, deletion and revocation handling.

**Consequence:** Creator identity verification, licensing execution, custom speech and photorealistic replicas remain external, credential-dependent integrations.

## ADR 005 — Relational memory first

**Decision:** Store curated low-sensitivity facts with pair scope, timestamps, source and deletion controls. Do not indiscriminately retain inferred sensitive facts. Introduce embeddings only after a retrieval benchmark warrants them.

**Reason:** The first correctness question is whether the right fan sees the right authorized data. Semantic similarity is a ranking technique, not an authorization boundary. [Supabase permission-aware RAG](https://supabase.com/docs/guides/ai/rag-with-permissions)

**Consequence:** Large knowledge bases, automatic extraction, cross-device identity resolution, retention workers and full deletion across external providers are future work.

## ADR 006 — Browser spatial scene with progressive capability

**Decision:** Use a WebGL spatial prototype as an optional renderer. Treat headset sessions and mobile AR as capabilities to detect, not universal features.

**Reason:** WebXR has uneven availability and secure-context/session constraints. [W3C specification](https://www.w3.org/TR/webxr/)

**Consequence:** In-page rendering does not prove headset functionality. Native Vision Pro, Quest and Android XR claims require actual device verification; a capability badge is not a test result.

## ADR 007 — Sandbox ledger and transparent scenarios

**Decision:** Produce sandbox usage events and a separate input-driven economic model. Do not implement real settlement or describe projections as earned revenue.

**Reason:** An incumbent already has payments; the integration question is what authorized, entitled activity it can meter. Simulated unit prices are product assumptions.

**Consequence:** Platform take, creator share and gross opportunity are not profit. Pilot economics must include inference, media transport, hosting, moderation, support, payment fees, refunds and displacement of existing sales.

## ADR 008 — No invented moat

**Decision:** Present the acquisition case as a hypothesis about integration and governed continuity. Competing AI messaging, digital minds, voice and avatars already exist.

**Reason:** A credible diligence package should expose commodity components and identify what needs evidence.

**Consequence:** Acquisition cannot be justified by a novel-looking interface alone. Demonstrate repeatable governance, audited isolation, permission portability and partner integration economics before claiming a defensible asset.

## Fan encounter — 2026-09-05

Choose a portrait-led private encounter, with shared-memory annotation and optional spatial escalation. Rejected a notebook-first UI because it makes memory management dominant; rejected a 3D-first room because it makes the weakest current renderer carry the whole product. Primary-source visual research and the competing directions are in docs/FAN-RESEARCH.md.

Use a separate signed fan cookie and API namespace. Sharing the studio cookie would silently change the role in another open tab. The local-only fan-first bootstrap may provision a new audited fictional demo workspace, but may never reactivate an existing workspace. The operator-only director is an explicit demo affordance, not fan self-service entitlements or takeover.

Retain CSS/native motion and a single measured SVG path; lazy-load Three.js only for Spatial. A heavyweight motion library and automatic audio add cost without improving this encounter. Generic browser voice is opt-in; automatic microphone submission requires a specific fan choice, and capture is canceled on consent/role/policy/visibility changes.

Keep latest authored context visibly continuous across newly authorized surface sessions. Present a clear excerpt affordance for long replies. Preserve pending request IDs across uncertain network failures, verified with a server-committed/browser-aborted response.
