import { expect, test } from "@playwright/test";

test("chat starter prompt and reset return to the welcome state", async ({ page }) => {
  await page.goto("/chat");
  await page.getByRole("button", { name: /strongest engineering skills/i }).click();
  await expect(page.getByLabel(/Ask about Sean/i)).toHaveValue(/strongest engineering skills/i);
  await page.getByRole("button", { name: /Reset/i }).click();
  await expect(page.getByText(/Ready for questions/i)).toBeVisible();
});

test("chat renders service configuration errors", async ({ page }) => {
  await page.route("**/api/chat", async (route) => {
    await route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ errorCode: "MISSING_API_KEY" }),
    });
  });

  await page.goto("/chat");
  await page.getByLabel(/Ask about Sean/i).fill("Hello");
  await page.getByRole("button", { name: /Send/i }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Service not configured" })).toBeVisible();
});
