import { expect, test } from "@playwright/test";

test("homepage CTA opens chat and receives a mocked answer", async ({ page }) => {
  await page.route("**/api/chat", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ message: "Sean builds eval-first LLM systems." }),
    });
  });

  await page.goto("/");
  await page.getByRole("link", { name: /Talk to Sean/i }).first().click();
  await expect(page).toHaveURL(/\/chat/);
  await expect(page.locator("[data-chat-ready='true']")).toBeVisible();
  await page.getByLabel(/Ask about Sean/i).fill("What does Sean build?");
  await expect(page.getByRole("button", { name: /Send/i })).toBeEnabled();
  await page.getByRole("button", { name: /Send/i }).click();
  await expect(page.getByText("Sean builds eval-first LLM systems.")).toBeVisible();
});

test("homepage keeps project-first architecture and linked capability interactions", async ({ page }) => {
  await page.goto("/");

  const sectionIds = await page.locator("#main-content section[id]").evaluateAll((sections) =>
    sections.map((section) => section.id),
  );
  expect(sectionIds).toEqual([
    "projects",
    "skills",
    "activity",
    "about",
    "education",
    "languages",
    "publications",
    "contact",
  ]);

  await page
    .getByRole("banner")
    .getByRole("navigation", { name: /portfolio sections/i })
    .getByRole("link", { name: /^projects$/i })
    .click();
  await expect(page.locator("#projects")).toBeInViewport();

  const cloud = page.getByRole("group", { name: /core technology ecosystem/i });
  await cloud.getByRole("button", { name: "FastAPI" }).focus();
  await expect(page.getByRole("button", { name: /^Backend:/ })).toHaveAttribute("data-active", "true");
});

test("homepage has no viewport overflow and honors reduced motion on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
  expect(hasHorizontalOverflow).toBe(false);
  await expect(page.locator(".fluid-cursor-canvas")).toHaveCount(0);
  await expect(page.getByRole("navigation", { name: /portfolio sections/i })).toBeVisible();
  await expect(page.getByRole("list", { name: /engineering capability matrix/i })).toBeVisible();
});
