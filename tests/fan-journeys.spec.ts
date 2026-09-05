import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import type { PresenceState } from "../src/lib/types";

const artifacts = "output/playwright/fan";
test.use({ viewport: { width: 390, height: 844 } });
test.beforeAll(() => mkdirSync(artifacts, { recursive: true }));

async function enter(page: Page) {
  await page.goto("/presence/mira");
  const entry = page.getByRole("button", { name: "SPEND TIME WITH MIRA" });
  await expect(entry).toBeEnabled();
  await expect(
    page.getByText("AI representation", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Fictional demo", { exact: true })).toBeVisible();
  await entry.click();
  await expect(
    page.getByRole("textbox", { name: "Message Mira", exact: true }),
  ).toBeEnabled();
  await expect(
    page.getByRole("button", { name: "Voice", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
}
async function api(
  page: Page,
  path: string,
  method = "GET",
  data?: unknown,
): Promise<PresenceState> {
  const response = await page.request.fetch(`/api/v1/${path}`, {
    method,
    headers: { origin: new URL(page.url()).origin },
    ...(data !== undefined ? { data } : {}),
  });
  expect(
    response.ok(),
    `${method} ${path}: ${await response.text()}`,
  ).toBeTruthy();
  return response.json();
}
async function send(page: Page, text: string) {
  const write = page.getByRole("button", {
    name: "Write a thought",
    exact: true,
  });
  if (await write.isVisible()) await write.click();
  await page
    .getByRole("textbox", { name: "Message Mira", exact: true })
    .fill(text);
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(
    page.getByRole("textbox", { name: "Message Mira", exact: true }),
  ).toBeEnabled();
  await expect(
    page.getByRole("textbox", { name: "Message Mira", exact: true }),
  ).toHaveValue("");
}
async function noOverflow(page: Page) {
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(391);
}

test("mobile invitation, explicit entry, private memory and continuity across surfaces", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await enter(page);
  await noOverflow(page);
  await page.getByRole("button", { name: "Pick up where we left off" }).click();
  await expect(page.locator(".fan-subtitle")).toContainText("Kyoto");
  await expect(page.locator(".fan-subtitle")).not.toContainText(
    "half marathon",
  );
  await page.locator(".fan-memory-cue").click();
  const memorySheet = page.getByRole("dialog", {
    name: "A thread worth keeping.",
  });
  const memory = "I enjoy blue-hour coastal photography.";
  await memorySheet
    .getByRole("textbox", { name: "Something you’d like Mira to remember" })
    .fill(memory);
  await memorySheet.getByRole("button", { name: "Keep this thread" }).click();
  await expect(memorySheet.getByText(memory, { exact: true })).toBeVisible();
  await expect(memorySheet).not.toContainText("half marathon");
  await page.keyboard.press("Escape");
  for (const mode of ["Text", "Visual", "Voice"]) {
    await page.getByRole("button", { name: mode, exact: true }).click();
    await expect(
      page.getByRole("button", { name: mode, exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    if (mode === "Visual") {
      await expect(
        page.getByRole("button", { name: "Write a thought", exact: true }),
      ).toBeVisible();
      await expect(
        page.getByRole("textbox", { name: "Message Mira", exact: true }),
      ).toBeHidden();
    }
    await send(page, "What do you remember about me?");
    await expect(page.locator(".fan-subtitle")).toContainText(
      "blue-hour coastal photography",
    );
    await noOverflow(page);
  }
  await page.getByRole("button", { name: "Spatial", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Spatial", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".fan-spatial")).toBeVisible();
  await expect(page.locator(".fan-memory-cue")).toContainText(memory);
  await send(page, "Tell me about photography");
  await expect(page.locator(".fan-subtitle")).toBeVisible();
  await expect(page.locator(".fan-subtitle")).toContainText("Alex");
  const fullReply = page.getByRole("button", {
    name: "Read full reply",
    exact: true,
  });
  await expect(fullReply).toBeVisible();
  await fullReply.click();
  const spatialTranscript = page.getByRole("dialog", {
    name: "The conversation so far.",
  });
  await expect(spatialTranscript).toContainText(
    "one frame and ten minutes",
  );
  await expect(spatialTranscript).toContainText(
    "What would you want that photograph to hold?",
  );
  await expect(spatialTranscript).toContainText("spatial");
  await page.keyboard.press("Escape");
  await noOverflow(page);
  await page.screenshot({ path: `${artifacts}/mobile-spatial.png` });
  await page.getByRole("button", { name: "Text", exact: true }).click();
  await page.getByRole("button", { name: "Conversation", exact: true }).click();
  const transcript = page.getByRole("dialog", {
    name: "The conversation so far.",
  });
  await expect(transcript).toContainText("MIRA · AI PRESENCE");
  await expect(transcript).toContainText("voice");
  await expect(transcript).toContainText("visual");
  await expect(transcript).not.toContainText("half marathon");
  await page.keyboard.press("Escape");
  await page.reload();
  await page.getByRole("button", { name: "SPEND TIME WITH MIRA" }).click();
  await expect(page.locator(".fan-memory-cue")).toContainText(memory);
  await page.screenshot({ path: `${artifacts}/mobile-conversation.png` });
  await testInfo.attach("mobile fan conversation", {
    path: `${artifacts}/mobile-conversation.png`,
    contentType: "image/png",
  });
  expect(errors).toEqual([]);
});

test("studio remains an operator while fan honors access, pause and persistent revocation", async ({
  page,
  context,
}) => {
  await enter(page);
  const studio = await context.newPage();
  await studio.goto("/studio");
  await expect(
    studio.getByRole("heading", { name: "A little more everywhere." }),
  ).toBeVisible();
  const operator = await api(studio, "state");
  const fan = await api(page, "fan/state");
  expect(operator.actor.role).toBe("creator");
  expect(fan.actor.role).toBe("fan");
  expect(fan.actor.workspaceId).toBe(operator.actor.workspaceId);
  expect(operator.fans).toHaveLength(3);
  expect(fan.fans).toHaveLength(1);
  await page.bringToFront();
  await api(studio, "creator", "PATCH", { voiceAuthorized: false });
  await expect(
    page.getByRole("heading", { name: "This space is resting." }),
  ).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "Message Mira" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Text", exact: true }).click();
  await expect(
    page.getByRole("textbox", { name: "Message Mira" }),
  ).toBeEnabled();
  await api(studio, "fans/fan-alex", "PATCH", { surfaces: ["visual"] });
  await expect(
    page.getByRole("heading", { name: "This space is resting." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Voice", exact: true }).click();
  await expect(
    page.getByRole("dialog", { name: "A little more presence." }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await api(studio, "fans/fan-alex", "PATCH", {
    surfaces: ["text", "voice", "visual", "spatial"],
  });
  await expect(
    page.getByRole("textbox", { name: "Message Mira" }),
  ).toBeEnabled();
  await api(studio, "creator", "PATCH", { enabled: false });
  await expect(
    page.getByRole("heading", { name: "A pause in the moment." }),
  ).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "Message Mira" }),
  ).toBeDisabled();
  await api(studio, "creator", "PATCH", { enabled: true });
  await expect(
    page.getByRole("textbox", { name: "Message Mira" }),
  ).toBeEnabled();
  await api(studio, "creator", "PATCH", { licenseStatus: "revoked" });
  await expect(
    page.getByRole("textbox", { name: "Message Mira" }),
  ).toBeDisabled();
  await expect(
    page.getByText("Presence withdrawn", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "SPEND TIME WITH MIRA" }),
  ).toBeDisabled();
  await expect(
    page.getByText(/Mira’s Presence is currently unavailable/),
  ).toBeVisible();
  expect((await api(studio, "state")).creator.licenseStatus).toBe("revoked");
});

test("human takeover is unmistakable, correctly authored, and suspends AI", async ({
  page,
}) => {
  await enter(page);
  await send(page, "A photography idea, please.");
  let state = await api(page, "fan/state");
  const sessionId = state.sessions[0].id;
  const before = state.metrics.aiMessages;
  await api(page, `sessions/${sessionId}/takeover`, "POST", { mode: "human" });
  await expect(
    page.getByRole("heading", { name: "Mira is here." }),
  ).toBeVisible();
  await expect(
    page.getByText("AI has stepped aside.", { exact: false }),
  ).toBeVisible();
  await page.screenshot({ path: `${artifacts}/mobile-takeover.png` });
  await page.getByRole("button", { name: "Be here", exact: true }).click();
  await expect(
    page.getByText("Creator joined · demo", { exact: true }),
  ).toBeVisible();
  await api(page, `sessions/${sessionId}/messages`, "POST", {
    text: "The fictional creator operator is writing this message.",
    requestId: crypto.randomUUID(),
  });
  await expect(page.locator(".fan-subtitle")).toContainText(
    "fictional creator operator is writing",
  );
  await expect(page.locator(".fan-subtitle")).toContainText(
    "MIRA / CREATOR OPERATOR",
  );
  await send(page, "Thank you for joining the creative conversation.");
  state = await api(page, "fan/state");
  expect(state.metrics.aiMessages).toBe(before);
  expect(state.sessions[0].messages.at(-1)?.role).toBe("fan");
  await page.getByRole("button", { name: "Visual", exact: true }).click();
  await expect(page.locator(".fan-error[role=alert]")).toContainText(
    "Return to AI Presence",
  );
  await api(page, `sessions/${sessionId}/takeover`, "POST", { mode: "ai" });
  await expect(
    page.getByText("AI Presence · available", { exact: true }),
  ).toBeVisible();
  await send(page, "Let’s make an ambient music idea.");
  await expect(page.locator(".fan-subtitle")).toContainText(
    "MIRA / AI PRESENCE",
  );
  expect((await api(page, "fan/state")).metrics.aiMessages).toBe(before + 1);
});

test("sheets keep keyboard focus, preserve drafts through polling, and restore focus on Escape", async ({
  page,
}) => {
  await enter(page);
  const composer = page.getByRole("textbox", {
    name: "Message Mira",
    exact: true,
  });
  await composer.fill("A thought I am still finishing");
  await page.waitForResponse((response) =>
    response.url().endsWith("/api/v1/fan/state"),
  );
  await expect(composer).toBeFocused();
  await expect(composer).toHaveValue("A thought I am still finishing");
  for (const [trigger, title] of [
    ["Conversation", "The conversation so far."],
    ["Enable spoken replies", "Let’s hear each other."],
    ["Alex’s access", "A little more presence."],
    ["About this AI Presence", "A presence, honestly."],
  ]) {
    const button = page.getByRole("button", { name: trigger, exact: true });
    await button.click();
    const dialog = page.getByRole("dialog", { name: title });
    await expect(dialog).toBeVisible();
    for (let index = 0; index < 8; index++) {
      await page.keyboard.press(index % 2 ? "Tab" : "Shift+Tab");
      expect(
        await dialog.evaluate((element) =>
          element.contains(document.activeElement),
        ),
      ).toBeTruthy();
    }
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(button).toBeFocused();
  }
  await expect(composer).toHaveValue("A thought I am still finishing");
  await page.getByRole("button", { name: "Leave session" }).click();
  await expect(
    page.getByRole("button", { name: "SPEND TIME WITH MIRA" }),
  ).toBeFocused();
});

test("fan entry, active scene and secondary sheets meet automated accessibility checks", async ({
  page,
}, testInfo) => {
  const findings: { state: string; violations: unknown[] }[] = [];
  const scan = async (state: string) => {
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    findings.push({ state, violations: result.violations });
  };
  await page.goto("/presence/mira");
  await expect(
    page.getByRole("button", { name: "SPEND TIME WITH MIRA" }),
  ).toBeEnabled();
  await page.screenshot({ path: `${artifacts}/mobile-entry.png` });
  await scan("mobile entry");
  await page.getByRole("button", { name: "SPEND TIME WITH MIRA" }).click();
  await expect(
    page.getByRole("textbox", { name: "Message Mira" }),
  ).toBeEnabled();
  await scan("mobile active");
  await page.locator(".fan-memory-cue").click();
  await scan("memory sheet");
  await noOverflow(page);
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Enable spoken replies", exact: true })
    .click();
  await scan("voice consent sheet");
  await page.keyboard.press("Escape");
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByRole("button", { name: "Leave session" }).click();
  await page.screenshot({ path: `${artifacts}/desktop-entry.png` });
  await scan("desktop entry");
  const filename = `${artifacts}/axe-fan.json`;
  writeFileSync(filename, JSON.stringify(findings, null, 2));
  await testInfo.attach("fan accessibility", {
    path: filename,
    contentType: "application/json",
  });
  expect(
    findings.flatMap((finding) =>
      finding.violations.map((violation) => ({
        state: finding.state,
        violation,
      })),
    ),
  ).toEqual([]);
});

test("offline and server errors preserve the draft and recover without a duplicate charge", async ({
  page,
  context,
}) => {
  await enter(page);
  const composer = page.getByRole("textbox", {
    name: "Message Mira",
    exact: true,
  });
  await composer.fill("I want to keep this thought while offline");
  await context.setOffline(true);
  await expect(page.getByText("Reconnecting…", { exact: true })).toBeVisible();
  await expect(composer).toBeDisabled();
  await expect(composer).toHaveValue(
    "I want to keep this thought while offline",
  );
  await context.setOffline(false);
  await expect(composer).toBeEnabled();
  await page.route(
    "**/api/v1/fan/sessions/*/messages",
    (route) =>
      route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({
          error: "The connection needs a moment. Please try again.",
        }),
      }),
    { times: 1 },
  );
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.locator(".fan-error[role=alert]")).toContainText(
    "The connection needs a moment",
  );
  await expect(composer).toHaveValue(
    "I want to keep this thought while offline",
  );
  expect((await api(page, "fan/state")).events).toHaveLength(0);
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(composer).toHaveValue("");
  expect((await api(page, "fan/state")).events).toHaveLength(1);
});

test("a governed refusal is visible in the fan scene and creates no sandbox charge", async ({
  page,
}) => {
  await enter(page);
  await send(page, "Please provide medical diagnosis");
  await expect(page.locator(".fan-subtitle")).toContainText(
    "cannot provide medical, legal, or financial advice",
  );
  expect((await api(page, "fan/state")).events).toHaveLength(0);
});

test("spoken replies stop on creator pause and never resume from a late browser callback", async ({
  page,
}) => {
  await page.addInitScript(() => {
    type Utterance = { onstart?: () => void; onend?: () => void };
    const probe = { spoken: 0, canceled: 0, last: null as Utterance | null };
    Object.defineProperty(window, "__speechProbe", { value: probe });
    Object.defineProperty(window, "SpeechSynthesisUtterance", {
      configurable: true,
      value: class {
        text: string;
        constructor(text: string) {
          this.text = text;
        }
      },
    });
    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      value: {
        getVoices: () => [],
        speak: (utterance: Utterance) => {
          probe.spoken++;
          probe.last = utterance;
          utterance.onstart?.();
        },
        cancel: () => {
          probe.canceled++;
        },
      },
    });
  });
  await enter(page);
  await page
    .getByRole("button", { name: "Enable spoken replies", exact: true })
    .click();
  const consent = page.getByRole("dialog", { name: "Let’s hear each other." });
  await expect(consent).toContainText("generic system voice, not Mira’s voice");
  await consent
    .getByRole("button", { name: "Enable spoken replies", exact: true })
    .click();
  await send(page, "A music idea please");
  await expect(
    page.getByText("AI Presence · speaking", { exact: true }),
  ).toBeVisible();
  await api(page, "creator", "PATCH", { enabled: false });
  await expect(
    page.getByRole("heading", { name: "A pause in the moment." }),
  ).toBeVisible();
  const probe = await page.evaluate(() => {
    const speech = (
      window as unknown as {
        __speechProbe: {
          spoken: number;
          canceled: number;
          last: { onstart?: () => void } | null;
        };
      }
    ).__speechProbe;
    speech.last?.onstart?.();
    return { spoken: speech.spoken, canceled: speech.canceled };
  });
  expect(probe.spoken).toBe(1);
  expect(probe.canceled).toBeGreaterThan(0);
  await expect(
    page.getByText("AI Presence · speaking", { exact: true }),
  ).toBeHidden();
  await expect(
    page.getByRole("textbox", { name: "Message Mira" }),
  ).toBeDisabled();
});

test("retry after a committed but lost response reuses the interaction and never meters twice", async ({
  page,
}) => {
  await enter(page);
  const composer = page.getByRole("textbox", {
    name: "Message Mira",
    exact: true,
  });
  await composer.fill("A photo idea for a quiet city morning");
  await page.route(
    "**/api/v1/fan/sessions/*/messages",
    async (route) => {
      const committed = await route.fetch();
      expect(committed.ok()).toBeTruthy();
      await route.abort("connectionreset");
    },
    { times: 1 },
  );
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.locator(".fan-error[role=alert]")).toBeVisible();
  await expect(composer).toHaveValue("A photo idea for a quiet city morning");
  expect((await api(page, "fan/state")).events).toHaveLength(1);
  await page
    .getByRole("button", { name: "Dismiss error", exact: true })
    .click();
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(composer).toHaveValue("");
  const state = await api(page, "fan/state");
  expect(state.events).toHaveLength(1);
  expect(
    state.sessions[0].messages.filter((message) => message.role === "ai"),
  ).toHaveLength(1);
});

test("demo director lets a reviewer discover takeover, pause and access changes through the UI", async ({
  page,
  context,
}) => {
  await enter(page);
  const director = await context.newPage();
  await director.goto("/demo");
  await expect(
    director.getByRole("heading", { name: "One presence. Two perspectives." }),
  ).toBeVisible();
  await expect(
    director.getByText("These controls change the actual shared workspace.", {
      exact: false,
    }),
  ).toBeVisible();
  const arrive = director.getByRole("button", { name: /Mira arrives/ });
  await expect(arrive).toBeEnabled();
  await arrive.click();
  await page.bringToFront();
  await expect(
    page.getByRole("heading", { name: "Mira is here." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Be here", exact: true }).click();
  await expect(page.locator(".fan-subtitle")).toContainText("creator operator");
  await director.bringToFront();
  await director.getByRole("button", { name: /Return to AI Presence/ }).click();
  await page.bringToFront();
  await expect(
    page.getByText("AI Presence · available", { exact: true }),
  ).toBeVisible();
  await director.bringToFront();
  await director.getByRole("button", { name: /Pause Presence/ }).click();
  await page.bringToFront();
  await expect(
    page.getByRole("textbox", { name: "Message Mira" }),
  ).toBeDisabled();
  await director.bringToFront();
  await director.getByRole("button", { name: /Resume Presence/ }).click();
  await director.getByRole("button", { name: /Limit access to text/ }).click();
  await page.bringToFront();
  await expect(
    page.getByRole("heading", { name: "This space is resting." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Text", exact: true }).click();
  await expect(
    page.getByRole("textbox", { name: "Message Mira" }),
  ).toBeEnabled();
  await director.bringToFront();
  await director
    .getByRole("button", { name: /Restore all four modes/ })
    .click();
  await director.screenshot({
    path: `${artifacts}/mobile-demo-director.png`,
    fullPage: true,
  });
  expect(
    await director.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(391);
  const axe = await new AxeBuilder({ page: director })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  writeFileSync(
    `${artifacts}/axe-demo-director.json`,
    JSON.stringify(axe.violations, null, 2),
  );
  expect(axe.violations.map((violation) => violation.id)).toEqual([]);
});

test("withdrawing microphone consent stops listening and rejects a late transcription", async ({
  page,
}) => {
  await page.addInitScript(() => {
    type ResultEvent = {
      resultIndex: number;
      results: { isFinal: boolean; 0: { transcript: string } }[];
    };
    const probe = {
      aborted: 0,
      deliverLate: null as ((event: ResultEvent) => void) | null,
    };
    Object.defineProperty(window, "__recognitionProbe", { value: probe });
    Object.defineProperty(window, "SpeechRecognition", {
      configurable: true,
      value: class {
        onstart: (() => void) | null = null;
        onresult: ((event: ResultEvent) => void) | null = null;
        start() {
          probe.deliverLate = this.onresult;
          this.onstart?.();
        }
        abort() {
          probe.aborted++;
        }
      },
    });
  });
  await enter(page);
  await page
    .getByRole("button", { name: "Speak to Mira", exact: true })
    .click();
  const voice = page.getByRole("dialog", { name: "Let’s hear each other." });
  await voice.getByRole("checkbox").check();
  await voice
    .getByRole("button", { name: "Keep the moment quiet. I’ll type." })
    .click();
  await page
    .getByRole("button", { name: "Speak to Mira", exact: true })
    .click();
  await expect(
    page.getByText("Listening to you", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Enable spoken replies", exact: true })
    .click();
  await voice.getByRole("checkbox").uncheck();
  await page.evaluate(() => {
    const probe = (
      window as unknown as {
        __recognitionProbe: { deliverLate: ((event: unknown) => void) | null };
      }
    ).__recognitionProbe;
    probe.deliverLate?.({
      resultIndex: 0,
      results: [
        {
          isFinal: true,
          0: { transcript: "This late transcription must never be sent" },
        },
      ],
    });
  });
  await page.keyboard.press("Escape");
  await expect(
    page.getByText("Listening to you", { exact: true }),
  ).toBeHidden();
  await expect(page.getByRole("textbox", { name: "Message Mira" })).toHaveValue(
    "",
  );
  expect(
    await page.evaluate(
      () =>
        (window as unknown as { __recognitionProbe: { aborted: number } })
          .__recognitionProbe.aborted,
    ),
  ).toBeGreaterThan(0);
  expect((await api(page, "fan/state")).events).toHaveLength(0);
  await page
    .getByRole("button", { name: "Speak to Mira", exact: true })
    .click();
  await expect(voice).toBeVisible();
  await expect(voice.getByRole("checkbox")).not.toBeChecked();
});

test("leaving during an in-flight mode change prevents late re-entry", async ({
  page,
}) => {
  await enter(page);
  let release!: () => void;
  let reached!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const intercepted = new Promise<void>((resolve) => {
    reached = resolve;
  });
  await page.route(
    "**/api/v1/fan/sessions",
    async (route) => {
      const response = await route.fetch();
      reached();
      await gate;
      await route.fulfill({ response });
    },
    { times: 1 },
  );
  await page.getByRole("button", { name: "Visual", exact: true }).click();
  await intercepted;
  await page.getByRole("button", { name: "Leave session" }).click();
  const response = page.waitForResponse(
    (result) =>
      result.url().endsWith("/api/v1/fan/sessions") &&
      result.request().method() === "POST",
  );
  release();
  await response;
  await expect(
    page.getByRole("button", { name: "SPEND TIME WITH MIRA" }),
  ).toBeEnabled();
  await expect(
    page.getByRole("textbox", { name: "Message Mira" }),
  ).toBeHidden();
  await expect(
    page.getByRole("button", { name: "Leave session" }),
  ).toBeHidden();
});
