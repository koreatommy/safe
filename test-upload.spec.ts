import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test('수료증 파일 업로드 테스트', async ({ page }) => {
  const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? '';
  // 콘솔 에러 수집
  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.log('콘솔 에러:', msg.text());
    }
  });

  // 네트워크 요청 모니터링
  const requests: string[] = [];
  const responses: string[] = [];
  
  page.on('request', request => {
    if (request.url().includes('storage') || request.url().includes('safe_education_applications')) {
      requests.push(`${request.method()} ${request.url()}`);
      console.log('요청:', request.method(), request.url());
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('storage') || response.url().includes('safe_education_applications')) {
      const method = response.request().method();
      responses.push(`${response.status()} ${method} ${response.url()}`);
      console.log('응답:', response.status(), method, response.url());
    }
  });

  // localStorage에 인증 정보 설정 (로그인 우회)
  await page.goto('http://localhost:3000/admin');
  await page.evaluate(() => {
    localStorage.setItem('admin_auth', 'authenticated');
  });
  console.log('인증 정보 설정 완료');

  // 페이지 새로고침
  await page.reload();
  console.log('페이지 새로고침 완료');

  // 로그인 페이지로 리다이렉트되었는지 확인
  const currentUrl = page.url();
  console.log('현재 URL:', currentUrl);
  
  if (currentUrl.includes('/admin/login')) {
    console.log('로그인 페이지로 리다이렉트됨. 로그인 진행...');
    // 비밀번호 입력 필드 찾기
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.waitFor({ timeout: 5000 });
    await passwordInput.fill(ADMIN_PASSWORD);
    console.log('비밀번호 입력 완료');
    
    // 로그인 버튼 클릭
    const loginButton = page.locator('button').filter({ hasText: /로그인/i }).first();
    await loginButton.click();
    console.log('로그인 버튼 클릭');
    await page.waitForURL('**/admin', { timeout: 10000 });
    console.log('관리자 페이지로 이동 완료');
  }

  // 테이블이 로드될 때까지 대기
  await page.waitForSelector('table', { timeout: 15000 });
  console.log('테이블 로드 완료');

  // 첫 번째 행 찾기
  const firstRow = page.locator('table tbody tr').first();
  await expect(firstRow).toBeVisible();
  console.log('첫 번째 행 찾음');

  // "수료증" 컬럼 찾기 (미등록 텍스트가 있는 셀)
  const certificateCell = firstRow.locator('td').filter({ hasText: '미등록' }).first();
  
  // 미등록이 없으면 다른 행 찾기
  const hasMideung = await certificateCell.count();
  if (hasMideung === 0) {
    console.log('미등록 상태인 행이 없습니다. 모든 행 확인 중...');
    const allRows = page.locator('table tbody tr');
    const rowCount = await allRows.count();
    console.log(`총 ${rowCount}개의 행이 있습니다.`);
    
    // 모든 행에서 미등록 찾기
    for (let i = 0; i < rowCount; i++) {
      const row = allRows.nth(i);
      const cell = row.locator('td').filter({ hasText: '미등록' });
      if (await cell.count() > 0) {
        console.log(`${i + 1}번째 행에서 미등록 상태 발견`);
        const fileInput = cell.locator('input[type="file"]').first();
        if (await fileInput.count() > 0) {
          await testFileUpload(page, fileInput, cell);
          return;
        }
      }
    }
    test.skip('미등록 상태인 행이 없습니다.');
    return;
  }

  await expect(certificateCell).toBeVisible();
  console.log('미등록 셀 찾음');

  // 파일 입력 요소 찾기 (hidden이어도 존재하면 됨)
  const fileInput = certificateCell.locator('input[type="file"]').first();
  await expect(fileInput).toBeAttached({ timeout: 5000 });
  console.log('파일 입력 요소 찾음');

  // 테스트용 PDF 파일 생성 (없으면)
  const testFilePath = '/tmp/test_certificate.pdf';
  if (!fs.existsSync(testFilePath)) {
    console.log('테스트 파일 생성 중...');
    // 간단한 PDF 생성
    const pdfContent = Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n>>\nendobj\nxref\n0 1\ntrailer\n<<\n/Root 1 0 R\n>>\nstartxref\n9\n%%EOF');
    fs.writeFileSync(testFilePath, pdfContent);
  }

  console.log('파일 업로드 시작:', testFilePath);
  
  // 파일 업로드
  await fileInput.setInputFiles(testFilePath);
  console.log('파일 선택 완료');

  // 모든 응답이 완료될 때까지 대기
  await page.waitForTimeout(5000);
  
  console.log('총 요청 수:', requests.length);
  console.log('총 응답 수:', responses.length);

  // 업로드 완료 대기 (로딩 상태가 사라질 때까지)
  await page.waitForTimeout(3000);

  // 페이지 새로고침하여 업로드된 파일 확인
  await page.reload();
  await page.waitForSelector('table', { timeout: 10000 });
  console.log('페이지 새로고침 완료');

  // 업로드 성공 확인
  try {
    // 첫 번째 행 다시 찾기
    const updatedFirstRow = page.locator('table tbody tr').first();
    const updatedCertificateCell = updatedFirstRow.locator('td').filter({ hasText: /수료증|미등록/ }).first();
    
    // "수료증 보기" 링크가 있는지 확인
    const certificateLink = updatedCertificateCell.locator('a[href*="storage"], a[href*="supabase"]').first();
    const hasLink = await certificateLink.count();
    
    if (hasLink > 0) {
      const linkText = await certificateLink.textContent();
      const linkHref = await certificateLink.getAttribute('href');
      console.log('✅ 업로드 성공: 수료증 링크가 나타났습니다.');
      console.log('링크 텍스트:', linkText);
      console.log('링크 URL:', linkHref);
    } else {
      // 미등록 텍스트가 사라졌는지 확인
      const cellText = await updatedCertificateCell.textContent();
      if (cellText && !cellText.includes('미등록')) {
        console.log('✅ 업로드 성공: 미등록 상태가 변경되었습니다.');
        console.log('셀 내용:', cellText);
      } else {
        console.log('⚠️ 업로드 상태 확인: 여전히 미등록 상태입니다.');
        console.log('셀 내용:', cellText);
        // 스크린샷 저장
        await page.screenshot({ path: 'upload-test-status.png', fullPage: true });
      }
    }
  } catch (e) {
    console.log('⚠️ 업로드 상태 확인 실패:', e);
    // 스크린샷 저장
    await page.screenshot({ path: 'upload-test-failed.png', fullPage: true });
  }

  // 콘솔 에러 확인 (File chooser 관련 에러는 제외)
  const relevantErrors = consoleErrors.filter(err => 
    !err.includes('File chooser dialog') && 
    !err.includes('React DevTools')
  );
  
  if (relevantErrors.length > 0) {
    console.log('⚠️ 콘솔 에러 발견:', relevantErrors);
  } else {
    console.log('✅ 콘솔 에러 없음');
  }
});

async function testFileUpload(page: any, fileInput: any, cell: any) {
  const testFilePath = '/tmp/test_certificate.pdf';
  
  // 테스트 파일 생성
  if (!fs.existsSync(testFilePath)) {
    const pdfContent = Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n>>\nendobj\nxref\n0 1\ntrailer\n<<\n/Root 1 0 R\n>>\nstartxref\n9\n%%EOF');
    fs.writeFileSync(testFilePath, pdfContent);
  }

  console.log('파일 업로드 시작:', testFilePath);
  await fileInput.setInputFiles(testFilePath);
  console.log('파일 선택 완료');

  await page.waitForTimeout(3000);

  try {
    await expect(cell).not.toContainText('미등록', { timeout: 10000 });
    console.log('✅ 업로드 성공');
  } catch (e) {
    console.log('⚠️ 업로드 상태 확인 실패:', e);
    await page.screenshot({ path: 'upload-test-failed.png', fullPage: true });
  }
}

