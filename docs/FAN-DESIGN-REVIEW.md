# Independent fan design review

## Pass 1 — 2026-09-05

**Verdict: promising editorial direction, not yet award-caliber as a complete product.** The entry screen has a strong portrait and a distinctive contrast to Creator Studio. Active use reveals readable-content, modality and continuity problems that prevent a 95/100 conclusion.

The reviewer did not implement the fan UI. A real local Chrome browser opened `/presence/mira`, entered the experience, selected Text, sent “What do you remember about me?”, selected Visual and opened the transcript. This was repeated at 1440 × 1000 and 390 × 844, with reduced motion. No page errors were observed in those journeys. Document width matched both viewport widths. `/demo` was not part of this pass because it was still being built.

Evidence: `output/fan-review/pass-1/` and `output/fan-review/pass-1-settled/`. Each contains entry, voice, text-response, visual and transcript screenshots plus observations JSON. The original first-pass visual images caught an in-flight request; the **settled** visual images are the evidence for Visual-mode judgment. This distinction matters when evaluating transitions.

## What already works visually

- The mobile entry has a confident portrait-first composition. Mira is clearly the focal point, with one readable primary invitation and no dashboard/card-grid structure.
- Graphite, porcelain and restrained blue form a coherent world. The editorial name treatment differentiates the encounter from the operational studio.
- The transcript sheet is clear, typographic and substantially more readable than a stack of decorative chat bubbles. It provides full content and retained authorship.
- The current images do not resemble an avatar catalog or generic AI mascot. Still-image and AI explanations are present, though some are too small for comfortable scrutiny.

## Priority improvements

### P1 — Show a complete thought, not a clipped sentence

After the recall request, the desktop main reply ends at “in your”; the mobile reply ends at “35mm film”. Text is cut mid-sentence without an ellipsis, expansion action or readable continuation. The complete reply is available in the transcript, but fans are not told that the main text is incomplete. This undermines the main interaction even with sound off.

**Change to test:** Present a complete short response or an explicitly collapsed excerpt with a visible “Read the full response” action. If using a scrollable reading region, make overflow discoverable and preserve the creator's face. Do not simply shrink all reply text until it fits. Check a short reply, the current recall reply, and a long permitted reply at mobile keyboard-open height.

### P1 — Deliver the portrait at the resolution the composition needs

Mobile portrait detail is visibly soft/pixelated. In the settled mobile observation, Next Image selected a `w=640&q=75` URL while the rendered image element measured approximately 832 × 863 CSS pixels, before accounting for the wider source needed by landscape-image cover cropping. The original asset is 1536 × 1024. A `100vw` responsive-image declaration does not describe the actual coverage cost of a tall portrait crop.

**Change to test:** Request an image size based on covered height/aspect ratio, or deliver the original local asset for this hero. Confirm intended quality configuration and inspect eyes/hair at 390px and higher pixel density. Do not mistake CSS blur removal for restoration of missing source detail.

### P2 — Make the signature line mean continuity

The current large oval crosses Mira's forehead/nose and nearly encloses the face. In a still frame it resembles a facial-scanning reticle. Its dots do not connect to the separate memory cue or current communication endpoint. Calling it a relationship thread does not make that meaning visible.

**Change to test:** Pull the line into a compositional margin and connect an actual memory endpoint to the current exchange. Avoid the face/eyes. Let the line change only for a meaningful state. A screenshot should suggest a continuous relationship, not biometric measurement. One designed path with clear endpoints is preferable to an ornamental circle plus an unrelated vertical memory marker.

### P2 — Preserve the current thought across modes

After Text produces the Kyoto reply, switching to Visual creates a new session and the main display returns to “There’s a thread to pick up.” The previous reply survives only in the transcript. Relationship storage persists, but the surface change feels like starting over.

**Change to test:** Preserve the latest relevant authored exchange in the fan's visible context while a new governed surface session is established. Identify its provenance correctly; do not silently attribute a historical message as newly spoken. Show continuity in both content and transition.

### P2 — Give Voice a different interaction hierarchy

