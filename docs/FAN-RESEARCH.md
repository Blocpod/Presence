# FAN PRESENCE — design research and competing directions

Researched 2026-09-05 against [FAN-MISSION.md](FAN-MISSION.md), the current project state and architecture. This is an independent design recommendation, not a review of the unfinished fan interface. No 95/100 score or award prediction is asserted here.

## Evidence and limits

Primary award records, maker case studies and product documentation were opened during research. Sources span established references from 2023–2025 and current 2026 product/award pages. A recent crawl does not make an older design new. Award records establish recognition of the named version, not of every subsequent redesign. Interaction recommendations below are our interpretation; they are not measured conversion findings.

JavaScript-only landing pages for Active Theory and Santioni were discoverable but did not expose their interactive behavior to the text browser. FWA's published announcement supports the award attribution; it does not support pretending we personally experienced every transition. The forthcoming critique must use actual PRESENCE screenshots, recordings and browser interaction rather than inferred rendering.

## Relevant reference set

| Reference                                                    | What the primary source establishes                                                                                                                                                                                                                                                                                                                                                       | Principle to test in PRESENCE                                                                                                                                                                                                             |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Lusion v3**                                                | Awwwards records SOTD on 2 October 2023, highlights reactive cursor/scroll animation, and reports an 8.25 overall score. Creativity scored 8.65; usability 7.95. The record also presents desktop/mobile examples. [Award record](https://www.awwwards.com/sites/lusion-v3)                                                                                                               | One coherent visual mechanism can be more memorable than many effects. Do not trade comfortable repeat use for a spectacular entrance. The current Lusion homepage is a later live reference, not automatically the same awarded version. |
| **Tracing Art, Getty / Resn**                                | SOTD on 22 July 2025. The work connects provenance stories with dynamic imagery and data; the award page highlights scroll animation, visualization and content architecture. [Award record](https://www.awwwards.com/sites/tracing-art)                                                                                                                                                  | Turn relational data into an understandable story. A small contextual memory cue should show why this reply belongs to Alex; a table of facts cannot carry the same meaning.                                                              |
| **Santioni: The Notturno Experience, Active Theory / Plan8** | FWA's current newswire names it August 2026's FWA of the Month and describes an illustrated, comic-inspired brand journey. [FWA announcement](https://www.thefwa.net/), [maker announcement listing](https://thefwa.net/?page=2), [experience](https://santionispirits.com/)                                                                                                              | A consistent authored world and sound/motion direction can distinguish a brand. Borrow that coherence, not its comic style, story, assets or a long forced prelude. Our product's story is returning to a creator.                        |
| **Synthetic Human, Lusion / Fantasy**                        | The maker describes a campaign combining procedural animation, depth and optimized assets for realtime web presentation. [Case study](https://lusion.co/projects/synthetic_human/)                                                                                                                                                                                                        | Treat depth and motion as authored material with an optimization budget. Do not simulate body/face animation that falsely implies a live human stream.                                                                                    |
| **Of The Oak, Lusion / Marshmallow Laser Feast / Kew**       | The maker describes a web companion to a physical artwork and a compressed 3.5 MB tree/branch/node asset pipeline using instancing. This is their reported asset figure, not a PRESENCE budget result. [Case study](https://lusion.co/projects/of_the_oak/)                                                                                                                               | Spatial identity should remain coherent between physical and digital contexts. A few meaningful elements can carry the environment; eliminate expensive ornamental geometry.                                                              |
| **Spatial Fusion, Lusion / Phoria / Meta**                   | A WebXR project using spatial anchors, plane detection and passthrough is described by its maker. [Case study](https://lusion.co/projects/spatial_fusion/)                                                                                                                                                                                                                                | Spatial design can relate a representation to a real place. PRESENCE's flat-screen preview needs clear ground, scale and placement cues; do not claim those external capabilities are implemented in our prototype.                       |
| **Apple spatial design**                                     | Apple recommends orienting people before escalating immersion, defining a spatial highlight, preserving comfort, and rendering only the environmental detail needed. [Design Q&A](https://developer.apple.com/news/?id=fi8ne6ji), [spatial UI session](https://developer.apple.com/videos/play/wwdc2023/10076/)                                                                           | Begin with Mira and one clear action. Let Visual and Spatial open the composition after the fan chooses. Keep controls stable and readable as content gains depth. A room should support the encounter, not become the protagonist.       |
| **Apple Vision Pro / FaceTime**                              | The current product page describes life-size participant tiles, adjustable scale, Personas and audio located with participants. [Product reference](https://www.apple.com/apple-vision-pro/)                                                                                                                                                                                              | Human scale, focused authorship and a small set of direct call actions give communication its immediacy. Our still image and generic browser voice remain explicitly disclosed.                                                           |
| **Patreon community**                                        | Current product/help pages describe direct messages, community chats and access by member tier. [Community product](https://www.patreon.com/en-GB/product/online-community), [access controls](https://support.patreon.com/hc/en-gb/articles/18855652505357-Building-Community-with-Chats)                                                                                                | Fans understand privileged access and direct connection. Keep the commercial layer intelligible, but make the single creator encounter primary instead of expanding into a feed/catalog.                                                  |
| **Character.AI calls**                                       | Its launch describes switching between text/voice and a direct interrupt control. Current June 2026 documentation still describes voice across conversation surfaces. [Calls announcement](https://blog.character.ai/introducing-character-calls/), [current voice documentation](https://support.character.ai/hc/en-us/articles/50609011294235-4-Greeting-and-Voice-%EF%BC%90-%E3%83%8E) | Voice requires an intelligible turn-taking state and interruption. A moving waveform beside a dictation textbox alone does not create a voice-first encounter. No voice cloning or character-library assets are borrowed.                 |

## Three competing directions

### A — The private portrait

**Thesis:** A creator portrait becomes a place to return to. A graphite stage supports warm photography, porcelain editorial type and one restrained blue line. The interface has a small number of anchored controls; the latest spoken thought lives near the image as readable text. A transcript is available on demand.

**Mobile staging:** The face/eyes remain unobscured in the upper visual field. Name and AI status occupy a stable quiet region. A short memory cue sits near the newest response, not in a separate card grid. The thumb zone contains the primary talk/interrupt action and a smaller text alternative. Entry, conversation and takeover each have a deliberate composition rather than merely different labels.

**Strength:** Most directly answers the mission's creator focus and repeatable intimacy using the available still image. Graphite/porcelain differentiates it from the operational creator studio while maintaining the brand.

**Failure mode:** A fullscreen portrait with a pretty pill dock can still look like an ordinary call screen. Excessive blur, empty black space and tiny metadata will not create originality. The continuity line must communicate real events, and text must remain substantial enough to read comfortably.

### B — The shared notebook

**Thesis:** Porcelain pages, generous editorial type, cropped photographic fragments and a continuous marginal line build an intimate record of shared creative interests. Each return opens the latest remembered detail. Voice is a quiet layer over the notebook; prior moments are tangible rather than numerical.

**Mobile staging:** A photographic opening gives way to one authored spread at a time. The fan's short line and Mira's reply form a typographic exchange, without chat bubbles. Memory is a fold-out annotation with inspect/delete access.

**Strength:** Strongest explanation of continuity and memory agency, distinctive in screenshots, highly compatible with photography/music/travel.

**Failure mode:** It may feel like a beautiful journal or portfolio instead of spending time with someone. Page transitions and chronological spreads can slow conversation. The portrait could become decoration, and the emotional difference between AI and operator would be harder to stage.

### C — The listening room

**Thesis:** A restrained architectural environment places Mira's representation at human scale within a believable room. A visible line travels through the floor and resolves at the interaction controls. Voice moves the room's lighting/line very slightly; spatial mode extends the same room.

**Mobile staging:** A central perspective preserves a stable horizon and readable overlays. Mode choice changes depth, not the user's location. Transcript and memory enter on a plane that does not cover Mira's face.

**Strength:** Highest potential spatial continuity and a memorable transition into the future renderer story.

**Failure mode:** A framed portrait in a largely empty 3D room easily feels like a gallery demo. It has the largest GPU and rendering risk, and can imply a capability the current system lacks. Navigation/room controls could consume the encounter. Starting here would ask the weakest current technology to carry the entire product.

## Recommendation

Choose **A as the main experience**, use **B's contextual annotation** for memory, and reserve **C as a chosen spatial escalation**. This is a hierarchy of responsibilities, not three simultaneous visual themes. The same portrait crop logic, typography, line grammar and authorship markers must carry across every state.

The distinctive element should be a **continuous relationship line** whose changes correspond to events. It can connect the remembered context, present conversation and human arrival, making continuity visible without representing memory as a database or inventing sentiment scores.

| State               | Line behavior                                                                                   | Required semantic evidence                                                                                                |
| ------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Arrival             | A short path resolves once into a stable line beside the identity.                              | Ready/paused state comes from the runtime. No perpetual loading illusion.                                                 |
| Remembered context  | One small branch joins a specific note to the latest response.                                  | Show only memory actually retrieved for this fan; offer inspect/delete. Label seeded history honestly.                    |
| Listening           | Small local movement at the fan endpoint, plus readable listening text.                         | Browser microphone state; stop control; transcript review before send. No pretend acoustic amplitude if none is measured. |
| Speaking            | A bounded segment reacts only while actual speech synthesis is active.                          | Speaking callback and immediate interrupt. Synthetic voice remains disclosed.                                             |
| Mode change         | The line's endpoints keep identity continuity while the composition opens or closes.            | Same fan/creator context and current entitlements. Avoid rebuilding unrelated sessions visually without context.          |
| Human arrival       | AI motion settles; a second endpoint resolves with a noticeable but short compositional change. | Explicit simulated operator joined state, human authorship and AI output paused. Color alone is insufficient.             |
| Revoked/unavailable | The line ends cleanly and controls become unavailable; preserve a dignified still state.        | Server revocation; stop browser media and do not invite another paid interaction.                                         |

An endpoint or line can be branded, but cannot become a gaze-tracking reticle, biometric signal, romantic bond-strength score or implied real-time human measurement. Avoid orbiting rings around the face, random pulses, fabricated heartbeat signals and interface movement unrelated to a real state.

## Concrete design constraints for the first build

- Protect Mira's face and eyes from all controls/subtitles at 390 × 844. The creator should dominate the first glance; a wide empty black panel beside a small portrait is not dominance.
- Give the latest response an intentional reading area. Prefer 16–20px conversation type on mobile and a controlled line length. Long replies must remain fully available without turning the screen into stacked cards.
- Use the blue accent for current action/state, not for every metadata label. Porcelain and graphite should provide stable readable surfaces. Dark-image captions need a consistent local contrast treatment.
- Keep one primary action per state. Entry invites time with Mira; listening offers stop; speaking offers interrupt; a locked surface explains the demo entitlement. Avoid multiple equally weighted call-to-action pills.
- Make text usable without audio, while voice has an unmistakable listening/speaking/idle rhythm. Do not request microphone permission on entry or auto-play sound.
- Keep transcript, memory and access management secondary but directly discoverable. A fan should not need to navigate a settings dashboard to delete a remembered note.
- Differentiate human arrival with geometry, heading, author marker and control state. Never let the user mistake a seeded message for an actual live creator response.
- Use short state transitions and a static reduced-motion equivalent. Reduced motion should preserve the line's meaning. Pause animation while hidden and avoid full-screen perpetual filter animation on mobile.
- Design unavailable, entitlement-denied, empty memory, long message, keyboard-open and network-error states with the same visual care as the hero. These states are part of the award-quality claim.

## Independent scoring method for rendered work

Score each category from 0–10, then multiply by its weight/10. The weights sum to 100. An unobserved category is **unscored**, not automatically credited. Record screenshots and behavior evidence with each scoring pass. Numerical scores are an internal judgment, not an Awwwards/FWA jury result.

| Category                | Weight | Evidence required for a high score                                                                     |
| ----------------------- | -----: | ------------------------------------------------------------------------------------------------------ |
| Emotional impact        |     10 | An encounter with Mira is the clear primary experience across entry and active use.                    |
| Originality             |     10 | A recognizable, meaningful visual mechanism beyond standard portrait-plus-chat conventions.            |
| Creator focus           |     10 | Image composition stays strong through typing, response, memory and controls.                          |
| Immersion               |      8 | Software recedes without hiding essential status or actions.                                           |
| Relationship continuity |     10 | Actual pair-specific memory shapes the response and an understandable visual cue.                      |
| Motion quality          |      8 | Recorded transitions communicate state; no gratuitous loops or reduced-motion regression.              |
| Mobile quality          |     10 | Intentional 390px staging, comfortable controls, keyboard and long-content behavior.                   |
| Visual mode             |      7 | Substantial premium compositional change, truthful still-image representation.                         |
| Spatial preview         |      7 | Coherent human scale, authored room and smooth lifecycle, with truthful limitations.                   |
| Human arrival           |      7 | Immediately legible, emotionally distinct, authorship-correct transition.                              |
| Accessibility           |      5 | Keyboard/focus, contrast, semantics, motion preference, readable critical labels and automated checks. |
| Performance             |      4 | Measured load/interaction and render lifecycle, not a subjective smoothness claim alone.               |
| Awards quality          |      4 | Distinctive, coherent and memorable craftsmanship that survives scrutiny beyond the hero screenshot.   |

**95 is a target, not a promised result.** A clean build and zero axe violations do not earn a high design score by themselves. Do not grant top scores for motion based only on screenshots, performance based only on a fast machine, or human arrival based only on a label change. A meaningful flaw in disclosure, interaction correctness, readable typography or mobile composition must be fixed before claiming completion at that level.
