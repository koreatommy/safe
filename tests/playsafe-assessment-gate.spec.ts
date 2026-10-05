import { expect, test } from "@playwright/test";

test("시설정보 없이 안전성평가에 들어가면 입력을 요구한다", async ({ page }) => {
  await page.goto("/assessment");
  await expect(page.getByText("시설정보 입력을 먼저 완료해 주세요.")).toBeVisible();
});

test("시설정보 입력에 이메일과 동의 항목이 있다", async ({ page }) => {
  await page.goto("/assessment/facility");
  await expect(page.getByLabel("이메일")).toBeVisible();
  await expect(page.getByText("저장하는 데 동의합니다")).toBeVisible();
});