Voice currently presents the same textbox and tabs as Text with an additional small microphone button. This is functional, but the main metaphor remains writing to a chat app. Visual mode is mostly a slightly closer crop with the same chrome.

**Change to test:** In Voice, prioritize one large Speak/Interrupt action and make typing an immediate secondary option. In Visual, reduce or tuck away secondary controls while keeping disclosure, the current exchange and exit accessible. A switch should change the experience's attention, not only its crop or small icon.

### P2 — Make memory feel like a useful conversation

The main response recites “your saved note says” and discusses deleting it in memory controls. This explains the runtime but weakens the feeling of a familiar creative encounter. The exact same note also appears near the top of the screen, creating repetition.

**Change to test:** A short, grounded continuation such as asking what Alex hopes to photograph in Kyoto can demonstrate memory more naturally. Keep seeded-history disclosure and inspect/delete in the memory sheet. Never invent a real shared event; the language must remain tied to approved fictional context.

### P2 — Increase critical secondary-text comfort

Mode metadata, disclosure and relationship labels are visually tiny. The top-left memory cue competes with the face in the mobile crop. This pass did not run a full accessibility scan, so no WCAG failure is asserted solely from appearance.

**Change to test:** Use readable critical labels, rebalance face-safe annotation placement, and test contrast over the actual image region. System state should remain understandable at normal physical-phone viewing distance.

## Preliminary 13-category scorecard

Weights follow [FAN-RESEARCH.md](FAN-RESEARCH.md). Scores describe observed initial rendering and behavior. Unobserved categories receive no invented score. The **observed subset is 53.0/74 weighted points, or approximately 72/100 when normalized**. This is a provisional visual/interaction indicator, **not a complete product score**. A complete score remains pending motion, spatial, takeover and performance evidence.

| Category                | Weight | Initial score / 10 | Rationale                                                                                                               |
| ----------------------- | -----: | -----------------: | ----------------------------------------------------------------------------------------------------------------------- |
| Emotional impact        |     10 |                8.0 | Strong entry and portrait; mechanical recap weakens active intimacy.                                                    |
| Originality             |     10 |                6.5 | Editorial palette is effective; oval signal is familiar and semantically disconnected.                                  |
| Creator focus           |     10 |                8.5 | Mira dominates; line/annotation placement occasionally intrudes on the face.                                            |
| Immersion               |      8 |                7.5 | No dashboard metaphor, but same controls in every mode and clipped replies expose the software.                         |
| Relationship continuity |     10 |                6.5 | Correct Kyoto retrieval and transcript; mode reset breaks the visible thread.                                           |
| Motion quality          |      8 |           Unscored | Reduced-motion screenshots cannot establish full animation craft.                                                       |
| Mobile quality          |     10 |                7.0 | Intentional portrait staging and no page overflow; soft image and truncated text are material defects.                  |
| Visual mode             |      7 |                7.0 | Strong close portrait, but limited difference from text/voice composition.                                              |
| Spatial preview         |      7 |           Unscored | Not exercised in this pass.                                                                                             |
| Human takeover          |      7 |           Unscored | Not exercised in this pass; source alone is insufficient.                                                               |
| Accessibility           |      5 |    6.0 provisional | Semantic controls/transcript visible; critical small text and full keyboard/contrast testing remain.                    |
| Performance             |      4 |           Unscored | No load/GPU/lifecycle benchmark was run.                                                                                |
| Awards quality          |      4 |                6.5 | Good art direction, but the signature interaction and complete active-use craftsmanship are not yet distinctive enough. |

## Next review gate

Re-capture the same entry/response/mode states after the priority fixes. Add normal-motion recordings for entry, memory reveal, Voice and human arrival; exercise Spatial and its failure/reduced-motion paths. Confirm focus/keyboard/long-response behavior and actual performance before completing the scorecard. Judge the result anew; do not add points simply because an implementation change was made.

## Pass 2 — 2026-09-05

