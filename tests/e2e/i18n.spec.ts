import { expect, test } from "@playwright/test";

test("homepage and chat support zh URL locale", async ({ page }) => {
  await page.setExtraHTTPHeaders({ "Accept-Language": "zh-CN,zh;q=0.9" });
  await page.goto("/?lang=zh");
  await expect(page.locator("html")).toHaveAttribute("lang", "zh");
  await page.goto("/chat?lang=zh");
  await expect(page.getByRole("heading", { name: /和 Sean 聊聊/ })).toBeVisible();
});
