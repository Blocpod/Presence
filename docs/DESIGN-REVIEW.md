# Independent design and interaction review

Historical initial-release review: the palette has since been revised to graphite/porcelain/blue following user feedback. The score below belongs to the initial review; current color verification is recorded in BUILD-LOG.md.

Reviewed 2026-09-05 using the `immersive-web-design` quality scorecard. Reviewer independently inspected the main studio source, styles, and live browser in a separate `design` browser session. The reviewer also owns the spatial and browser-voice adapter; those two implementations are not claimed as independently code-audited here. The root release checks provide separate coverage of the complete application.

## Experience thesis

The visitor should feel that a creator's presence can expand while remaining theirs to control, as they move from authorization through a personal conversation to richer surfaces and economic evidence.

The studio uses a restrained immersion budget. A fictional adult portrait provides the emotional center; olive, warm white, serif headlines, and quiet line icons support a calm creator workspace. The overview moves from identity and activation to relationships and platform economics. Spatial rendering is an optional escalation, not a navigation dependency.

## Verdict: 86 / 100

Strong local demo after the fixes below. This is a scored design judgment, not a measured usability study, performance benchmark, WCAG certification, or claim of production readiness. No critical visual or keyboard failure remained in the paths rechecked. The complete release still depends on the root test/build/accessibility suite. Real microphone playback quality, screen-reader journeys, mobile browser chrome/keyboard behavior, and XR hardware were not tested by this reviewer.

| Category                        |   Score | Observed evidence and limits                                                                                                                                                                                                                                                                                            |
| ------------------------------- | ------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Experience thesis and narrative | 14 / 15 | Activation is a visible first action; fictional identity, AI disclosure, sandbox state, relationship context, and economic model give a coherent story. Executive guide makes the intended arc explicit.                                                                                                                |
| Art direction and composition   | 14 / 15 | Desktop portrait and editorial headline establish a strong focal point; olive navigation and warm content surfaces are consistent. Mobile restages the image and stacks metrics. Secondary panels retain some conventional dashboard grammar.                                                                           |
| Signature mechanism and motion  | 12 / 15 | The same identity moves into a real orbitable room; restrained rings support continuity. The spatial object is honestly a portrait plane, so it does not yet deliver the embodiment of a rigged digital human.                                                                                                          |
| Typography and copy             | 13 / 15 | Headlines have deliberate line breaks and supporting copy labels limitations accurately. Voice disclosures were raised to 10px on mobile after review. Some tertiary labels remain small and would benefit from a broader type-scale refinement.                                                                        |
| Interaction and wayfinding      |  9 / 10 | Activation, surface tabs, send control, escape dismissal, focus trap, and focus restoration were exercised. Navigation labels are clear. Browser-specific voice availability is handled on interaction, rather than proactively explaining every capability.                                                            |
| Mobile composition              |  8 / 10 | At 390×844 and 375×667 there was no horizontal document overflow. Conversation composer and disclosures remained inside the dialog. The small viewport deliberately leaves a compact scrolling message area; a device keyboard and landscape journey remain unverified.                                                 |
| Accessibility and fallbacks     |  8 / 10 | Modal keyboard loop and focus restoration passed after correction; hidden mobile navigation was removed from the accessibility snapshot. Canvas is keyboard focusable and has an explicit label. Unsupported immersive mode has a visible explanation. Full screen-reader/contrast certification is outside this audit. |
| Performance and reliability     |  8 / 10 | No browser runtime error appeared during the ordinary spatial journey. Switching away removed the canvas; source disposes GPU resources and caps pixel ratio. Dynamic loading is used. No measured FPS, battery, memory-growth, or Lighthouse result is claimed.                                                        |

## Concrete issues found and resolved

1. **Polling stole modal focus.** The modal's effect depended on an inline close callback, causing state refreshes to re-run initialization. The root changed the lifecycle. Recheck: a draft input retained focus and unchanged text after 3.6 seconds, spanning the three-second poll.
2. **Initial backward tab could escape the modal.** The root corrected initialization/trapping. Recheck: opening a conversation and immediately pressing Shift+Tab selected `Enable voice` inside the dialog. Escape closed it and restored focus to `Experience your Presence`.
3. **Mobile spatial preview was cropped.** A 440px minimum height sat inside a 220px portrait region, hiding the room footer and XR limitation. The reviewer removed that minimum and added a compact composition. Recheck at 390px width: canvas bounds were 364×220; disclosure bounds ended at y=223 within the y=13–233 region. Both portrait and capability notice were visible.
4. **Collapsed mobile navigation remained keyboard-accessible.** Translation alone hid the sidebar visually. The root added visibility behavior. Recheck: the collapsed sidebar's controls disappeared from the accessibility snapshot while `Open navigation` remained available.
5. **Voice disclosures were too small for practical reading.** The initial mobile voice view used 8px text. The root raised this to 10px with 1.5 line-height. Recheck at 375×667: the text, microphone control, composer, and surface navigation remained inside the dialog; the composer occupied y=530.5–590.5 within a dialog ending at y=655.
6. **Pending reply could start speech after cancellation.** Source inspection found that an awaited send could reach a still-populated voice adapter after close or a session change. The root added a playback generation guard and nulls the adapter at unmount. This fix was source-reviewed; the asynchronous race is not claimed as a real-audio browser measurement.

## Browser journeys actually performed

- Loaded the overview, activated the fictional demo through its authorization checkbox, and opened Alex's spatial session.
- Observed the real WebGL room and portrait; canvas was nonblank, focusable, and responded to an ArrowRight keyboard interaction. AR/VR entry controls were absent because this browser reported no compatible immersive device; the explanation was visible. No immersive session was entered or simulated.
- Changed between spatial and voice; the canvas count became zero on leaving spatial. `speechSynthesis.speaking` was false with voice off. No microphone permission was requested and no audio was recorded.
- Inspected full mobile overview at 390×844. Measured document width and viewport width both at 390px. Inspected voice dialog at 375×667; both widths were 375px, with a 100px scrollable message area and reachable composer.
- Verified polling focus retention, initial Shift+Tab trapping, Escape dismissal, and trigger focus restoration as described above.
- Checked browser errors and console during the ordinary spatial journey. No runtime error was reported. An initial Next image LCP advisory appeared in development; this is not an LCP timing measurement.
- Ran the browser adapter lifecycle test now persisted in `tests/voice.test.ts`. It verifies unsupported fallback, cancellation resolving exactly once, final transcript callback, stale transcript/end-handler suppression, and idempotent cleanup using browser API fakes.

## Artifacts and next verification

Temporary screenshots captured by this review: `/private/tmp/presence-design-spatial-desktop.png`, `/private/tmp/presence-design-spatial-mobile-before.png`, `/private/tmp/presence-design-spatial-mobile-after.png`, `/private/tmp/presence-design-spatial-keyboard.png`, `/private/tmp/presence-design-overview-mobile.png`, and `/private/tmp/presence-design-voice-small-final.png`. They are local audit artifacts, not bundled product assets; production build screenshots may differ from these development captures.

Before a real pilot, validate mobile software keyboard and landscape layout, screen-reader narration, speech service permission/cancellation on supported browsers, and VR/AR entry/exit on physical compatible devices. Compare a rigged avatar adapter against the portrait room only when an appropriately licensed provider and source assets are configured. Preserve text-first usability and in-world AI disclosure through that work.