**Verdict: substantially more complete and coherent, 83.4/100 in this independent craft review.** The score is a judgment of the accepted fictional, deterministic, still-portrait demonstration. It does not deduct points for the intentional absence of a live avatar, production identity or external voice provider. The remaining deductions concern composition, distinctiveness and interaction craft that can be improved within the current scope. A 95+ conclusion is not supported by this pass.

### Evidence and improvements

Real local Chrome ran at 1440 × 1000 and 390 × 844 with normal motion. The reviewer entered Voice, requested Kyoto recall in Text, carried that thought into Visual, entered Spatial, operated orbit controls, returned to Visual, invoked the real local operator takeover API, sent an operator message, inspected the transcript and opened `/demo`. Capture artifacts and raw observations are in `output/fan-review/pass-2/`. Normal-motion browser recordings were generated; review of transition progress and settled states used timed screenshots. The original arrival/human captures caught their entrance blur; use `*-arrival-settled.png` and `*-human-settled.png` to judge legibility, not those in-flight frames.

The full Kyoto response is now a readable, grounded question rather than database explanation. It stays visible in Visual with a carried-context label. Mobile requests a w1080 hero instead of w640, with visibly improved detail. The primary microphone has a clear separate hierarchy. The signature line no longer crosses Mira's face and gives the page a more composed margin. Human-authored messages have explicit creator-operator labels and persistent joined status. The `/demo` mobile page is a clear editorial introduction to the two real sides of the runtime.

Axe reported **zero violations in ten scanned states**: entry, Voice, Spatial, human interaction and demo entry at both viewports. Neither browser journey produced a page error. Document width matched viewport width at both tested sizes. This is automated coverage, not a complete WCAG or physical-device claim.

### Remaining priorities

1. **Spatial should become the encounter, not a panel inside it.** The bordered spatial preview sits over the unchanged much larger 2D face. Two portraits compete, while a separate stage heading, return button, orbit controls, four mode buttons and composer all coexist. On mobile the small rectangular 3D portrait resembles a gallery exhibit. Let the spatial stage replace the photographic background, keep a shared quiet navigation/control layer, move the portrait nearer, and simplify/light the room. The truthful still-portrait disclosure can remain unobtrusively readable. This is an art-direction issue, not a request to fake realtime video.
2. **Visual needs an intentional resting composition.** Text and Visual still have almost identical information density; the primary distinction is a closer image crop. Collapse the repeated memory paragraph to one thread anchor, make writing available through a quiet intent-revealed affordance, and reduce the always-visible mode controls. Keep exit and AI/still-image disclosure immediately discoverable. The mobile memory paragraph currently crosses the left-eye area of the enlarged crop.
3. **Give the thread an observable interaction meaning.** The new curve is much better positioned, but still reads mostly as a decorative path. A memory opening/saving action and a transition to the current exchange should visibly affect specific endpoints. Aim for a simple perceivable continuity event, not constant ornamental travel or simulated biological signals.
4. **Refine the human-arrival interruption.** The settled full-screen typography is elegant and clear, but it hides the creator and auto-dismisses after 4.2 seconds. That is little time for its explanatory text and an actionable “Be here” button. A persistent acknowledgement with appropriate focus handling, or a compact live announcement that preserves the portrait, would feel more deliberate. The persistent operator authorship after dismissal already works well.
5. **Increase small-label comfort selectively.** Important authorship and mode-disclosure labels pass the scanned contrast checks but remain physically tiny on 390px. Increase essential labels without expanding every piece of metadata. This is a usability observation, not an invented axe failure.

### Measured local behavior

Measurements are single-run local observations from desktop Chrome, without network or CPU throttling. They are not real-phone or public-network benchmarks. The development server at port 3000 was warm; browser contexts were newly created. Entry LCP was 172ms desktop and 92ms mobile. Observed entry layout shift was approximately 0.00005 and 0.00033 respectively. Resource transfers recorded by the entry measurement totalled approximately 911KB and 893KB; development bundles account for much of this.

