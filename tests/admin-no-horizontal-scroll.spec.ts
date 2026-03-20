import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? '';

test.describe('Admin layout - no horizontal scroll on narrow viewport', () => {
  test.use({ viewport: { width: 400, height: 800 } });

  test('교육신청자접수현황: 좁은 화면에서 body 가로 스크롤 없음', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin`);
    if (page.url().includes('/admin/login') && ADMIN_PASSWORD) {
      await page.getByLabel('비밀번호').fill(ADMIN_PASSWORD);
      await page.getByRole('button', { name: '로그인' }).click();
      await expect(page).toHaveURL(new RegExp(`${BASE_URL}/admin$`));
    }
    await page.waitForLoadState('networkidle');

    const hasHorizontalScroll = await page.evaluate(() => {
      const doc = document.documentElement;
      return doc.scrollWidth > doc.clientWidth || document.body.scrollWidth > window.innerWidth;
    });
    expect(hasHorizontalScroll).toBe(false);
  });

  test('문의사항 현황: 좁은 화면에서 body 가로 스크롤 없음', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin`);
    if (page.url().includes('/admin/login') && ADMIN_PASSWORD) {
      await page.getByLabel('비밀번호').fill(ADMIN_PASSWORD);
      await page.getByRole('button', { name: '로그인' }).click();
      await expect(page).toHaveURL(new RegExp(`${BASE_URL}/admin$`));
    }
    await page.getByRole('button', { name: '문의사항 현황' }).click();
    await page.waitForLoadState('networkidle');

    const hasHorizontalScroll = await page.evaluate(() => {
      const doc = document.documentElement;
      return doc.scrollWidth > doc.clientWidth || document.body.scrollWidth > window.innerWidth;
    });
    expect(hasHorizontalScroll).toBe(false);
  });
});
