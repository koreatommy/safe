import { getIconSvg } from "./icons";
import { getPublicUrl } from "./registry";
import type { DigitalCardDefinition, DigitalCardTheme } from "./types";

const DEFAULT_THEME: DigitalCardTheme = {
  accent: "#FF6B00",
  accentHover: "#FF8529",
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeJsString(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/\r/g, "\\r")
    .replace(/\n/g, "\\n");
}

function buildVcardLines(card: DigitalCardDefinition): string[] {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${card.familyName};${card.givenName};;;`,
    `FN:${card.name}`,
    `ORG:${card.org}`,
    `TITLE:${card.title}`,
    `TEL;TYPE=CELL:${card.phone}`,
    `EMAIL;TYPE=INTERNET:${card.email}`,
    ...card.links.map((link) => `URL:${link.href}`),
  ];

  if (card.vcardNote) {
    lines.push(`NOTE:${card.vcardNote}`);
  }

  lines.push("END:VCARD");
  return lines;
}

function renderLinkItems(card: DigitalCardDefinition): string {
  const phoneItem = `
    <a href="tel:${escapeHtml(card.phone)}" class="info-item">
      <div class="info-icon">${getIconSvg("phone")}</div>
      <div>
        <div class="info-label">Phone</div>
        <div class="info-value">${escapeHtml(card.phone)}</div>
      </div>
    </a>`;

  const emailItem = `
    <a href="mailto:${escapeHtml(card.email)}" class="info-item">
      <div class="info-icon">${getIconSvg("email")}</div>
      <div>
        <div class="info-label">Email</div>
        <div class="info-value">${escapeHtml(card.email)}</div>
      </div>
    </a>`;

  const linkItems = card.links
    .map(
      (link) => `
    <a href="${escapeHtml(link.href)}" target="_blank" rel="noopener" class="info-item">
      <div class="info-icon">${getIconSvg(link.icon)}</div>
      <div>
        <div class="info-label">${escapeHtml(link.label)}</div>
        <div class="info-value">${escapeHtml(link.display)}</div>
      </div>
    </a>`,
    )
    .join("");

  return phoneItem + emailItem + linkItems;
}

export function renderDigitalCardHtml(card: DigitalCardDefinition): string {
  const theme = card.theme ?? DEFAULT_THEME;
  const publicUrl = getPublicUrl(card.slug);
  const qrSrc = `/card/${card.slug}/qr-code-dark.png?v=safeplay`;
  const subtitleLines = card.subtitles?.length
    ? card.subtitles
    : card.subtitle
      ? [card.subtitle]
      : [];
  const subtitles = subtitleLines
    .map((line) => `<div class="subtitle-line">${escapeHtml(line)}</div>`)
    .join("");
  const vcardJs = escapeJsString(buildVcardLines(card).join("\r\n"));
  const downloadName = escapeJsString(card.vcardDownloadName);

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="theme-color" content="#090909">
<title>${escapeHtml(card.name)} — ${escapeHtml(card.org)} ${escapeHtml(card.title)}</title>
<meta name="description" content="${escapeHtml(card.metaDescription)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root {
    --accent: ${theme.accent};
    --accent-hover: ${theme.accentHover};
    --black: #090909;
    --dark: #141414;
    --dark-card: #1C1C1C;
    --gray-600: #666;
    --gray-400: #999;
    --gray-200: #DDD;
    --white: #FFFFFF;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html { -webkit-text-size-adjust: 100%; text-size-adjust: 100%; }
  body {
    font-family: 'Noto Sans KR', -apple-system, sans-serif;
    background: var(--black);
    min-height: 100dvh;
    min-height: 100svh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: max(16px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right)) max(16px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left));
    -webkit-font-smoothing: antialiased;
    -webkit-tap-highlight-color: transparent;
  }
  .card {
    width: 100%;
    max-width: 400px;
    background: var(--dark);
    border-radius: 28px;
    overflow: hidden;
    box-shadow: 0 50px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04);
    animation: rise 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
  }
  @keyframes rise {
    from { opacity: 0; transform: translateY(24px) scale(0.97); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  .top-bar { height: 4px; background: var(--accent); }
  .header { padding: 36px 28px 28px; text-align: center; }
  .avatar {
    width: 124px; height: 124px; border-radius: 20px; background: #fff;
    border: 1px solid rgba(255,255,255,0.12); padding: 6px;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 20px; overflow: hidden;
  }
  .avatar img { width: 100%; height: 100%; object-fit: contain; display: block; }
  .name { font-size: 26px; font-weight: 700; color: var(--white); letter-spacing: -0.5px; margin-bottom: 6px; }
  .title-line { font-size: 14px; font-weight: 400; color: var(--gray-400); letter-spacing: 0.5px; }
  .title-line .role { color: var(--accent); font-weight: 500; }
  .subtitle-line { font-size: 12px; font-weight: 400; color: var(--gray-600); letter-spacing: 0.3px; margin-top: 6px; line-height: 1.5; }
  .divider { width: 40px; height: 2px; background: rgba(255,255,255,0.08); margin: 24px auto 0; }
  .info-section { padding: 4px 28px 24px; }
  .info-item {
    display: flex; align-items: center; gap: 14px; min-height: 52px; padding: 12px 0;
    border-bottom: 1px solid rgba(255,255,255,0.04); text-decoration: none; color: var(--gray-200);
    transition: color 0.2s; cursor: pointer; touch-action: manipulation;
  }
  .info-item:last-child { border-bottom: none; }
  .info-item:hover { color: var(--white); }
  .info-item:hover .info-icon { color: var(--accent); background: color-mix(in srgb, var(--accent) 8%, transparent); }
  .info-icon {
    width: 36px; height: 36px; border-radius: 10px; background: rgba(255,255,255,0.04);
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    transition: color 0.2s, background 0.2s; color: var(--gray-400);
  }
  .info-icon svg { width: 18px; height: 18px; }
  .info-label { font-size: 11px; color: var(--gray-600); text-transform: uppercase; letter-spacing: 1px; font-weight: 500; margin-bottom: 2px; font-family: 'Outfit', sans-serif; }
  .info-value { font-size: 14px; font-weight: 400; color: inherit; word-break: break-all; }
  .cta-section { padding: 0 28px 28px; }
  .save-btn {
    width: 100%; min-height: 52px; padding: 16px; border: none; border-radius: 14px;
    background: var(--accent); color: var(--white); font-size: 15px; font-weight: 600;
    font-family: 'Noto Sans KR', sans-serif; cursor: pointer; display: flex; align-items: center;
    justify-content: center; gap: 8px; transition: background 0.2s, transform 0.1s; letter-spacing: -0.3px;
    touch-action: manipulation;
  }
  .save-btn:hover { background: var(--accent-hover); }
  .save-btn:active { transform: scale(0.98); }
  .save-btn svg { width: 18px; height: 18px; }
  .footer { padding: 16px 28px 20px; text-align: center; border-top: 1px solid rgba(255,255,255,0.04); }
  .footer-logo { font-family: 'Outfit', sans-serif; font-size: 11px; font-weight: 600; color: var(--gray-600); letter-spacing: 3px; text-transform: uppercase; }
  .toast {
    position: fixed; bottom: max(40px, calc(env(safe-area-inset-bottom) + 24px)); left: 50%;
    transform: translateX(-50%) translateY(20px); background: var(--dark-card); color: var(--white);
    padding: 12px 24px; border-radius: 12px; font-size: 13px; font-weight: 500;
    border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 10px 40px rgba(0,0,0,0.4);
    opacity: 0; pointer-events: none; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); z-index: 100;
  }
  .toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
  @media (max-width: 480px) {
    body { align-items: flex-start; overflow-y: auto; -webkit-overflow-scrolling: touch; }
    .card { margin: auto; max-width: min(400px, 100%); border-radius: 24px; }
    .header { padding: 28px 20px 24px; }
    .avatar { width: 140px; height: 140px; padding: 7px; border-radius: 22px; margin-bottom: 18px; }
    .name { font-size: clamp(22px, 6.5vw, 26px); }
    .title-line { font-size: clamp(13px, 3.8vw, 14px); line-height: 1.5; padding: 0 4px; }
    .info-section { padding: 4px 20px 20px; }
    .cta-section { padding: 0 20px 24px; }
    .footer { padding: 14px 20px max(18px, env(safe-area-inset-bottom)); }
    .info-value { font-size: clamp(13px, 3.6vw, 14px); }
  }
</style>
</head>
<body>
<div class="card">
  <div class="top-bar"></div>
  <div class="header">
    <div class="avatar">
      <img src="${qrSrc}" alt="QR 코드 — ${escapeHtml(publicUrl)}" width="512" height="512" />
    </div>
    <div class="name">${escapeHtml(card.name)}</div>
    <div class="title-line">${escapeHtml(card.org)} <span class="role">${escapeHtml(card.title)}</span></div>
    ${subtitles}
    <div class="divider"></div>
  </div>
  <div class="info-section">${renderLinkItems(card)}</div>
  <div class="cta-section">
    <button class="save-btn" onclick="saveContact()">
      <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline stroke-linecap="round" stroke-linejoin="round" points="17 21 17 13 7 13 7 21"/><polyline stroke-linecap="round" stroke-linejoin="round" points="7 3 7 8 15 8"/></svg>
      연락처 저장하기
    </button>
  </div>
  <div class="footer">
    <div class="footer-logo">${escapeHtml(card.footerLogo)}</div>
  </div>
</div>
<div class="toast" id="toast">연락처가 다운로드되었습니다</div>
<script>
function saveContact() {
  const vcard = '${vcardJs}';
  const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = '${downloadName}';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  const toast = document.getElementById('toast');
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}
</script>
</body>
</html>`;
}

export function renderDigitalCardIndexHtml(
  cards: DigitalCardDefinition[],
): string {
  const items = cards
    .map(
      (card) =>
        `<li><a href="/card/${escapeHtml(card.slug)}">${escapeHtml(card.name)}</a><span>${escapeHtml(card.org)} ${escapeHtml(card.title)}</span></li>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>디지털 명함</title>
<style>
  body { font-family: 'Noto Sans KR', sans-serif; background: #090909; color: #fff; padding: 32px 20px; }
  h1 { font-size: 20px; margin-bottom: 20px; font-weight: 600; }
  ul { list-style: none; padding: 0; margin: 0; display: grid; gap: 12px; max-width: 420px; }
  li { background: #141414; border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; padding: 16px; }
  a { color: #FF6B00; text-decoration: none; font-weight: 600; font-size: 16px; display: block; margin-bottom: 4px; }
  span { color: #999; font-size: 13px; }
</style>
</head>
<body>
  <h1>디지털 명함</h1>
  <ul>${items}</ul>
</body>
</html>`;
}
