import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const artifacts = "output/playwright";
test.beforeAll(() => mkdirSync(artifacts, { recursive: true }));
test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "A little more everywhere." }),
  ).toBeVisible();
});

async function navigate(page: Page, name: string) {
  const open = page.getByRole("button", {
    name: "Open navigation",
    exact: true,
  });
  if (await open.isVisible()) await open.click();
  await page
    .locator(".sidebar")
    .getByRole("button", { name, exact: true })
    .click();
}

async function activate(page: Page) {
  await page
    .getByRole("button", { name: "Activate your Presence", exact: true })
    .click();
  const dialog = page.getByRole("dialog", { name: "Activate your Presence" });
  await expect(
    dialog.getByRole("button", { name: "Activate demo Presence" }),
  ).toBeDisabled();
  await dialog.getByRole("checkbox").check();
  await dialog.getByRole("button", { name: "Activate demo Presence" }).click();
  await expect(dialog).toBeHidden();
  await expect(
    page.getByRole("button", { name: "Experience your Presence", exact: true }),
  ).toBeVisible();
}

async function openAlex(page: Page) {
  await page
    .getByRole("button", { name: "Experience your Presence", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Presence conversation" }),
  ).toBeVisible();
}

async function send(page: Page, text: string, human = false) {
  await page
    .getByRole("textbox", {
      name: human ? "Message as creator" : "Message Mira’s Presence",
      exact: true,
    })
    .fill(text);
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.getByRole("log")).toContainText(text);
}

