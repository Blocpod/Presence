# Security review — local demonstration

Reviewed 2026-09-05 by a separate agent from the runtime author. This is a source and local-test review, not a penetration test, compliance attestation or production security certification. The intended environment is a single locally bound application containing fictional adult data. Do not expose this demo as a service for real users.

## Trust boundary

The browser is untrusted for workspace, role, fan, entitlement and policy decisions. A server-signed demo cookie identifies a workspace and selected role. The runtime reads the authoritative SQLite state and checks access before returning fan data or changing sessions. Creator/admin roles intentionally see all fictional relationships in their own workspace.

The local role selector intentionally lets anyone using the same browser select creator, admin or a seeded fan. It is a demonstration mechanism, not login, ownership verification, age verification or separation between real people sharing a device. Switching a role in one tab changes the shared origin cookie for other tabs. A fresh cookie workspace is isolated from other workspaces by server queries; possession of a valid workspace cookie grants its stated demo role.

## Implemented protections

| Boundary | Actual implementation |
| --- | --- |
| Session integrity | HMAC-SHA256 cookie signatures, constant-time signature comparison, eight-hour signed expiry, HttpOnly, SameSite=Strict, Secure when served over HTTPS. The signing secret is randomly generated and persisted in the local database. |
| Demo bootstrap | Localhost/loopback URL restriction. Production mode additionally requires explicit `PRESENCE_ENABLE_LOCAL_DEMO=true` for bootstrap. Development/start scripts bind to `127.0.0.1`. These are local-preview controls, not trusted upstream identity. |
| Cross-site mutations | Non-GET requests require an exact matching Origin and reject Sec-Fetch-Site cross-site. JSON is required for POST/PATCH. The API exposes no CORS grant. |
| Read/write authorization | Fans are limited to their signed fan ID; creator/admin changes require an operator role. Session ownership is checked server-side. Workspace IDs come from signed cookies, not request bodies. |
| Memory isolation | Retrieval filters both creator and fan; fan snapshots filter sessions, memory, ledger and audit. SQLite access uses bound parameters. No vector retrieval or PostgreSQL RLS is implemented. |
| Authorization lifecycle | Every session creation and message rechecks presence availability, active/nonexpired likeness license, participation consent, surface permission and fan entitlement. Voice additionally checks voice permission. Revocation marks sessions revoked. |
| Takeover | An operator can enter explicit human mode. Fan messages in that mode do not trigger automatic AI replies. Human/operator authorship is retained. |
| Policy | Deterministic input checks and an output check prevent matched prohibited topics from being delivered or billed. Policy/license versions accompany messages. These keyword rules are not semantic moderation. |
| Usage integrity | Message, request record and sandbox meter update occur inside one SQLite transaction. Actor-scoped request IDs deduplicate retries; reuse for different text/session conflicts. No real payment provider exists. |
| Validation | Zod strict schemas reject unknown fields and bound common strings, lists, prices and retention. The JSON reader counts bytes incrementally, cancels the stream above 16 KiB, and rejects invalid UTF-8/JSON; it does not rely solely on Content-Length. |
| Response handling | Private no-store API responses, nosniff, generic unexpected-error response. UI text uses React rendering rather than interpreting stored text as HTML. |

## Independent findings and disposition

**P1 — Forbidden content could re-enter through saved memory: fixed and regression-tested.** Initially the runtime checked only submitted text. Saving a Kyoto preference, forbidding Kyoto, and asking what was remembered produced an AI answer containing Kyoto and a meter event. The runtime author added a provider-output check before answer storage and metering. The regression now verifies a blocked reply and no charge. This demonstrates why controls must apply to retrieved context and output, not only the chat input.

**P2 — Full-body buffering before size validation: fixed and regression-tested.** The initial route checked Content-Length, called `request.text()`, then checked string length. An omitted or misleading length allowed allocation before rejection. The runtime author added a bounded streaming byte reader; the new regression verifies oversized content without Content-Length is rejected and its stream cancelled. Network-stack buffers and timeouts remain deployment concerns.

**P2 — Sensitivity and freeform-policy claims exceed keyword enforcement: product limitation.** The memory filter can miss sensitive text without its chosen keywords. Editable facts/style/behavior/boundaries are structured configuration but the deterministic adapter does not interpret arbitrary natural-language instructions. UI/documentation must disclose these limits and permit only fictional creative data in the demo. A growing regex is not a complete privacy or policy solution.

## Evidence

The independent harness exercised actual runtime functions against `/tmp/presence-security-review.sqlite`: cross-fan session access rejected with 403; Jordan's snapshot excluded Alex's new memory; a duplicate message request did not duplicate its event; pause blocked the next message with 403; absent/foreign Origin rejected with 403; a nonlocal demo host rejected with 403; a modified signed cookie was rejected; account memory deletion scrubbed retained conversation text. The original output-policy bypass was reproduced before the fix.

After both fixes, `node --import tsx --test tests/*.test.ts` independently passed **12/12** local backend tests. This command used Node 20.18.0 in the review environment. Those tests cover initial authorization, separate relationships, role/workspace scope, revocation/expiry/consent, entitlements, idempotency, takeover, deletion/retention, unsafe input, cookie integrity, retrieved-output policy and bounded body reading. These are runtime tests, not evidence of live network, browser, headset or external-provider security. The release-wide latest results are in [EVALS.md](EVALS.md) and [docs/BUILD-LOG.md](docs/BUILD-LOG.md).

## Production blockers

- Replace open demo role selection with authenticated platform identities and verified authorization/age claims. Add real session lifecycle, logout/revocation, key rotation and device/account controls.
- Move secrets to an approved secret store. Protect database/backups with appropriate encryption and OS/service permissions. A user with database access can obtain the signing secret and stored data.
- Add durable rate limits, bounded total sessions/messages/events/request history, request timeouts and usage reservations. Current sandbox allowance limits successful AI interactions, not all resource creation.
- Replace per-workspace JSON storage with a scalable relational model, enforce tenant access in PostgreSQL/RLS, test concurrent state changes and backups/restores.
- Add cancellation and revocation delivery across browser tabs, WebRTC/provider sessions and in-flight model calls. A next-request check cannot retract already delivered text or guarantee immediate remote media cancellation.
- Add moderation suitable to the actual product policy, output-provider failure handling, safety evaluation, abuse reporting and human review. Default deterministic answers are not general-purpose red-team evidence.
- Execute retention/deletion across transcripts, request hashes, logs, backups and external providers; add periodic expiry jobs and audited deletion outcomes.
- Establish threat monitoring, incident response, tested recovery, security headers/CSP appropriate to the media integrations, penetration testing and legal/privacy review before public use.

No production deployment, external secret review, identity-provider evaluation, load test or commercial-provider security verification was performed by this review.
