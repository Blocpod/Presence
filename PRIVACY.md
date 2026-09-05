# Privacy model — fictional local demo

PRESENCE currently uses fictional adults: creator Mira Vale, 28, and seeded adult fans. The identity/age/consent labels are examples, not evidence that a real person was verified or granted a legal license. Do not enter real personal information, identity documents, financial details, sensitive attributes, private fan histories or unlicensed voice/likeness assets.

## What is stored

The local SQLite database defaults to `.data/presence.sqlite` (configurable with `PRESENCE_DB_PATH`). It contains workspace state as JSON: creator configuration and authorization versions; fictional fan profiles and consent flags; session/message content; saved memories; sandbox usage events; audit events; idempotency request IDs and message hashes. A settings table stores the demo-cookie signing secret. SQLite may create journal/WAL companion files. Database files are intended to be excluded from git.

The browser receives an HttpOnly signed cookie containing a role, workspace ID, optional fictional fan ID and expiry. It is signed, not encrypted. HttpOnly reduces script access to the cookie; it does not protect data from the person controlling the computer or from a compromised application origin. A role change applies across tabs on that origin.

## Purpose and access

Conversation state demonstrates continuity. Saved memory demonstrates explicit fan preferences with source, confidence, category, ordinary-sensitivity label, creation and expiry times. Those metadata values are supplied by the demo, not independently verified assessments. Seeded memories are clearly examples.

Fans receive their own relationship state through the API. Creator/admin demo roles can inspect all fictional relationships within their workspace. Other signed workspaces are isolated by the store. Because anyone using the local role selector can choose an operator role, this demo must not hold different real people's private data.

## Memory controls and their limits

- Saving requires fan memory consent and the creator memory setting. The demo limits saved memory to twenty entries per fan and short text.
- A basic keyword filter rejects some common sensitive patterns. It does not reliably classify every sensitive fact, inference, encoded value or paraphrase. The ordinary label is not proof that content is nonsensitive.
- Deleting one memory removes its record and scrubs stored messages whose retrieval references include that memory. It does not search every prior fan-written message for equivalent text.
- Account memory deletion removes that fan's saved memories and scrubs retained conversation content for that fan. Disabling fan memory consent applies the same broad scrub.
- Creator memory disablement stops retrieval and new saves; it is not the same as deleting all existing memories.
- Memories expire according to their stored deadline. Expired entries are removed and referenced message copies scrubbed during a subsequent successful workspace transaction. There is no background expiry worker. An inactive workspace can remain on disk past its deadlines.
- General chat transcripts do not currently have an independent automatic retention deadline. Request hashes, session metadata, audit history and individual sandbox usage identifiers remain after memory deletion. These are not anonymous aggregate-only data.

Deletion means removal from the application's current logical records. It is not secure erasure from SQLite free pages, WAL/journals, copied database files, operating-system backups, screenshots or previously received browser state. No production retention/deletion guarantee should be made from this implementation. Sensitive-data deletion would also need removal of any reconstructible low-entropy message hashes.

## Network and media

The deterministic server conversation adapter makes no external inference calls. External providers are disabled unless a future reviewed adapter is implemented and explicitly configured; a non-demo provider setting currently fails rather than silently using a hosted model. No real payment network is connected.

The optional browser voice surface uses speech synthesis and may use browser speech recognition. It prefers a local English system voice when one is available, but browser speech services are controlled by the browser/OS. Recognition may transmit microphone audio to a browser vendor service. The UI must disclose this before microphone use and let the user review the transcript before sending. Do not describe optional speech as guaranteed offline or as a cloned creator voice. Browser permission prompts and vendor privacy terms govern microphone access.

The application does not implement audio recording storage or an external avatar stream. The visual portrait is generated fictional material. WebXR/device support checks and any requested immersive session expose browser/device capability to the page; the spatial scene is optional and text remains available without a headset.

## Before real-user use

Define controller/processor responsibilities, lawful processing basis, data inventory, consent language, age assurance, creator licensing, access/export/deletion procedures, storage regions, retention and incident response. Contract with any provider only after reviewing data use, training, subprocessors, deletion, export and security terms. Implement authenticated user/tenant access, encrypted storage/backups, scheduled retention, comprehensive deletion and privacy-preserving operational logs.

A real license must separately govern likeness, voice, training material, allowed media/uses, duration, revocation and provider handling. Provenance metadata or a signed asset manifest cannot substitute for that agreement. Current rights/transparency research appears in [RESEARCH.md](RESEARCH.md); it is context, not a legal compliance determination.

Read [SECURITY.md](SECURITY.md) for the independent technical review and [ROADMAP.md](ROADMAP.md) for production gates. No real-user privacy audit or external-provider data-flow test has been completed.