test("creator authorization, isolated recall, takeover and modality disclosures", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await activate(page);
  await openAlex(page);
  await expect(
    page.getByText("AI representation · not the human creator", {
      exact: true,
    }),
  ).toBeVisible();
  await send(page, "What do you remember about me?");
  await expect(page.locator(".message.ai")).toContainText("Kyoto");
  await expect(page.locator(".message.ai")).not.toContainText("half marathon");
  await page
    .getByRole("button", { name: "Join as creator", exact: true })
    .click();
  await expect(
    page.getByText("Human creator messages · simulated operator", {
      exact: true,
    }),
  ).toBeVisible();
  const count = await page.locator(".message.ai").count();
  await send(
    page,
    "A fictional operator is here for this creative conversation.",
    true,
  );
  await expect(page.locator(".message.human")).toContainText(
    "fictional operator",
  );
  await expect(page.locator(".message.ai")).toHaveCount(count);
  await page
    .getByRole("button", { name: "Hand back to AI", exact: true })
    .click();
  await expect(
    page.getByText("AI representation · not the human creator", {
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "voice", exact: true }).click();
  await expect(
    page.getByText(
      "AI representation · generic system voice, not Mira’s voice",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(
    page.getByText(/Your browser may send audio to its speech service/),
  ).toBeVisible();
  await page.getByRole("tab", { name: "visual", exact: true }).click();
  await expect(
    page.getByText("Generated still portrait · no live video", { exact: true }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "spatial", exact: true }).click();
  await expect(page.locator(".spatial-stage")).toBeVisible();
  await page.screenshot({
    path: `${artifacts}/desktop-spatial.png`,
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Close Presence conversation", exact: true })
    .click();
  await navigate(page, "Relationships");
  await page.getByRole("button", { name: /Jordan Ellis/ }).click();
  await page
    .getByRole("button", { name: "Start conversation", exact: true })
    .click();
  await send(page, "What do you remember about me?");
  await expect(page.locator(".message.ai")).toContainText("half marathon");
  await expect(page.locator(".message.ai")).not.toContainText("Kyoto");
  expect(errors).toEqual([]);
});

test("opt-in memory persists, stays separate, and deletes through UI", async ({
  page,
}) => {
  await activate(page);
  await navigate(page, "Relationships");
  const memory = "I enjoy quiet morning photography walks";
  await page
    .getByPlaceholder("e.g. I enjoy quiet morning photography walks")
    .fill(memory);
  await page.getByRole("button", { name: "Save memory", exact: true }).click();
  await expect(
    page.locator(".memory-item").filter({ hasText: memory }),
  ).toBeVisible();
  await page.reload();
  await navigate(page, "Relationships");
  await expect(
    page.locator(".memory-item").filter({ hasText: memory }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Jordan Ellis/ }).click();
  await expect(
    page.locator(".memory-item").filter({ hasText: memory }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: /Alex Chen/ }).click();
  await page
    .getByRole("button", { name: `Delete memory: ${memory}`, exact: true })
    .click();
  await expect(
    page.locator(".memory-item").filter({ hasText: memory }),
  ).toHaveCount(0);
  await page
    .getByRole("switch", { name: "Fan-approved memory", exact: true })
    .click();
  await expect(page.locator(".memory-item")).toHaveCount(0);
  await expect(
    page.getByPlaceholder("e.g. I enjoy quiet morning photography walks"),
  ).toBeDisabled();
});

test("creator pause and revoke propagate to an already open conversation", async ({
  page,
  context,
}) => {
  await activate(page);
  const fan = await context.newPage();
  await fan.goto("/");
  await openAlex(fan);
  await send(fan, "Tell me about photography");
  await page.bringToFront();
  await navigate(page, "My Presence");
  await page
    .getByRole("switch", { name: "Presence available", exact: true })
    .click();
  await expect(
    page.getByRole("switch", { name: "Presence available", exact: true }),
  ).toHaveAttribute("aria-checked", "false");
  await fan.bringToFront();
  await expect(
    fan.getByRole("textbox", { name: "Message Mira’s Presence", exact: true }),
  ).toBeDisabled();
  await expect(
    fan.getByText(
      "This Presence is unavailable. The creator’s rules apply here too.",
      { exact: true },
    ),
  ).toBeVisible();
  await page.bringToFront();
  await page
    .getByRole("switch", { name: "Presence available", exact: true })
    .click();
  await fan.bringToFront();
  await expect(
    fan.getByRole("textbox", { name: "Message Mira’s Presence", exact: true }),
  ).toBeEnabled();
  await page.bringToFront();
  await page
    .getByRole("button", { name: "Revoke Presence", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Revoke Presence", exact: true }),
  ).toBeDisabled();
  await fan.bringToFront();
  await expect(
    fan.getByRole("textbox", { name: "Message Mira’s Presence", exact: true }),
  ).toBeDisabled();
  await expect(
    fan.getByRole("button", { name: "Send message", exact: true }),
  ).toBeDisabled();
  await fan.screenshot({
    path: `${artifacts}/desktop-revoked-session.png`,
    fullPage: true,
  });
});

test("economic sliders recompute gross and shares without counting retention twice", async ({
  page,
}) => {
  await navigate(page, "Revenue");
  const values: Record<string, string> = {
    "Creators on the platform": "100",
    "Paying fans per creator": "50",
    "Presence adoption": "10",
    "Monthly Presence ARPU": "10",
    "Platform take rate": "20",
    "Potential retention uplift": "10",
  };
  for (const [name, value] of Object.entries(values))
    await page.getByRole("slider", { name, exact: true }).fill(value);
  await expect(page.locator(".annual-number")).toHaveText("$60K");
  await expect(page.locator(".split-labels")).toContainText("$48K");
  await expect(page.locator(".split-labels")).toContainText("$12K");
  await expect(page.locator(".retention-result")).toContainText(
    "50 potential retained relationships",
  );
  await page
    .getByRole("slider", { name: "Potential retention uplift", exact: true })
    .fill("20");
  await expect(page.locator(".annual-number")).toHaveText("$60K");
  await page.screenshot({
    path: `${artifacts}/desktop-economics.png`,
    fullPage: true,
  });
});

test("conversation keeps composer focus through polling and Escape restores trigger focus", async ({
  page,
}) => {
  await activate(page);
  await openAlex(page);
  const composer = page.getByRole("textbox", {
    name: "Message Mira’s Presence",
    exact: true,
  });
  await composer.fill("A draft should survive a refresh");
  await expect(composer).toBeFocused();
  for (let i = 0; i < 2; i++) {
    await page.waitForResponse(
      (response) =>
        response.url().endsWith("/api/v1/state") &&
        response.request().method() === "GET",
    );
    await expect(composer).toBeFocused();
    await expect(composer).toHaveValue("A draft should survive a refresh");
  }
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("dialog", { name: "Presence conversation" }),
  ).toBeHidden();
  await expect(
    page.getByRole("button", { name: "Experience your Presence", exact: true }),
  ).toBeFocused();
});

test("desktop navigation and accessibility scan", async ({
  page,
}, testInfo) => {
  const findings: unknown[] = [];
  await page.screenshot({
    path: `${artifacts}/desktop-overview.png`,
    fullPage: true,
  });
  for (const name of [
    "Overview",
    "My Presence",
    "Relationships",
    "Live sessions",
    "Revenue",
    "Integrations",
    "Settings & audit",
  ]) {
    await navigate(page, name);
    await expect(page.locator("main h1")).toBeVisible();
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    findings.push({ page: name, violations: result.violations });
  }
  writeFileSync(
    `${artifacts}/axe-desktop.json`,
    JSON.stringify(findings, null, 2),
  );
  await testInfo.attach("axe-desktop", {
    path: `${artifacts}/axe-desktop.json`,
    contentType: "application/json",
  });
  const violations = findings as {
    page: string;
    violations: { id: string; impact: string; nodes: unknown[] }[];
  }[];
  expect(
    violations.flatMap((f) =>
      f.violations.map(
        (v) => `${f.page}: ${v.id} (${v.impact}, ${v.nodes.length} nodes)`,
      ),
    ),
  ).toEqual([]);
});

test("mobile navigation, activation, conversation and no horizontal overflow", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: `${artifacts}/mobile-overview.png`,
    fullPage: true,
  });
  const overflow: string[] = [];
  for (const name of [
    "Overview",
    "My Presence",
    "Relationships",
    "Live sessions",
    "Revenue",
    "Integrations",
    "Settings & audit",
  ]) {
    await navigate(page, name);
    if (
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      )
    ) {
      overflow.push(name);
      const elements = await page
        .locator("main *")
        .evaluateAll((nodes) =>
          nodes
            .map((node) => ({
              tag: node.tagName,
              className: node.className,
              width: node.getBoundingClientRect().width,
              right: node.getBoundingClientRect().right,
            }))
            .filter((node) => node.right > innerWidth + 1),
        );
      writeFileSync(
        `${artifacts}/mobile-overflow-${name.replaceAll(" ", "-")}.json`,
        JSON.stringify(elements, null, 2),
      );
      await page.screenshot({
        path: `${artifacts}/mobile-overflow-${name.replaceAll(" ", "-")}.png`,
        fullPage: true,
      });
    }
  }
  await navigate(page, "Overview");
  await page
    .getByRole("button", { name: "Activate your Presence", exact: true })
    .click();
  const onboarding = page.getByRole("dialog", {
    name: "Activate your Presence",
  });
  for (const [first, next] of [
    [".onboarding-content h2", ".onboarding-content > p:first-of-type"],
    [".onboarding-content > p:first-of-type", ".consent-checks"],
    [".consent-checks", ".checkbox-label"],
  ]) {
    const firstBox = await onboarding.locator(first).boundingBox();
    const nextBox = await onboarding.locator(next).boundingBox();
    expect(firstBox).not.toBeNull();
    expect(nextBox).not.toBeNull();
    expect(firstBox!.y + firstBox!.height).toBeLessThanOrEqual(nextBox!.y + 1);
  }
  await page.screenshot({
    path: `${artifacts}/mobile-onboarding.png`,
    fullPage: false,
  });
  await page.keyboard.press("Escape");
  await activate(page);
  await openAlex(page);
  await send(page, "What do you remember about me?");
  await expect(page.locator(".message.ai")).toContainText("Kyoto");
  await expect(page.locator(".toast")).toBeHidden();
  const titleBox = await page.locator(".visual-caption h2").boundingBox();
  const disclosureBox = await page
    .locator(".portrait-disclosure")
    .boundingBox();
  expect(titleBox).not.toBeNull();
  expect(disclosureBox).not.toBeNull();
  expect(titleBox!.y + titleBox!.height).toBeLessThanOrEqual(disclosureBox!.y);
  await page.screenshot({
    path: `${artifacts}/mobile-conversation.png`,
    fullPage: false,
  });
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(391);
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  writeFileSync(
    `${artifacts}/axe-mobile.json`,
    JSON.stringify(result.violations, null, 2),
  );
  await testInfo.attach("axe-mobile", {
    path: `${artifacts}/axe-mobile.json`,
    contentType: "application/json",
  });
  expect(overflow).toEqual([]);
  expect(result.violations.map((v) => `${v.id} (${v.impact})`)).toEqual([]);
});
