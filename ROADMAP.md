# Roadmap and release gates

Dates and effort estimates are intentionally omitted until owners, partner scope and provider access are agreed. Each phase exits on evidence, not visual completeness.

## Local demonstration

Deliver the authorization → interaction → memory → metering → creator-control chain with fictional adult identities and no credentials. Run typecheck, lint, tests, production build and desktop/mobile browser journeys. Independently review UX and security findings. Preserve command results and screenshots in the evaluation/build records. Current completion status is in [STATE.md](STATE.md).

**Exit:** Required local journeys pass, every simulated feature is labeled, no secrets are committed, the repository has reproducible setup, and known limitations are documented. This is a local-demo gate, not production approval.

## Consented pilot

1. Obtain explicit approval for selected providers, paid usage budget, licenses, partner environment and data processing terms.
2. Integrate authenticated creator/fan identities and real age-assurance claims. Replace the demo role selector with access control; verify each request's scope.
3. Migrate storage to PostgreSQL/Supabase with tenant-aware RLS, migration tests, encrypted backups and restore tests. Add embedding retrieval only against a relevance and isolation benchmark.
4. Integrate one text/voice provider and one visual provider using server-issued scoped sessions. Re-check authorization before output and cancel in-flight media on revocation/takeover.
5. Add bounded usage reservations, idempotency, reconciliation and a partner payment sandbox. Keep real settlement separately authorized.
6. Run a limited, consented creator/fan study with clearly disclosed AI, memory controls, support and incident procedures.

**Exit:** Measured usefulness and latency, no unresolved critical isolation/disclosure defects, creator-approved response quality, validated deletion propagation and fully loaded unit-cost data. Establish a control group before claiming incremental revenue or retention.

## Production readiness

Implement platform SSO/roles, key rotation, durable rate limiting, abuse detection, formal audit retention, signed authorization/asset provenance, consent lifecycle, jurisdiction-specific review, provider termination/export procedures, incident response, observability, SLOs and disaster recovery. Perform independent penetration and privacy reviews. Add accessible speech interruption and device-specific XR testing.

**Exit:** Named service owners approve the security/privacy evidence, production contracts and budgets exist, restore and revocation drills pass, and operations can support harmed or confused users. No local security test substitutes for this gate.

## Platform scale and portable presence

Partition relationship data by tenant and creator, isolate queues and provider budgets, introduce event-driven revocation invalidation, regional data placement and capacity planning. Validate performance with realistic fan distributions and bursty usage; do not extrapolate from sequential local tests. Add a second independent provider to prove portability and avoid renderer-owned memory. Integrate another host surface through the same runtime contract.

**Exit:** Load/failover tests satisfy negotiated SLOs, partner integration cost is measured, and portable authorization, memory deletion and metering semantics remain correct across providers and surfaces.

## Credential-dependent work ledger

| Dependency | Needed before activation |
| --- | --- |
| Hosted PostgreSQL/Supabase | Approved project, credentials, region, retention and backup policy |
| Live LLM/realtime voice | Approved account/key, budget cap, content policy, data-use terms and evaluation corpus |
| Tavus/LiveAvatar/custom voice | Approved account, model/asset rights, consented training assets, written current pricing and deletion contract |
| Real creator verification | Chosen verification provider, legal basis, retention policy and authenticated callback contract |
| Incumbent platform | Authorized sandbox, signed identity/entitlement contract and integration owner |
| Production payments | Separately approved settlement integration, reconciliation and refund policy |
| Headset/mobile AR | Physical supported devices, HTTPS environment and explicit session-permission testing |

No secret values belong in this repository. A placeholder environment variable is not an implemented provider integration.
