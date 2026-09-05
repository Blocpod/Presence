## Runtime loop — 2026-09-05

**Hypothesis:** A transactional local runtime can prove authorization → interaction → isolated memory → metering → revocation without credentials or real payments.

**Built:** HMAC-signed HttpOnly loopback demo sessions, browser-scoped SQLite persistence, strict role-scoped API, license/permission/consent checks on every interaction, deterministic provider interface, consent-based expiring memory, explicit operator takeover, sandbox ledger with SHA-256 request fingerprints and idempotency, audit events, account-memory deletion.

**Verified:** `node --import tsx --test tests/runtime.test.ts`: 11/11 passed. Coverage includes missing authorization, fan and workspace isolation, permission propagation on existing sessions, expiry/revocation, entitlements, allowance, duplicate-charge prevention including after deletion, takeover provenance, consent/deletion/retention, input and output policy, signed-cookie tampering, same-origin and localhost bootstrap. Targeted ESLint passed. Initial global typecheck showed only unfinished frontend components and no backend errors. `npm test` using the tsx CLI encountered sandbox IPC EPERM; direct Node import runs the same suite successfully.

**Independent review correction:** Security reviewer identified newly forbidden topics could escape through retrieved memory. Added output policy gate before response persistence/metering, plus a regression. Kept after passing.

**Limits:** Rule-based moderation and deterministic creative responses; no verified identity, paid provider, cloned voice, production auth, or production security assertion. Facts/style/freeform boundaries are versioned inspectable configuration; arbitrary natural-language instruction enforcement requires a production policy adapter. AI-hours/creator-time metrics use a 30-second-per-reply illustration, not measured labor.

## Provider and origin correction loop — 2026-09-05

**Hypothesis:** Creator configuration must change observable replies, and the local CSRF boundary must match the real browser origin despite Next.js request URL canonicalization.

**Built:** Four controlled tone families affect all greetings and photography/music response bodies; creator-approved facts power biography answers without invented details. Added inspectable read-only relationship, appearance and voice rules with additive migration of existing workspaces. Added direct-loopback Host origin handling while rejecting remote host mismatches and ignoring forwarding headers. Documented actual JSON-aggregate SQLite storage and the normalized platform migration path in ARCHITECTURE.md.

**Evidence:** Runtime suite now passes 16/16, including tone differentiation, live facts with output policy, immutable representation rules, and canonical localhost/127.0.0.1 CSRF regressions. Previous review also added streaming body-size enforcement. Browser verification of the origin fix belongs to the main integration loop.

## Loop — browser truth and accessibility

Hypothesis: a restrained creator-centered studio makes the authorization→relationship→metering→control chain understandable without narration.

Built: responsive dark-forest/ivory studio, original fictional creator portrait, seven-chapter demo, structured controls, fan memory inspection, text/voice/visual/spatial conversation, takeover, interactive economic model, provider map, audit/export/reset.

Independent browser findings: low contrast, mobile integration grid overflow, portrait-caption overlap, and polling-related modal focus reset. Kept fixes: darker text palette, minimum grid sizing, mobile caption layout, stable close ref/focus trap, inert background, invisible off-canvas sidebar outside mobile navigation. Improved small-screen disclosure typography and prevented pending reply audio after unmount, surface changes or policy revocation.

Evidence: independent dev browser run 7/7; optimized production browser run 7/7 in 32.8s. Axe reports no violations in tested desktop/mobile views. Independent design review 86/100. Real WebGL room renders, mobile canvas resizes, unsupported XR capability is explicit, and exiting removes the canvas. Hardware XR and audio quality remain unverified. Keep.

## Loop — final release integrity and runtime measurement

Hypothesis: transactional local runtime can demonstrate distinct relationships and exact metering without credentials, while keeping provider costs out of the demonstration.

Evidence: production build succeeds; strict typecheck and lint clean; 17/17 runtime/security/voice tests pass. Thirty local deterministic replies across three relationships generated exactly thirty sandbox events ($7.50 gross, zero real charges), median 6.18 ms / p95 9.75 ms loopback HTTP. This is sequential local evidence, not a model/network or load benchmark. Raw measurement in RUNTIME-MEASUREMENTS.json. Keep.

Release package includes original mission, API/architecture, research with primary sources, decision records, acquisition brief, six-minute demo script, privacy/security reviews, evaluation report, roadmap and screenshots. Next experiment: design-partner pilot measuring approval, willingness to pay, policy failures and net incremental contribution margin.
