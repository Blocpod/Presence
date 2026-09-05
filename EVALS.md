# PRESENCE evaluation report

Measured 2026-09-05. Release target: a polished, truthful, credential-free local executive demo. This report does not certify a production platform or validate an acquisition thesis.

## Release gates

| Gate                        | Result                           | Evidence                                                                                                                                                                  |
| --------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Optimized build             | PASS                             | Next.js 16.3.4 production build; static UI + dynamic REST runtime                                                                                                         |
| Type integrity              | PASS                             | `npm run typecheck`, strict TypeScript                                                                                                                                    |
| Lint                        | PASS                             | `npm run lint`, zero warnings/errors                                                                                                                                      |
| Runtime/security/voice      | **17/17 PASS**                   | `npm test`; 16 runtime/security cases + browser-voice lifecycle case                                                                                                      |
| Production browser journeys | **7/7 PASS, 32.8s**              | Installed Chrome, optimized local build at 127.0.0.1:3001                                                                                                                 |
| Automated accessibility     | **0 violations in tested views** | Seven desktop pages + mobile conversation; WCAG 2 A/AA + 2.1 AA axe rules; [desktop JSON](docs/ACCESSIBILITY-DESKTOP.json), [mobile JSON](docs/ACCESSIBILITY-MOBILE.json) |
| Independent design          | **86/100**                       | [Scorecard and evidence](docs/DESIGN-REVIEW.md); strong local demo                                                                                                        |
| Package audit               | PASS at install                  | npm reported zero known vulnerabilities; this is point-in-time dependency evidence                                                                                        |

Local environment: macOS arm64, Node 20.18.0, installed Chrome. Node 22 LTS is recommended for current dependency engine support. Browser tests are portable via downloaded Playwright Chromium; CI is configured on Node 22 but remote execution must be confirmed separately.

## What the journeys prove

Explicit fictional identity authorization precedes interaction. Separate fans retrieve separate notes. Saved memory survives reload; deletion and opt-out prevent further retrieval and scrub copied personal content. Existing-session requests recheck policy, license, age/consent and entitlements. Human takeover removes automatic replies and labels operator messages. Duplicate request IDs cannot create duplicate charges. Reusing an ID with different text is refused. Policy checks cover both requests and generated output. Oversized streamed requests are rejected without buffering unbounded bodies.

Across two browser pages, pause and revocation disable an already open conversation; resume permits it again until revoked. Client visibility updates through three-second polling while server enforcement is immediate. Voice defaults silent and optional. Visual remains truthfully labeled as a still portrait. The spatial room renders a real WebGL canvas with graceful unsupported-XR messaging. Switching away disposes the canvas.

The economics calculation is tested using known values and does not double-count retention uplift. All transactions are sandbox events. Composer focus survives two actual polling responses; Escape restores launch-control focus. Mobile navigation, onboarding and conversation work at 390 × 844 without horizontal page overflow or caption overlap. Independent review also checked 375 × 667 voice layout.

See [independent QA](docs/QA-REVIEW.md) and [the executable suite](tests/journeys.spec.ts).

## Measured runtime experiment

[Raw measurement](docs/RUNTIME-MEASUREMENTS.json), reproducible via `scripts/benchmark.mjs` against an active optimized local server:

- 30 sequential text replies across three fan relationships.
- Median loopback HTTP latency **6.18 ms**, p95 **9.75 ms**, maximum **14.17 ms**.
- Exactly **30 delivered replies / 30 sandbox events / $7.50 sandbox gross / $0 real charges**.

These timings include local runtime policy/memory/metering and the deterministic adapter. They exclude external model inference and network distance. This is a smoke experiment, not a concurrency/load test, inference-latency prediction or platform-scale claim. Benchmark workspaces are isolated from the user’s demo workspace.

A warm local browser navigation reported DOMContentLoaded 9.3 ms and load 20.1 ms with 300 transfer bytes (cached response). It is not a cold-page, LCP, Core Web Vitals or mobile-network score and must not be used as marketing performance evidence.

## Product score boundaries

| Area                     | Evidence-backed status                                                                                                                                |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Build integrity          | All four machine gates pass                                                                                                                           |
| Core demo experience     | Seven complete browser journeys pass                                                                                                                  |
| Governed AI behavior     | Deterministic tone/facts, boundary/input/output, memory and revocation cases pass; broad generative quality unmeasured                                |
| Design                   | Independent 86/100, with remaining typography and real-device refinement                                                                              |
| Multimodal continuity    | Identity and relationship memory shared across surfaces; actual cloned voice/live video/headset immersion unverified                                  |
| Economic instrumentation | Exact ledger and scenario arithmetic pass; incremental revenue, retention, willingness to pay and saved human effort remain hypotheses                |
| Integration readiness    | Working local API and documented roles/adapters; actual partner authentication/webhooks/metering integration not connected                            |
| Security/privacy         | Local-demo controls verified; production KYC, SSO, DLP, audit integrity, erasure, retention, abuse ops and distributed enforcement remain pilot gates |

## Known limitations

No real-person license or age verification, external generative model, real payment, cloned voice, synthetic live video, production partner integration or hardware XR was tested. Automated accessibility is not complete WCAG certification; manual assistive technology, actual touch devices, high zoom, browsers and physical audio need further evaluation. SQL storage uses one transactional JSON workspace aggregate; the migration plan does not imply PostgreSQL/RLS already runs. Sensitive-content checks are basic, deletion is logical, and transcript retention requires production design.

No customer study, revenue uplift, retention uplift, moat, acquisition preference or exclusive relationship is claimed. [The acquisition brief](docs/ACQUISITION-BRIEF.md) states testable hypotheses and a controlled pilot path.

## Reproduce

```sh
npm ci
npm run typecheck
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

If testing installed Chrome: `PRESENCE_BROWSER_CHANNEL=chrome npm run test:e2e`. The runner starts a localhost production preview automatically. For the latency smoke experiment start a local server at port 3001 with demo mode enabled, then `node scripts/benchmark.mjs`. Browser-generated evidence is ignored under `output/playwright/`; selected sanitized fictional screenshots and concise machine results are committed under `docs/`.