A separate new-context mobile run against the production build at port 3001 recorded LCP 52ms, DOMContentLoaded 29.3ms, load 61ms and 237,168 bytes across recorded resource transfers, including a 29,118-byte optimized hero response. Raw data is in `motion-production.json`. This demonstrates an inexpensive local entry path; it does not establish public Core Web Vitals.

Three seconds of requestAnimationFrame timestamps while Spatial was open produced median frame intervals around 16.7ms, desktop p95 16.8ms and mobile p95 16.7ms. This measures main-thread callback cadence in desktop Chrome, **not actual GPU rendering cost or sustainable phone framerate**. The room rendered and orbit controls changed the view. Headset AR/VR and microphone audio were not part of this independent visual review. Other agents' lifecycle or journey tests must be cited separately rather than attributed to this pass.

### Complete 13-category scorecard

| Category                | Weight | Pass 2 / 10 | Basis                                                                                                                        |
| ----------------------- | -----: | ----------: | ---------------------------------------------------------------------------------------------------------------------------- |
| Emotional impact        |     10 |         8.7 | Strong portrait invitation and more natural recall; spatial and arrival interrupt that closeness.                            |
| Originality             |     10 |         8.0 | Coherent editorial identity; the signature thread still needs a distinctive visible behavior.                                |
| Creator focus           |     10 |         9.0 | Face is dominant and line avoids it; mobile annotation and duplicate spatial portrait compete.                               |
| Immersion               |      8 |         8.2 | Voice hierarchy improved; Spatial still feels embedded and Visual keeps the Text structure.                                  |
| Relationship continuity |     10 |         9.0 | Grounded note becomes a useful question and correctly carries between modes.                                                 |
| Motion quality          |      8 |         8.0 | Controlled reveals and transitions; arrival currently behaves more like an interruptive interstitial.                        |
| Mobile quality          |     10 |         8.5 | Clear primary action, improved image, complete response and no page overflow; small metadata and spatial composition remain. |
| Visual mode             |      7 |         7.5 | Excellent portrait material, but insufficiently distinct resting experience.                                                 |
| Spatial preview         |      7 |         6.8 | Real navigable space and clear disclosure; composition/scale/duplicate stage are below the rest of the product.              |
| Human takeover          |      7 |         8.5 | Real shared runtime handoff, explicit authorship and elegant arrival; timing/focus/portrait continuity need refinement.      |
| Accessibility           |      5 |         9.0 | Zero axe violations across ten states; small-label comfort and arrival interaction remain review concerns.                   |
| Performance             |      4 |         9.0 | Lightweight observed production entry and responsive local operation; wider-device evidence remains limited.                 |
| Awards quality          |      4 |         8.0 | Strong art direction and increasingly coherent operation; the signature experience is not yet exceptional throughout.        |

Weighted total: **83.42/100**, rounded **83.4/100**. This is a reviewer judgment, not an award prediction or a certification. Re-score after a real third-pass capture; do not mechanically add points for implementing these suggestions.

## Pass 3 — 2026-09-05

**Verdict: a coherent, polished portrait-led encounter, with two concrete Spatial defects still open at capture time.** Visual and human arrival have become genuinely different compositions, not just renamed controls. The signature line now visibly connects the memory anchor to the current authored exchange. Mobile Visual and arrival are the strongest active-use frames so far.

The same real browser sequence was repeated at 1440 × 1000 and 390 × 844 with normal motion. Evidence is in `output/fan-review/pass-3/`. The persistent arrival was explicitly acknowledged with “Be here” before checking the human message; it no longer disappeared on a timer. The fan portrait remained visible throughout the declaration. No page errors or horizontal document overflow were observed.

### Improvements observed

- Visual removes the large idle textbox and repeated memory paragraph. “Write a thought” is an intentional action, the thread anchor stays clear of the eyes, and the enlarged current thought has editorial presence.
- Arrival is now a persistent, nonblocking statement beside/over the lower portrait. The fan can read it at their own pace. The preserved portrait, actual operator provenance, subtle palette change and endpoint distinction make a much stronger transition.
- Spatial replaces the old duplicate photographic background. The larger, better-lit portrait establishes it as the primary surface. Orbit and return controls continue to work.
- The thread has a visible beginning and end tied to real interface anchors. It is no longer an unexplained oval or detached curve.

