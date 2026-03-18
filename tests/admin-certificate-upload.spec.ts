import { test, expect, Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';

/**
 * 관리자 모드 수료증 업로드 E2E 테스트
 * 
 * 테스트 시나리오:
 * 1. 관리자 로그인
 * 2. 수료증 파일 업로드
 * 3. 업로드 성공 확인
 * 4. 파일 삭제 테스트
 */

test.describe('관리자 모드 수료증 업로드', () => {
  const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? '';
  const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
  
  // 테스트용 PDF 파일 생성 헬퍼 함수
  async function createTestPDF(filePath: string): Promise<void> {
    // 간단한 PDF 바이너리 데이터 (최소한의 유효한 PDF 구조)
    const pdfContent = Buffer.from([
      0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34, // %PDF-1.4
      0x0A, 0x25, 0xE2, 0xE3, 0xCF, 0xD3, 0x0A, // PDF 헤더
      0x31, 0x20, 0x30, 0x20, 0x6F, 0x62, 0x6A, 0x0A, // 1 0 obj
      0x3C, 0x3C, 0x2F, 0x54, 0x79, 0x70, 0x65, 0x2F, // <</Type/
      0x43, 0x61, 0x74, 0x61, 0x6C, 0x6F, 0x67, 0x2F, // Catalog/
      0x50, 0x61, 0x67, 0x65, 0x73, 0x20, 0x32, 0x20, // Pages 2 
      0x30, 0x20, 0x52, 0x3E, 0x3E, 0x0A, // 0 R>>
      0x65, 0x6E, 0x64, 0x6F, 0x62, 0x6A, 0x0A, // endobj
      0x25, 0x25, 0x45, 0x4F, 0x46 // %%EOF
    ]);
    
    await fs.promises.writeFile(filePath, pdfContent);
  }
  
  // 테스트 전 설정
  test.beforeEach(async ({ page }) => {
    // 콘솔 메시지 로깅
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error(`브라우저 콘솔 에러: ${msg.text()}`);
      } else if (msg.text().includes('[파일 업로드]')) {
        console.log(`브라우저 콘솔: ${msg.text()}`);
      }
    });
    
    // 네트워크 에러 로깅
    page.on('pageerror', error => {
      console.error(`페이지 에러: ${error.message}`);
    });
  });
  
  /**
   * 관리자 로그인 헬퍼 함수
   */
  async function loginAsAdmin(page: Page): Promise<void> {
    await page.goto(`${BASE_URL}/admin`);
    
    // 이미 로그인된 상태인지 확인
    const currentUrl = page.url();
    
    if (currentUrl.includes('/admin/login')) {
      // 로그인 페이지에 있다면 로그인 수행
      await page.getByLabel('비밀번호').fill(ADMIN_PASSWORD);
      await page.getByRole('button', { name: '로그인' }).click();
      
      // 관리자 대시보드로 이동 확인
      await expect(page).toHaveURL(`${BASE_URL}/admin`);
    }
    
    // 관리자 페이지 요소 확인 (신청자 접수현황 텍스트로 확인)
    await expect(page.getByText('신청자 접수현황')).toBeVisible({ timeout: 10000 });
  }
  
  test('관리자 로그인 성공', async ({ page }) => {
    await loginAsAdmin(page);
    
    // 관리자 대시보드 요소들이 표시되는지 확인
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('button', { name: '전체' })).toBeVisible();
    await expect(page.getByRole('button', { name: '대기' })).toBeVisible();
    await expect(page.getByRole('button', { name: '확정' })).toBeVisible();
    await expect(page.getByRole('button', { name: '취소' })).toBeVisible();
  });
  
  test('수료증 파일 업로드 - 성공 시나리오', async ({ page }) => {
    // 테스트 PDF 파일 생성
    const testPdfPath = path.join(process.cwd(), 'test-certificate.pdf');
    await createTestPDF(testPdfPath);
    
    try {
      // 관리자 로그인
      await loginAsAdmin(page);
      
      // 페이지가 완전히 로드될 때까지 대기
      await page.waitForLoadState('networkidle');
      // 테이블이 로드될 때까지 대기
      await page.waitForSelector('table', { timeout: 15000 });
      
      // 첫 번째 신청 항목 찾기
      const firstRow = page.locator('tbody tr').first();
      const hasData = await firstRow.count() > 0;
      
      if (!hasData) {
        console.log('테스트할 신청 데이터가 없습니다. 테스트를 건너뜁니다.');
        test.skip();
        return;
      }
      
      // 파일 업로드 버튼 찾기 (첫 번째 행의 업로드 버튼)
      const uploadButton = firstRow.locator('[data-testid="upload-button"], button:has-text("업로드"), label:has(input[type="file"])').first();
      
      // 파일 입력 요소 찾기
      const fileInput = firstRow.locator('input[type="file"]').first();
      
      // 파일 선택
      await fileInput.setInputFiles(testPdfPath);
      
      // 업로드 성공 메시지 확인
      const successDialog = page.getByText('수료증 파일이 성공적으로 업로드되었습니다.');
      await expect(successDialog).toBeVisible({ timeout: 15000 });
      
      // 다이얼로그 확인 버튼 클릭
      await page.getByRole('button', { name: '확인' }).click();
      
      // 업로드된 파일 표시 확인 (다운로드 버튼 또는 파일 링크)
      const fileLink = firstRow.locator('a[href*="certificates"], button:has-text("다운로드")');
      await expect(fileLink).toBeVisible({ timeout: 5000 });
      
      console.log('✅ 수료증 파일 업로드 성공');
      
    } finally {
      // 테스트 파일 정리
      try {
        await fs.promises.unlink(testPdfPath);
      } catch (e) {
        // 파일이 없어도 무시
      }
    }
  });
  
  test('수료증 파일 업로드 - 잘못된 파일 형식', async ({ page }) => {
    // 테스트용 텍스트 파일 생성
    const testTxtPath = path.join(process.cwd(), 'test-certificate.txt');
    await fs.promises.writeFile(testTxtPath, 'This is not a PDF file');
    
    try {
      // 관리자 로그인
      await loginAsAdmin(page);
      
      // 페이지가 완전히 로드될 때까지 대기
      await page.waitForLoadState('networkidle');
      // 테이블이 로드될 때까지 대기
      await page.waitForSelector('table', { timeout: 15000 });
      
      // 첫 번째 신청 항목 찾기
      const firstRow = page.locator('tbody tr').first();
      const hasData = await firstRow.count() > 0;
      
      if (!hasData) {
        console.log('테스트할 신청 데이터가 없습니다. 테스트를 건너뜁니다.');
        test.skip();
        return;
      }
      
      // 파일 입력 요소 찾기
      const fileInput = firstRow.locator('input[type="file"]').first();
      
      // accept 속성을 임시로 변경하여 텍스트 파일 선택 가능하게 함
      await fileInput.evaluate(el => el.removeAttribute('accept'));
      
      // 텍스트 파일 선택
      await fileInput.setInputFiles(testTxtPath);
      
      // 에러 메시지 확인
      const errorDialog = page.getByText('PDF 파일만 업로드 가능합니다.');
      await expect(errorDialog).toBeVisible({ timeout: 5000 });
      
      console.log('✅ 잘못된 파일 형식 거부 확인');
      
    } finally {
      // 테스트 파일 정리
      try {
        await fs.promises.unlink(testTxtPath);
      } catch (e) {
        // 파일이 없어도 무시
      }
    }
  });
  
  test('수료증 파일 삭제', async ({ page }) => {
    // 먼저 파일을 업로드한 후 삭제 테스트
    const testPdfPath = path.join(process.cwd(), 'test-certificate-delete.pdf');
    await createTestPDF(testPdfPath);
    
    try {
      // 관리자 로그인
      await loginAsAdmin(page);
      
      // 페이지가 완전히 로드될 때까지 대기
      await page.waitForLoadState('networkidle');
      // 테이블이 로드될 때까지 대기
      await page.waitForSelector('table', { timeout: 15000 });
      
      // 첫 번째 신청 항목 찾기
      const firstRow = page.locator('tbody tr').first();
      const hasData = await firstRow.count() > 0;
      
      if (!hasData) {
        console.log('테스트할 신청 데이터가 없습니다. 테스트를 건너뜁니다.');
        test.skip();
        return;
      }
      
      // 파일이 이미 업로드되어 있는지 확인
      const deleteButton = firstRow.locator('button:has-text("삭제"), button[aria-label="파일 삭제"]');
      const hasFile = await deleteButton.count() > 0;
      
      if (!hasFile) {
        // 파일이 없으면 먼저 업로드
        const fileInput = firstRow.locator('input[type="file"]').first();
        await fileInput.setInputFiles(testPdfPath);
        
        // 업로드 성공 대기
        const successDialog = page.getByText('수료증 파일이 성공적으로 업로드되었습니다.');
        await expect(successDialog).toBeVisible({ timeout: 15000 });
        await page.getByRole('button', { name: '확인' }).click();
      }
      
      // 삭제 버튼 클릭
      await firstRow.locator('button:has-text("삭제"), button[aria-label="파일 삭제"]').first().click();
      
      // 확인 다이얼로그 처리
      page.on('dialog', async dialog => {
        if (dialog.message().includes('수료증 파일을 삭제하시겠습니까?')) {
          await dialog.accept();
        }
      });
      
      // 삭제 성공 메시지 확인
      const deleteSuccessDialog = page.getByText('파일이 삭제되었습니다.');
      await expect(deleteSuccessDialog).toBeVisible({ timeout: 10000 });
      
      console.log('✅ 수료증 파일 삭제 성공');
      
    } finally {
      // 테스트 파일 정리
      try {
        await fs.promises.unlink(testPdfPath);
      } catch (e) {
        // 파일이 없어도 무시
      }
    }
  });
  
  test('개발자 도구 콘솔 로그 확인', async ({ page }) => {
    // 테스트 PDF 파일 생성
    const testPdfPath = path.join(process.cwd(), 'test-console.pdf');
    await createTestPDF(testPdfPath);
    
    const consoleLogs: string[] = [];
    
    // 콘솔 로그 수집
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('[파일 업로드]')) {
        consoleLogs.push(text);
      }
    });
    
    try {
      // 관리자 로그인
      await loginAsAdmin(page);
      
      // 페이지가 완전히 로드될 때까지 대기
      await page.waitForLoadState('networkidle');
      // 테이블이 로드될 때까지 대기
      await page.waitForSelector('table', { timeout: 15000 });
      
      // 첫 번째 신청 항목 찾기
      const firstRow = page.locator('tbody tr').first();
      const hasData = await firstRow.count() > 0;
      
      if (!hasData) {
        console.log('테스트할 신청 데이터가 없습니다. 테스트를 건너뜁니다.');
        test.skip();
        return;
      }
      
      // 파일 업로드
      const fileInput = firstRow.locator('input[type="file"]').first();
      await fileInput.setInputFiles(testPdfPath);
      
      // 업로드 완료 대기
      await page.waitForTimeout(5000);
      
      // 콘솔 로그 검증
      console.log('=== 수집된 콘솔 로그 ===');
      consoleLogs.forEach(log => console.log(log));
      
      // 주요 로그가 있는지 확인
      expect(consoleLogs.some(log => log.includes('========== 시작 =========='))).toBeTruthy();
      expect(consoleLogs.some(log => log.includes('프로젝트 ID:'))).toBeTruthy();
      expect(consoleLogs.some(log => log.includes('Storage API 호출 중'))).toBeTruthy();
      
      // 성공 또는 실패 로그 확인
      const hasSuccess = consoleLogs.some(log => log.includes('✅'));
      const hasError = consoleLogs.some(log => log.includes('❌'));
      
      if (hasSuccess) {
        console.log('✅ 파일 업로드 성공 로그 확인됨');
        expect(consoleLogs.some(log => log.includes('전체 프로세스 완료'))).toBeTruthy();
      } else if (hasError) {
        console.log('❌ 파일 업로드 실패 로그 확인됨');
        // 에러 상세 정보 출력
        const errorLogs = consoleLogs.filter(log => log.includes('❌') || log.includes('오류'));
        errorLogs.forEach(log => console.error(log));
      }
      
    } finally {
      // 테스트 파일 정리
      try {
        await fs.promises.unlink(testPdfPath);
      } catch (e) {
        // 파일이 없어도 무시
      }
    }
  });
});

