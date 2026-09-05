# PRESENCE research ledger

Research checked 2026-09-05. Primary vendor documentation is evidence of a vendor's published offering, not independent proof of its performance or our integration. Prices are USD public snapshots, exclude taxes and negotiated terms, and must be reconfirmed before procurement. No provider was purchased or authenticated during this research.

## Confirmed facts: competitive landscape

| Offering | Published capability | Implication for PRESENCE |
| --- | --- | --- |
| Fanvue | Creator-personality-based message generation, replies, rewriting, summaries and a creator agent are described in its current help center. Reply rollout is gradual. | A creator dashboard, tone controls and personalized AI messaging are already competitive features. Do not claim novelty for these alone. [Fanvue documentation](https://help.fanvue.com/en/articles/16237836-ai-messaging-reply-faster-chat-smarter) |
| Fanvue voice | Fanvue describes AI and live calls with a distinction shown to fans. | AI-to-human escalation and disclosed voice are competitive requirements. [Fanvue voice article](https://landing.fanvue.com/blog/the-rise-of-ai-voice-calls-for-creators) |
| Delphi | Personal digital minds ingest creator material and provide voice/chat; embedding, workflows and API availability vary by plan. | Identity-oriented assistants and knowledge ingestion are established products. [Delphi pricing and product overview](https://www.delphi.ai/pricing) |
| Tavus | CVI combines a persona and replica in managed WebRTC conversations. Its pricing page also advertises memories, guardrails and tools. | Buy rendering/transport where appropriate. Governance and memory cannot be described as absent from competitors. [CVI overview](https://docs.tavus.io/sections/conversational-video-interface/overview-cvi), [Tavus pricing](https://www.tavus.io/pricing) |
| HeyGen LiveAvatar | Real-time avatars support a managed voice stack or an avatar-only integration using the customer's voice stack. | A replaceable visual provider is feasible; photorealistic rendering is not the core asset we should train ourselves. [LiveAvatar](https://www.liveavatar.com/) |

The reviewed pages do not establish whether any competitor offers every element of PRESENCE's proposed licensing, relationship-isolation and incumbent-integration model. Absence from marketing pages is not evidence of absence in the product. No OnlyFans partnership, acquisition interest, API access or product roadmap was verified.

## Confirmed facts: build versus buy

| Layer | Public cost evidence | Decision and caveat |
| --- | --- | --- |
| Deterministic demo | No external inference requests or paid providers required. | Build locally to test governance and UX. Local compute still has a cost; zero API spend is not zero total cost. |
| Delphi | Free; Builder $79/month; Scaler $299/month; Immortal custom pricing with API access listed. | Useful product benchmark, not an assumed wholesale runtime contract. [Pricing](https://www.delphi.ai/pricing) |
| Tavus CVI | Public page lists Free, $22 Starter, $59 Builder and $397 Growth in one current section, but also contains older tier/allowance blocks. | Consider managed video; obtain a written current quote. Conflicting included minutes and concurrency prevent a reliable blended unit-cost comparison from this page alone. [Pricing](https://www.tavus.io/pricing) |
| LiveAvatar | Current product page lists $19/200 credits, $99/1,100 credits and $475/6,000 credits monthly. | Price mode, credits, overages and voice-stack costs separately. Older official help articles show different allowances; the lowest enterprise headline is not our achievable rate. [Current product page](https://www.liveavatar.com/), [Help pricing](https://help.heygen.com/en/articles/10035615-how-to-get-started-with-liveavatar) |
| OpenAI realtime | The `gpt-realtime` model page lists audio input $32 and output $64 per million tokens; text input $4 and output $16, with separate cached rates. | Candidate voice provider, not enabled. A cost per conversation minute requires actual token mix, context growth and duty-cycle measurements. [Model card](https://developers.openai.com/api/docs/models/gpt-realtime) |

Compare providers on a consented, identical conversation suite: time to first audio/frame, interruption recovery, persona adherence, policy violation rate, concurrency limits, end-to-end cost, retention/deletion guarantees, export rights and permitted content. Published vendor latency is not a measured PRESENCE result. Custom model training, voice cloning and avatar training are outside this prototype.

## Confirmed facts: architecture inputs

- **Web application:** Next.js 16 supports modern React features and requires Node 20.9 or newer. Its build no longer runs lint automatically; lint must be an explicit release check. [Next.js 16](https://nextjs.org/blog/next-16)
- **Durable local storage:** SQLite is appropriate for local applications with modest write concurrency. A database file allows one writer at a time; multiple app servers and heavy concurrent writes justify a client/server database. [SQLite guidance](https://www.sqlite.org/whentouse.html)
- **Relational and vector memory:** Supabase supports pgvector with PostgreSQL row-level security, including filtering similarity results by access rights. A vector match does not grant access. Use creator/fan/tenant scope before retrieval and enforce authorization at the database as defense in depth. [RAG with permissions](https://supabase.com/docs/guides/ai/rag-with-permissions)
- **Realtime audio:** OpenAI's realtime model supports WebRTC, WebSocket and SIP; video output is not supported by that model. [Model card](https://developers.openai.com/api/docs/models/gpt-realtime)
- **Spatial:** WebXR exposes support checks and session requests in secure contexts. A positive support check is advisory; session creation can still fail. [W3C WebXR specification](https://www.w3.org/TR/webxr/)
- **Apple:** Safari on visionOS 2 introduced `immersive-vr`, rendered through WebGL. This is not proof of universal mobile AR support or of testing our app on a headset. [WebKit release details](https://webkit.org/blog/15865/webkit-features-in-safari-18-0/)
- **Compatibility:** WebXR remains unavailable in some major browsers. Keep an in-page spatial scene and ordinary text controls usable when XR is unsupported or permission is denied. [MDN compatibility](https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API)

## Confirmed facts: provenance and rights context

C2PA defines tamper-evident asset provenance using signed manifests. It is not, by itself, a likeness license, verification of a person's age, or proof that a statement is true. PRESENCE's local authorization/audit records are not C2PA-signed credentials. A future integration must bind a validated manifest to the actual licensed asset and revocable authorization record. [C2PA specification](https://spec.c2pa.org/specifications/specifications/2.2/specs/C2PA_Specification)

The U.S. Copyright Office's digital replica work addresses unauthorized replicas and recommends federal protection. The report is not itself an enacted nationwide license framework. The European Commission describes Article 50 rules for AI interaction disclosure and synthetic-content transparency, with obligations depending on the actor and content. These sources justify treating authorization and disclosure as product requirements; they do not certify compliance. Real deployment needs jurisdiction-specific review of likeness, voice, contracts, privacy, age assurance and platform rules. [U.S. Copyright Office](https://www.copyright.gov/ai/), [European Commission](https://digital-strategy.ec.europa.eu/en/factpages/quick-facts-transparency-rules-ai-systems)

## Assumptions

1. An incumbent partner can supply authenticated creator/fan IDs, age assurance, entitlements and payment settlement through an agreed contract. No such integration exists yet.
2. Fictional Mira Vale, age 28, plus fictional adult fans are sufficient to evaluate the demo. Approval records are simulated authorization, not real identity verification.
3. Explicit opt-in memory and visible AI status improve trust enough to justify their interaction cost. This requires user research.
4. A modular monolith provides a faster testable runtime than premature microservices. SQLite is a deliberate demo choice, not the proposed platform-scale datastore.

## Hypotheses, not established moats

| Hypothesis | Falsifiable experiment |
| --- | --- |
| Governed interaction increases useful creator availability. | Compare approved resolutions per creator minute in a consented pilot, including escalation and correction time. |
| Pair-specific memory improves return-session usefulness. | Randomize consented memory availability; measure rated relevance, opt-out/deletion and repeat-use against control. |
| Platforms prefer to license this layer. | Have partner engineering teams estimate integration and internal replication effort against the same acceptance tests. No outreach is authorized by the build task. |
| Portable authorization and governance are defensible. | Demonstrate the same policy, revocation and relationship across two independent provider adapters and a partner sandbox. Measure migration effort. |

## Experimental results

No live provider benchmark, customer study, revenue experiment or headset test was executed by this research workstream. Prototype verification results belong in [EVALS.md](EVALS.md) and [docs/BUILD-LOG.md](docs/BUILD-LOG.md), with commands, dates, environments and limitations. Seed data and financial sliders are never market evidence.
