const ASSET_ROOT = "/playsafe";

export const GUIDE_PAGE_COUNT = 38;
export const GUIDE_PAGE_SIZE = { width: 952, height: 1348 } as const;

export const guidePdf = {
  href: `${ASSET_ROOT}/playsafety-guideline.pdf`,
  fileName: "신종유사-어린이놀이시설-안전관리-가이드라인.pdf",
} as const;

export function imagePath(name: string): string {
  return `${ASSET_ROOT}/images/${name}.jpg`;
}

export function guidePagePath(page: number): string {
  return `${ASSET_ROOT}/pages/page-${String(page).padStart(2, "0")}.jpg`;
}

export function clampGuidePage(page: number): number {
  return Math.min(GUIDE_PAGE_COUNT, Math.max(1, page));
}