### Concrete remaining defects at capture time

**P1 — Spatial text responses are invisible with sound off.** A separate real UI check sent “Tell me about photography.” in Spatial. The runtime returned a photography answer and the DOM contained both that answer and “Read full reply”, but `.fan-subtitle` had computed `display: none`. The only visible live statuses were AI availability and WebXR compatibility. The composer remained visible and accepted the message, so the fan had no visible response without opening the transcript. See `mobile-spatial-response.png`. Restore a concise visible response or a discoverable new-response preview integrated with the spatial composition. Merely retaining hidden live-region text does not make it accessible.

**P2 — Fading the desktop rail creates a contrast regression.** Axe found one serious color-contrast rule violation with two nodes in desktop Spatial: `.fan-rail > span:nth-child(1)` and the third rail span. The rendered contrast was 2.18:1 after opacity reduction, against the required 4.5:1 for that small text. Hiding the decorative rail in Spatial or restoring sufficient contrast resolves the underlying choice. The other nine scanned states had zero violations. Re-scan after correction; do not carry the pass-two zero-all-states claim forward unchanged.

### Further craft opportunity

The room still resembles a virtual gallery: a beige frame around the rectangular still portrait, hard architectural highlights and a navigation explanation. Its accepted purpose is a truthful spatial preview, so realism is not the criterion. The opportunity is to make the preview share the warmth and continuity of the main encounter: soften environmental contrast, use quieter framing, and connect the portrait to a small current-thought/thread marker. The response-visibility correction should be designed as part of that scene rather than another floating product panel.

### Updated score

This captures the implementation before the two findings above were corrected. Scores remain independent judgments within the accepted demo scope.

| Category                | Weight | Pass 3 / 10 |
| ----------------------- | -----: | ----------: |
| Emotional impact        |     10 |         9.3 |
| Originality             |     10 |         8.8 |
| Creator focus           |     10 |         9.4 |
| Immersion               |      8 |         9.0 |
| Relationship continuity |     10 |         9.2 |
| Motion quality          |      8 |         9.0 |
| Mobile quality          |     10 |         9.0 |
| Visual mode             |      7 |         9.0 |
| Spatial preview         |      7 |         8.0 |
| Human takeover          |      7 |         9.5 |
| Accessibility           |      5 |         8.5 |
| Performance             |      4 |         9.0 |
| Awards quality          |      4 |         8.8 |

Weighted total: **90.02/100**, rounded **90.0/100**. Performance judgment carries forward the explicitly qualified production measurement from pass two; this pass did not repeat a production benchmark. A clean functional correction and a more considered spatial composition merit another review, not an automatic 95+ claim.

## Final independent verification — 2026-09-05

**The concrete visual/interaction defects identified in this review are closed in the final observed build. Final independent craft score: 91.35/100, rounded 91.4/100.** This is a polished working demonstration. The requested 95+ target remains an aspiration; this reviewer does not certify it as achieved. No additional core functional defect was found in the final journeys.

The final check again used real Chrome at 1440 × 1000 and 390 × 844, followed by a 375 × 667 reduced-motion layout check. It exercised entry, Voice, Text recall, Visual continuity, Spatial orbit, a new photography message with sound off, full-response expansion, return to Visual, real operator takeover, explicit arrival acknowledgement, the human message and transcript, and demo entry. Artifacts and raw findings are under `output/fan-review/final/`.

- **Spatial reply visibility: fixed.** The submitted photography question produced a visibly authored compact reply ribbon with a thread node. “Read full reply” opened the transcript containing the complete new answer. Escape returned to the encounter.
- **Rail contrast regression: fixed.** The decorative rail is hidden in Spatial. All ten repeated desktop/mobile axe scans reported zero violations. The additional 375px Spatial scan also reported zero violations. The short-layout scan's first invocation used an unsupported axe context and was rerun correctly with an explicit browser context; the successful result is recorded in `short-observations.json`.
- **Responsive composition: confirmed at the tested sizes.** At 390 × 844 the spatial room, readable reply, controls and composer fit the intended encounter. At 375 × 667, document width remained 375px and content height was intentionally 770px; the room, reply and composer occupied separate vertical areas without overlap. Vertical scrolling is the chosen small-height behavior.
- **Runtime presentation: consistent.** No page errors were observed in the repeated desktop/mobile journeys. Carried context, AI authorship, creator-operator authorship and the fictional/still-image disclosures remain visible in the relevant states. The persistent arrival keeps the portrait present and is explicitly dismissible.

