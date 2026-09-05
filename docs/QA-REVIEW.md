# Independent browser QA

Reviewed 2026-09-05 by an agent separate from the UI/runtime implementers. The final development-server run passed **7/7 browser journeys in 35.7 seconds**. Tests drove the real local UI using Playwright and installed Chrome at `http://127.0.0.1:3000`; mutations were performed through visible controls, not API shortcuts. Each test used a fresh browser context/workspace, with one sequential worker. Desktop viewport: 1440 × 1000. Mobile viewport: 390 × 844, reduced motion enabled.

Production-build verification is a separate release step owned by the main build agent. Its results belong in [../EVALS.md](../EVALS.md) and [BUILD-LOG.md](BUILD-LOG.md); this report does not claim that the development-server run tested a production deployment.

## Verified journeys

| Journey | Browser evidence |
| --- | --- |
| Creator authorization and modalities | Activation button disabled until fictional authorization checkbox selected; AI disclosure visible; voice/generic-system-voice and optional external browser transcription disclosures visible; visual portrait disclosure visible; spatial canvas rendered without page errors. |
| Separate relationships and takeover | Alex recalls Kyoto without Jordan's marathon history; Jordan recalls the marathon without Kyoto. Operator takeover shows simulated human disclosure and human-authored message; AI message count does not increase during takeover; handback restores AI disclosure. |
| Memory control | UI-saved creative preference survives reload; absent from Jordan's relationship; single-memory deletion removes it; opt-out deletes remaining memory and disables saving. |
| Permission propagation | An already open second-page conversation becomes disabled after creator pause, usable after resume, and disabled after revocation. Send remains disabled. State is polled; this is not zero-latency push delivery. |
| Economics | 100 creators × 50 fans × 10% adoption × $10/month × 12 gives $60K annual gross; 20% take yields $12K platform/$48K creator. Increasing retention from 10% to 20% changes retained relationships without inflating gross revenue. |
| Focus lifecycle | Draft text and composer focus survive two actual state-poll responses; Escape closes the modal and returns focus to the launch button. |
| Mobile and accessibility | All seven navigation destinations render; no horizontal page overflow at 390px; activation and chat work; onboarding sections and portrait disclosure do not overlap; axe scans pass for all seven desktop destinations and the mobile conversation. |

## Findings fixed during the loop

1. **Low-contrast secondary text:** Initial axe scan reported serious color-contrast violations across all seven destinations, with 10–38 affected nodes per page. Mobile chat author/time labels and inactive tabs also failed. The UI author darkened the muted palette and updated message/disclosure colors. Final scans contain zero violations for the enabled WCAG 2 A/AA and WCAG 2.1 AA rules.
2. **Mobile Integrations overflow:** Two grid panels extended to approximately 406px on a 390px viewport. Grid minimum sizing and wrapping were corrected. The regression visits every navigation destination and checks document scroll width.
3. **Mobile portrait disclosure overlap:** The generated-portrait disclaimer overlapped Mira's heading. Caption/disclosure positioning was corrected. A bounding-box assertion now prevents the overlap from returning.
4. **Focus refresh risk:** A dedicated regression now checks that asynchronous state polling does not reset input focus or discard a draft and that closing restores focus correctly.

The first mobile-run failure also included a **test selector issue**: it expected a desktop-only status card to be visible on mobile. The test now asserts the visible activated launch CTA. This was not reported as a product defect.

## Artifacts and reproduction

- Test source: [../tests/journeys.spec.ts](../tests/journeys.spec.ts)
- Runner: [../playwright.config.ts](../playwright.config.ts)
- Screenshots: `output/playwright/desktop-overview.png`, `desktop-spatial.png`, `desktop-economics.png`, `desktop-revoked-session.png`, `mobile-overview.png`, `mobile-onboarding.png`, `mobile-conversation.png`.
- Machine-readable accessibility findings: `output/playwright/axe-desktop.json` and `axe-mobile.json`.
- HTML report and retained failure traces: `output/playwright/report/` and `output/playwright/test-results/`. Earlier overflow diagnostic files may remain as historical evidence; the current test result is authoritative.

After installing dependencies, build and install Chromium, then run:

```sh
npm run build
npx playwright install chromium
npm run test:e2e
```

The config starts a local production preview automatically with demo mode explicitly enabled, or reuses an existing local server outside CI. `PRESENCE_TEST_URL=http://127.0.0.1:3001` selects another port. `PRESENCE_BROWSER_CHANNEL=chrome` uses installed Chrome; default uses Playwright Chromium, including CI. This review used installed Chrome because it was available locally.

## What remains unverified

Automated accessibility scans do not establish complete WCAG conformance. Manual screen-reader use, high zoom, forced colors, speech permissions/playback, keyboard behavior beyond the tested focus path, touch-device behavior and larger device/browser coverage remain pilot work. The mobile viewport is an emulation, not a physical-phone test.

No live LLM, voice cloning, photorealistic streaming provider, real payment, headset immersion, real creator license or verified age/identity was tested. Rendering a spatial scene does not certify WebXR hardware support. Two tabs demonstrate state propagation; they do not establish production concurrency or revocation latency guarantees. Backend security findings are documented separately in [../SECURITY.md](../SECURITY.md).

Visual assessment: the desktop composition presents the creator first, with clear navigation and calm hierarchy; the revised mobile chat keeps AI disclosure and controls visible. The intentionally compact secondary typography should still be evaluated with real users, especially on smaller physical screens. No customer preference, acquisition value, conversion or retention conclusion follows from this QA pass.
