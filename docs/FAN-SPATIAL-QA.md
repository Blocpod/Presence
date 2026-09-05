# Fan spatial preview and lifecycle QA

Reviewed during the fan experience implementation on 2026-09-05. This document records actual checks and source-review findings. The spatial implementer performed the visual and lifecycle checks here; this is not an independent review of their own renderer. The fan voice/session source review was performed separately from its implementation by the root engineer.

## What was built

`SpatialPreview` is a lazy-loaded adapter with `speaking`, `active`, and `onClose` props. It fills a reserved parent region and selects the fan variant of the shared Three.js stage. The original studio variant remains the default.

The fan room uses graphite architectural piers, a recessed wall with restrained vertical light reveals, a porcelain platform, a metallic portrait frame, directional lighting, and contact shadows. The portrait is an explicitly disclosed still image of fictional adult Mira Vale, not an avatar or live video. HTML disclosure stays visible in the preview. An additional disclosure plaque appears inside the world during immersive viewing, above the floor where it cannot be occluded by that floor.

Drag/touch orbit, arrow-key exploration, Home/reset, 44px-or-larger orbit buttons, Return, and separately detected VR/AR capabilities are available. Unsupported immersive devices receive an explanation. WebGL initialization failure receives a still-portrait fallback, a readable error, disabled camera controls, and Return. The unavailable state explains creator permissions and provides Return.

## Measured browser checks

Local development URL: `http://localhost:3000/presence/mira`, using a separate `spatialfan` browser session.

| Check                             | Observed result                                                                                                                                                                                                                                                                  |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Initial mobile rendering, 390×844 | Real WebGL canvas rendered at 360×319 in the initial parent composition; portrait, room, disclosure, controls, and XR limitation were visible. Root later increased available room height.                                                                                       |
| Touch-control dimensions          | Orbit controls measured 46×49.1875 CSS pixels; Reset measured 94.6875×44.                                                                                                                                                                                                        |
| Horizontal containment            | At 390px viewport, document scroll width was 390px.                                                                                                                                                                                                                              |
| Idle rendering                    | Wrapped `WebGL2RenderingContext.prototype.drawElements` after initialization: **0 calls over 1.2 seconds idle**.                                                                                                                                                                 |
| Interaction rendering             | Before the final shadow pass, one orbit click produced 36 draw calls; count stayed at 36 for another 1.2 seconds. This proves that orbit redraws while idle does not continuously draw. It is not a frame-rate benchmark.                                                        |
| Final lit room idle               | Repeated the counter check after adding lighting/shadows: 0 idle draws over 1.2 seconds; the counter remained instrumented, and a subsequent resize produced 23 draws.                                                                                                           |
| Orbit / Reset / Return            | Each control executed in the browser. Return selected the visual surface, and canvas count became 0.                                                                                                                                                                             |
| Desktop, 1440×960                 | Room, portrait, platform shadow, control row, and disclosure were inspected. Root's conversation caption initially overlapped the room footer; root hid that caption in spatial mode, and the subsequent screenshot showed a clear room.                                         |
| XR capability                     | This browser did not advertise immersive VR or AR support. XR entry buttons were absent, and the compatible-device notice was visible. No headset session was entered.                                                                                                           |
| Small-height mobile, 375×667      | Found a parent region of only 218px at y=231–449 while the preview's 260px minimum extended to y=492 and overlapped the surface selector. Root changed the top inset to 98px. Recheck: parent y=189–449, canvas y=190–450, surface selector y=481–523. The overlap was resolved. |

No actual microphone capture, acoustic playback-quality test, XR device test, GPU-temperature test, long-run memory profile, or production latency measurement was performed by this reviewer. The browser's error history contained earlier missing-CSS compilation entries from parallel construction; this document does not present that mixed development log as a clean production-console result.

## Rendering and cleanup contract

Fan rendering is event driven while idle. It redraws for asset load, resize, orbit, reset, and state changes. A frame loop is needed only during speech visualization or immersive tracking. Reduced motion removes speech ring motion; hidden-tab handling stops the loop. The studio variant retains its existing ambient behavior.

Cleanup disconnects observers, removes control/visibility/motion/XR listeners, ends an owned XR session, stops animation, disposes geometries/materials/textures and directional-light shadow targets, disposes the renderer, and removes its canvas. Pixel ratio is capped at 1.75; the single shadow map is 1024×1024. These are implementation limits, not empirical claims about all devices.

## Third visual pass

The initial room appeared as an inset over the giant background portrait. Root removed that competing background in spatial mode and expanded the desktop room to the content width. The spatial pass moved the camera closer, used height-sensitive framing, raised the room's indirect light, and preserved the portrait's original color instead of multiplying it by grey. A camera view offset reserves the lower control band. Compact containers omit the large room title and description, leaving a short disclosure, one control row, and the capability line. Desktop 1440×960 and mobile 390×844 captures were inspected after these changes. The portrait became substantially more prominent, and the gallery became the active visual environment rather than a secondary widget.

This remains an architectural portrait preview. It does not supply embodied avatar movement, eye contact, a rig, spatial audio, or photoreal presence. Its strategic value is a real interchangeable surface with honest capability behavior, not a claim that the digital-human problem is solved.

## Independent fan voice/session source review

The following implementation properties were checked in `fan-experience.tsx`:

- Sound starts disabled. Generic-system-voice and browser speech-service disclosures precede enablement.
- Automatic transmission of recognized speech requires a separate, initially unchecked `Send when I finish speaking` consent. Text input remains available.
- A generation token prevents late callbacks from changing speech state or delivering output after a stop. Send checks that a returned message is an unblocked AI reply in AI mode before playback.
- Policy/license changes, usability changes, connectivity loss, hidden-tab transition, creator takeover, and leaving stop voice. Revocation propagation still depends on polling and browser scheduling; it is not a production realtime-revocation guarantee.
- Fan-facing human takeover uses human text-operator authorship and does not synthesize human-operator messages as Mira's cloned voice.

Two gaps were reported to the root engineer and subsequently corrected there:

1. Revoking automatic-send consent while a microphone capture was already pending did not cancel that capture. Root added a synchronous stop on consent toggle and on opening fan panels.
2. A pending surface/session creation could resolve after Leave and re-enter the experience. Root added a generation check before applying the returned session.

These two fixes were communicated and source-reviewed. They should also be exercised by the full fan lifecycle browser tests; they are not claimed here as real-microphone or throttled-network measurements.

## Evidence artifacts

Local screenshots: `/private/tmp/presence-fan-spatial-mobile-v2.png`, `/private/tmp/presence-fan-spatial-desktop.png`, `/private/tmp/presence-fan-spatial-lit-v2.png`, `/private/tmp/presence-fan-spatial-mobile-final.png`, `/private/tmp/presence-fan-spatial-small.png`, `/private/tmp/presence-fan-spatial-small-fixed.png`, `/private/tmp/presence-fan-spatial-pass3-mobile.png`, `/private/tmp/presence-fan-spatial-pass3-desktop.png`, `/private/tmp/presence-fan-spatial-final-desktop.png`, and `/private/tmp/presence-fan-spatial-final-small.png`. These are temporary audit captures, not bundled product assets. The final desktop and small-height screenshots were inspected after the last framing and disclosure changes.

Targeted ESLint and TypeScript passed after the main implementation and lighting changes; targeted ESLint passed after the third framing pass. The root release run must repeat the complete checks after integration. Physical-device XR entry/exit, local-reference-space placement, AR transparency, and speech permission behavior remain explicit pilot requirements.
