# The fan experience

The visitor should feel welcome as they return to Mira, because a governed Presence carries the relationship forward while its creator stays in control.

## Product entry

- `/presence/mira`: Alex’s portrait-led encounter with fictional adult creator Mira Vale.
- `/studio`: the existing creator controls; `/` remains compatible.
- `/demo`: the two perspectives and an explicitly labeled creator-operator demo director. Open the fan in another tab, then demonstrate human arrival, pause and sandbox access changes. License authorization is available here for an existing pending/revoked fictional workspace.

The fan entry prioritizes Mira, disclosed AI availability and “Spend time with Mira.” Alex’s Kyoto/35mm history comes from the existing isolated relationship, not a client-only script. A shorter deterministic recall response turns that context into a creative question. Custom notes still use their literal saved text. No real event or human response is invented.

## Visual thesis and iterations

Graphite, porcelain and restrained blue extend the revised studio brand. Desktop uses an editorial alignment spine and expansive portrait. Mobile at 390×844 restages the same image as a vertical encounter. The landscape source is requested at a width appropriate to its tall cover crop; the initial undersized640px image was corrected following actual screenshot review.

The **continuous thread** connects the actual memory/invitation anchor to the current response/entry action. A ResizeObserver measures these semantic endpoints; a single SVG path follows them. It does not scan the face, measure emotion or estimate relationship strength. Speech/listening callback states move the signal only while the browser service is active. Human arrival resolves a second endpoint and a brighter atmosphere. Reduced motion retains a static path, authorship and status.

The first review rejected the face-crossing oval, clipped responses, mode resets and weak voice hierarchy. The second pass corrected those defects. The third pass connected the line to actual layout anchors, made Visual quieter, gave Spatial the full stage, and replaced the timed blocking takeover interstitial with a persistent nonblocking announcement. See FAN-DESIGN-REVIEW.md for independent scores rather than treating design intent as evidence of success.

## Four forms, one relationship

Text displays one current reply as editorial subtitles. Long replies have an explicit excerpt and “Read full reply”; the complete authored history is accessible in a transcript sheet.

Voice puts a dedicated Speak/Interrupt control ahead of the typed fallback. Sound is off on entry. An explicit sheet explains generic browser speech, optional microphone processing and opt-in automatic submission after each microphone tap. It never requests microphone access or plays audio on page load. Consent withdrawal, opening a sheet, leaving, changing modes, policy changes, disconnection and hidden-page state cancel the service. A generation token rejects late speech/recognition and mode-opening callbacks. Human takeover stops AI speech and uses operator-authored text.

Visual changes the portrait framing and reduces memory to a small continuity anchor. Writing opens on intent through “Write a thought.” Modes and the still-portrait disclosure remain accessible. This is an animated still, not live synthetic video.

Spatial replaces the portrait background with an architectural WebGL listening room. The shared mode strip, fan identity, relationship and composer remain. Three.js loads only on entry; idle frames stop, orbit redraws on demand, hidden pages pause and resources dispose on exit. Real WebXR entry appears only when supported. It is a still portrait in a room, not an avatar or certified AR deployment. See FAN-SPATIAL-QA.md for measured render behavior and hardware limits.

Changing surfaces creates a newly authorized surface session and carries the latest authored thought visibly with a historical provenance label. All sessions use the same fan relationship. A creator currently joined in human mode must hand back to AI before the fan can change that session’s form.

## Shared runtime, separate roles

`presence_demo` retains the creator/operator actor. `presence_fan` is separately signed with an audience and used exclusively by `/api/v1/fan/*`. Renaming/substituting cookies cannot turn one audience into the other. Both can reference the same workspace, so two tabs can demonstrate control propagation without overwriting each other’s role.

`POST /api/v1/fan/demo` is a loopback-only demo entry (production mode additionally requires explicit local-demo enablement). A brand-new fan-first workspace receives an audit-recorded fictional active license and separate local operator cookie. An existing workspace is never reactivated: pending, pause, revocation and entitlement decisions survive repeated bootstrap. This convenience is not platform authentication, real identity verification or real likeness consent.

The fan namespace allows own state, session, interaction and memory/consent actions. It exposes no creator, takeover, reset or membership elevation route. The demo director calls the operator namespace and is labeled accordingly. Real authorization, memory isolation, policies, consent, entitlements, revocation and sandbox metering are enforced server-side.

The visible page refreshes every 1.8 seconds while visible and on return to the tab; the server checks every interaction immediately. This is polling, not a realtime transport guarantee. Lost-response retries reuse the same request ID for the same pending session/text, so an already-committed response does not produce another ledger event.

## Accessibility and operational boundary

Native dialog sheets include an explicit keyboard cycle, Escape, background inertness and focus restoration. All important controls have names, sound is optional, transcripts remain available and reduced-motion preferences are honored. Automated axe and browser journeys are documented in EVALS.md; they are not a substitute for physical-device and assistive-technology review.

This remains a local deterministic fictional demonstration. No external AI provider, cloned voice, realtime digital human, real membership purchase, live celebrity likeness, deployed headset product or production platform integration is implied. Full synthetic speech quality, actual microphone permission UX, headset comfort and mobile thermal behavior require hardware evaluation. The design target is 95/100; independent scores are recorded honestly and are not an external award or jury endorsement.