### Curated final screenshots

These are direct browser captures of fictional local fixtures. Only the Next.js development-tools portal was hidden for the capture; product content was not altered. These are development-render screenshots, not proof of a public deployment.

| View                          | Screenshot                                                     |
| ----------------------------- | -------------------------------------------------------------- |
| Desktop entry                 | [fan-desktop-entry.png](screenshots/fan-desktop-entry.png)     |
| Mobile Voice                  | [fan-mobile-voice.png](screenshots/fan-mobile-voice.png)       |
| Mobile Visual                 | [fan-mobile-visual.png](screenshots/fan-mobile-visual.png)     |
| Mobile Spatial with new reply | [fan-mobile-spatial.png](screenshots/fan-mobile-spatial.png)   |
| Mobile creator arrival        | [fan-mobile-arrival.png](screenshots/fan-mobile-arrival.png)   |
| Desktop Visual                | [fan-desktop-visual.png](screenshots/fan-desktop-visual.png)   |
| Desktop creator arrival       | [fan-desktop-arrival.png](screenshots/fan-desktop-arrival.png) |

### Final scorecard

| Category                | Weight | Final / 10 |
| ----------------------- | -----: | ---------: |
| Emotional impact        |     10 |        9.3 |
| Originality             |     10 |        8.8 |
| Creator focus           |     10 |        9.4 |
| Immersion               |      8 |        9.1 |
| Relationship continuity |     10 |        9.2 |
| Motion quality          |      8 |        9.0 |
| Mobile quality          |     10 |        9.3 |
| Visual mode             |      7 |        9.0 |
| Spatial preview         |      7 |        8.8 |
| Human takeover          |      7 |        9.5 |
| Accessibility           |      5 |        9.2 |
| Performance             |      4 |        9.0 |
| Awards quality          |      4 |        8.9 |

Weighted total: **91.35/100**. Performance retains the qualified local production measurement from pass two. No public-network, actual-phone, microphone-audio, headset, thermal or longitudinal field claim is made by this review.

The remaining gap is qualitative, not another hidden requirement for live AI. The spatial scene still uses hard architectural shapes and a framed photographic plane; its art direction is less refined than the portrait-led modes. The thread is now meaningful but its motion vocabulary is relatively restrained and familiar. Critical secondary copy remains small on mobile even though the scanned contrast checks pass. Further work could explore those areas, but no arbitrary extra animation or metadata should be added merely to chase a numeric target. A further claim of award-level distinction would benefit from independent user/design judging rather than the implementer assigning itself a higher number.

### Final readability and room refinement recheck

After the final verification, essential status, authorship, disclosure and action labels were enlarged selectively. The spatial portrait frame changed to a quieter gray with lower metallic emphasis, the key light became more neutral, and architectural highlights were reduced. A fresh 390 × 844 real Chrome journey checked entry, Voice, Text, Visual, Spatial with a newly generated reply/full transcript, and creator arrival. Screenshots were visually inspected. These refinements improve secondary-text comfort and make the room quieter without changing the established interaction or causing observed overlap.

The five repeated mobile axe scans (entry, Voice, Spatial, human and demo entry) again reported zero violations. No page errors or horizontal overflow were observed. Evidence is in `output/fan-review/final-comfort/`. The four curated mobile Voice, Visual, Spatial and arrival screenshots above were replaced with these current captures; the desktop screenshots remain from the preceding verification. **The final score remains 91.4/100**; these useful cosmetic refinements do not justify backfilling the 95+ target.
