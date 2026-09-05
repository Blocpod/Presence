# Project state — 2026-09-05

PRESENCE 0.1.0 is a working, polished **local executive demonstration** in the Blocpod/Presence repository. This is the initial mission delivery, not a production launch.

## Exists and works

- Responsive creator studio with overview, personality/license controls, isolated fan memories, live-session preview, revenue model, provider/integration map and audit/export/reset.
- Explicit fictional adult creator activation, expiration, permission changes, pause and license revocation. Every interaction is checked on the server.
- Three distinct fan histories, persistent SQLite workspace storage, opt-in memory, per-note and per-fan deletion, expiry, content provenance.
- Governed deterministic text responses with creator tone/facts, generic browser speech/dictation, still portrait renderer, interactive WebGL room and capability-detected WebXR entry.
- Clearly labeled creator takeover, no automatic AI replies in human mode, sandbox entitlements and deduplicated metering.
- Seven-chapter executive walkthrough and interactive acquisition economics; actual ledger and speculative value are separate.
- Build/type/lint, runtime/security tests and independent browser/accessibility checks. See EVALS.md and docs/QA-REVIEW.md for exact results.

## Known limitations / no hidden unfinished claims

Conversation uses deterministic local generation. Browser voice is not a licensed clone; microphone transcription may use the browser vendor. Visual is a still image in a 3D room, not a photoreal realtime human. Real headset/microphone/speaker quality depends on hardware. Role/identity verification is explicitly fictional and local. Storage is a SQLite JSON aggregate per workspace, not normalized PostgreSQL or multi-node infrastructure. SSE/WebSockets, partner SSO, real verification, cloud model/avatar integrations, webhooks and real billing are not deployed. Basic filters, logical deletion and an unbounded-by-time transcript require hardening for real personal data. No real-person or platform partnership is claimed.

## Fan experience added

The fan now has a dedicated portrait-led mobile experience at `/presence/mira`; `/studio` and `/demo` expose both sides. Same workspace, separate signed roles. Voice is optional, memory follows every surface, Visual reveals writing on intent, Spatial replaces the portrait with an architectural room, and human arrival preserves clear operator authorship. Creator pause, revocation and entitlements propagate through the actual runtime. See docs/FAN-EXPERIENCE.md and docs/FAN-DESIGN-REVIEW.md for the product thesis, three design loops and honest scoring.

## Current work

The current brand palette is graphite, porcelain and restrained blue, replacing the initial olive/sage direction following user feedback.

Fan release verification is complete: 22 runtime/voice tests, 19 production browser journeys and14 automated accessibility scans pass. Independent final design review scores 91.4/100; the 95+ target is not claimed. EVALS.md and docs/FAN-DESIGN-REVIEW.md record the evidence and remaining qualitative refinement. No production systems or paid APIs are involved.

## Next highest-leverage work

Run a design-partner pilot to measure creator approval, fan willingness to pay and net incremental margin. Then connect authenticated platform identity and a reviewed model/voice provider behind the existing runtime gates, normalize PostgreSQL storage with RLS, and evaluate privacy and policy enforcement with real permissions. Do not confuse the deterministic benchmark or annual scenario with product-market evidence.

## Resume

Read README.md → ARCHITECTURE.md → EVALS.md → ROADMAP.md. Start locally with `npm ci`, `.env.example` → `.env.local`, `npm run dev`. Database in `.data/` is ignored. Do not publish it, browser cookies, or private runtime exports.
