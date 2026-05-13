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
  await page.getByLabel(/Ask about Sean/i).fill("What does Sean build?");
  await page.getByRole("button", { name: /Send/i }).click();
  await expect(page.getByText("Sean builds eval-first LLM systems.")).toBeVisible();
});
