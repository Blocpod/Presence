# Presence surfaces

All surfaces consume the same governed session. A renderer never decides who may speak, which memory to retrieve, whether a license is valid, or what to charge. The server remains the authority for authorization, creator policy, relationship isolation, and sandbox events. Client controls must stop voice and unmount spatial output when that authority changes.

## Implemented: browser voice

`src/lib/voice.ts` exports a `VoiceProvider` interface and a `BrowserVoiceProvider` adapter. It exposes speech and recognition capabilities separately, plays approved text using a generic system voice, supports cancellation, and captures a final transcript for review before sending. It has no API keys, creator voice samples, voice cloning, autoplay, or real billing. Prefer a local English system voice when available; actual synthesis availability and quality depend on the browser/OS. The adapter alone does not enforce server permission: the caller must supply only an authorized response and cancel playback when a session is revoked or switched.

Microphone recognition requires a deliberate user gesture and browser permission. It is not guaranteed to be on-device: browsers may send audio to their speech service. The UI must show `recognitionDisclosure` before microphone activation. Transcription populates a draft, and the fan sends it explicitly. Browser errors and missing APIs lead back to text without pretending transcription happened. No audio is stored by Presence.

An external voice provider would implement the same interface plus authorized voice identifiers, streaming transport, server credentials, licensed provenance, cancellation, cost telemetry, and per-session policy checks. Those integrations require explicit configuration and are future work.

## Implemented: spatial portrait

`src/components/spatial-stage.tsx` renders a real Three.js/WebGL scene with an authorized fictional demo portrait, orbit/zoom controls, keyboard navigation, restrained presence rings, and a room grid. It is a two-dimensional image placed in three-dimensional space. It is not a rigged avatar, live video, facial animation, or lip sync. The speaking rings visualize application playback state; they do not analyze an audio signal. AI disclosure is rendered both in HTML and on a plane inside the scene, including immersive sessions.

The component checks `isSessionSupported` separately for immersive VR and AR and only offers supported modes. Entering requires a user gesture and the browser's permission flow. The WebXR manager uses a local reference space; the virtual scene is placed ahead of the starting viewer pose. AR removes the opaque scene background and room floor. It is a fixed initial placement preview, without hit testing, anchors, plane detection, occlusion, hand tracking, or spatial persistence.

Devices without WebXR retain the draggable 3D preview and receive an explicit capability explanation. A browser without WebGL receives a fallback notice. No headset or AR-device verification is claimed: the actual hardware journeys remain a pilot acceptance check. WebXR also requires a secure context (localhost or HTTPS).

`active={false}` removes the renderer, ends any XR session, disposes controls/geometries/materials/textures, disconnects observers, and stops the frame loop. Reduced-motion preference disables ambient ring motion. Rendering resolution is capped at 1.75 device pixel ratio.

## Future provider boundary

Photorealistic avatar, WebRTC video, and richer XR adapters should receive an ephemeral session grant containing creator ID, fan-session scope, license/policy versions, surface permission, disclosed source provenance, and an expiry. They should consume approved output rather than bypass the governed runtime. Revocation must close the transport and delete cached render grants. Raw voice/likeness assets and provider credentials must never be exposed through public client configuration.

## Evidence and sources

- `npx eslint src/components/spatial-stage.tsx src/lib/voice.ts` passed on 2026-09-05.
- An isolated browser-adapter lifecycle smoke test passed: unsupported fallback, speech cancellation resolves exactly once, final recognition text populates a draft callback, recognition cancellation resolves once, and stopped recognition removes stale transcript handlers. The check used browser API fakes; actual microphone, audio quality, and headset output require real-device verification.
- TypeScript reported no errors in these files; at the initial check, the app page referenced an unfinished parallel `studio` component. The root release run must repeat the complete typecheck and browser journey.
- [Three.js WebXRManager](https://threejs.org/docs/pages/WebXRManager.html): session attachment and reference-space API.
- [MDN SpeechRecognition](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition): browser capability and possible server-based recognition.
- [MDN WebXR Device API](https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API): capability and secure-context requirements.
