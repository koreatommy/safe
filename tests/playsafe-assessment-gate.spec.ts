import { expect, test, type Page } from "@playwright/test";

const ASSESSMENT_PASSWORD = process.env.ASSESSMENT_PASSWORD ?? "";

async function loginAssessment(page: Page) {
  await page.goto("/assessment/login");
  if (!ASSESSMENT_PASSWORD) {
    throw new Error("ASSESSMENT_PASSWORD env is required for assessment e2e");
  }
  await page.getByLabel("비밀번호").fill(ASSESSMENT_PASSWORD);
  await page.getByRole("button", { name: "로그인하고 시작하기" }).click();
  await expect(page).toHaveURL(/\/assessment\/facility/);
}

test("로그인 없이 안전성평가에 들어가면 로그인으로 보낸다", async ({ page }) => {
  await page.goto("/assessment");
  await expect(page).toHaveURL(/\/assessment\/login/);
  await expect(page.getByRole("heading", { name: "안전성평가 로그인" })).toBeVisible();
});

test("시설정보 없이 안전성평가에 들어가면 입력을 요구한다", async ({ page }) => {
  await loginAssessment(page);
  await page.goto("/assessment");
  await expect(page.getByText("시설정보 입력을 먼저 완료해 주세요.")).toBeVisible();
});

test("시설정보 입력에 이메일과 동의 항목이 있다", async ({ page }) => {
  await loginAssessment(page);
  await expect(page.getByLabel("이메일")).toBeVisible();
  await expect(page.getByText("저장하는 데 동의합니다")).toBeVisible();
});