// 성능 테스트
  test.describe('성능 및 안정성 테스트', () => {
  const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? '';
  const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
  
  test('대용량 파일 업로드 거부 (10MB 초과)', async ({ page }) => {
    // 10MB 초과 파일 생성 (11MB)
    const largePdfPath = path.join(process.cwd(), 'large-certificate.pdf');
    const largeContent = Buffer.alloc(11 * 1024 * 1024); // 11MB
    largeContent[0] = 0x25; // PDF 시작 바이트
    largeContent[1] = 0x50;
    largeContent[2] = 0x44;
    largeContent[3] = 0x46;
    
    await fs.promises.writeFile(largePdfPath, largeContent);
    
    try {
      // 관리자 로그인
      await page.goto(`${BASE_URL}/admin`);
      await page.getByLabel('비밀번호').fill(ADMIN_PASSWORD);
      await page.getByRole('button', { name: '로그인' }).click();
      await expect(page).toHaveURL(`${BASE_URL}/admin`);
      
      // 테이블 로드 대기
      await page.waitForSelector('table', { timeout: 10000 });
      
      const firstRow = page.locator('tbody tr').first();
      if (await firstRow.count() === 0) {
        test.skip();
        return;
      }
      
      // 대용량 파일 선택
      const fileInput = firstRow.locator('input[type="file"]').first();
      await fileInput.setInputFiles(largePdfPath);
      
      // 에러 메시지 확인
      const errorDialog = page.getByText('파일 크기는 10MB 이하여야 합니다.');
      await expect(errorDialog).toBeVisible({ timeout: 5000 });
      
      console.log('✅ 대용량 파일 거부 확인');
      
    } finally {
      try {
        await fs.promises.unlink(largePdfPath);
      } catch (e) {
        // 무시
      }
    }
  });
  
  test('네트워크 에러 처리', async ({ page, context }) => {
    // 관리자 로그인
    await page.goto(`${BASE_URL}/admin`);
    await page.getByLabel('비밀번호').fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: '로그인' }).click();
    await expect(page).toHaveURL(`${BASE_URL}/admin`);
    
    // Storage API 요청 차단
    await context.route('**/storage/v1/object/**', route => {
      route.abort('failed');
    });
    
    // 테스트 PDF 파일 생성
    const testPdfPath = path.join(process.cwd(), 'test-network-error.pdf');
    const pdfContent = Buffer.from('%PDF-1.4\n%%EOF');
    await fs.promises.writeFile(testPdfPath, pdfContent);
    
    try {
      await page.waitForSelector('table', { timeout: 10000 });
      
      const firstRow = page.locator('tbody tr').first();
      if (await firstRow.count() === 0) {
        test.skip();
        return;
      }
      
      // 파일 업로드 시도
      const fileInput = firstRow.locator('input[type="file"]').first();
      await fileInput.setInputFiles(testPdfPath);
      
      // 에러 메시지 확인
      const errorDialog = page.getByText(/파일 업로드.*실패/);
      await expect(errorDialog).toBeVisible({ timeout: 10000 });
      
      console.log('✅ 네트워크 에러 처리 확인');
      
    } finally {
      try {
        await fs.promises.unlink(testPdfPath);
      } catch (e) {
        // 무시
      }
    }
  });
});
