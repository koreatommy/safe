"use client";

import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { X } from "lucide-react";
import { GlowCapsuleButton } from "@/components/glass/GlowCapsuleButton";
import { getAdminApiPassword } from "@/lib/auth";
import { computeQuoteLine, computeQuoteTotals, formatKRW } from "@/lib/quote";
import type { InspectToolProductOrder } from "@/hooks/useProductOrdersAdmin";
import { postAdminQuoteEmail } from "@/hooks/useProductOrdersAdmin";

export type QuoteInlinePanelProps = {
  order: InspectToolProductOrder;
  onClose: () => void;
  onSent?: () => void;
};

function parsePositiveInt(raw: string): number | null {
  const n = Math.floor(Number(String(raw).replace(/,/g, "").trim()));
  if (!Number.isFinite(n) || n < 1) return null;
  return n;
}

export function QuoteInlinePanel({ order, onClose, onSent }: QuoteInlinePanelProps) {
  const titleId = useId();
  const [quantityStr, setQuantityStr] = useState("");
  const [unitPriceStr, setUnitPriceStr] = useState("");
  const [quoteTitle, setQuoteTitle] = useState("");
  const [itemName, setItemName] = useState("놀이시설 안전점검 도구(세트)");
  const [itemDetails, setItemDetails] = useState("");
  const [setProcessing, setSetProcessing] = useState(true);
  const [includeVat, setIncludeVat] = useState(true);

  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const [sendLoading, setSendLoading] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  useEffect(() => {
    setQuantityStr(String(order.quantity));
    setUnitPriceStr("");
    setQuoteTitle(`${order.organization} 제품 구매 견적`);
    setItemName("놀이시설 안전점검 도구(세트)");
    setItemDetails(order.request_note?.trim() || "규격: 안전기준서 준수 ±0.1mm 공차");
    setSetProcessing(true);
    setIncludeVat(true);
    setPreviewHtml(null);
    setPreviewError(null);
    setSendError(null);
  }, [order.id, order.organization, order.quantity, order.request_note]);

  const quantity = useMemo(() => parsePositiveInt(quantityStr), [quantityStr]);
  const unitPrice = useMemo(() => parsePositiveInt(unitPriceStr), [unitPriceStr]);

  const localTotals = useMemo(() => {
    if (quantity === null || unitPrice === null) return null;
    const line = computeQuoteLine(
      {
        item: itemName,
        details: itemDetails,
        quantity,
        unitPrice,
      },
      { includeVat },
    );
    return computeQuoteTotals([line]);
  }, [quantity, unitPrice, itemName, itemDetails, includeVat]);

  const runPreview = useCallback(async () => {
    const pwd = getAdminApiPassword();
    if (!pwd) {
      setPreviewError("관리자 세션이 없습니다.");
      return;
    }
    if (quantity === null || unitPrice === null) {
      setPreviewHtml(null);
      setPreviewError(null);
      return;
    }
    setPreviewLoading(true);
    setPreviewError(null);
    const res = await postAdminQuoteEmail(pwd, {
      orderId: order.id,
      quantity,
      unitPrice,
      quoteTitle: quoteTitle.trim() || undefined,
      itemName: itemName.trim() || undefined,
      itemDetails: itemDetails.trim() || undefined,
      preview: true,
      includeVat,
    });
    setPreviewLoading(false);
    if (!res.ok) {
      setPreviewHtml(null);
      setPreviewError(res.error);
      return;
    }
    setPreviewHtml(typeof res.html === "string" ? res.html : null);
  }, [order.id, quantity, unitPrice, quoteTitle, itemName, itemDetails, includeVat]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      void runPreview();
    }, 450);
    return () => window.clearTimeout(t);
  }, [runPreview]);

  const handleSend = async () => {
    if (quantity === null || unitPrice === null) return;
    const pwd = getAdminApiPassword();
    if (!pwd) {
      setSendError("관리자 세션이 없습니다.");
      return;
    }
    setSendLoading(true);
    setSendError(null);
    const res = await postAdminQuoteEmail(pwd, {
      orderId: order.id,
      quantity,
      unitPrice,
      quoteTitle: quoteTitle.trim() || undefined,
      itemName: itemName.trim() || undefined,
      itemDetails: itemDetails.trim() || undefined,
      setProcessing,
      preview: false,
      includeVat,
    });
    setSendLoading(false);
    if (!res.ok) {
      setSendError(res.error);
      return;
    }
    onSent?.();
    onClose();
  };

  return (
    <div
      className="rounded-xl border border-[#00ff88]/25 bg-[#0c1018] overflow-hidden"
      role="region"
      aria-labelledby={titleId}
    >
      <div className="flex items-start justify-between gap-3 px-3 sm:px-4 py-3 border-b border-white/10 bg-black/25">
        <div className="min-w-0">
          <h3 id={titleId} className="text-white font-medium text-sm sm:text-base">
            견적서 이메일 발송
          </h3>
          <p className="text-white/55 text-xs mt-0.5 truncate">
            {order.customer_name} · {order.email}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 shrink-0"
          aria-label="견적서 패널 닫기"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-3 sm:p-4 max-h-[min(85vh,1200px)] overflow-y-auto">
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="space-y-3 text-sm min-w-0">
            <label className="block space-y-1">
              <span className="text-white/70 text-xs">견적명</span>
              <input
                value={quoteTitle}
                onChange={(e) => setQuoteTitle(e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-white placeholder-white/35 focus:outline-none focus:border-[#00ff88]/60"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-white/70 text-xs">품목명</span>
              <input
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-white placeholder-white/35 focus:outline-none focus:border-[#00ff88]/60"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-white/70 text-xs">세부내용</span>
              <textarea
                value={itemDetails}
                onChange={(e) => setItemDetails(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-white placeholder-white/35 focus:outline-none focus:border-[#00ff88]/60 resize-y min-h-[96px]"
              />
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block space-y-1">
                <span className="text-white/70 text-xs">수량</span>
                <input
                  inputMode="numeric"
                  value={quantityStr}
                  onChange={(e) => setQuantityStr(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-white focus:outline-none focus:border-[#00ff88]/60"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-white/70 text-xs">단가 (원, VAT 제외 공급가)</span>
                <input
                  inputMode="numeric"
                  value={unitPriceStr}
                  onChange={(e) => setUnitPriceStr(e.target.value)}
                  placeholder="예: 150000"
                  className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-white placeholder-white/35 focus:outline-none focus:border-[#00ff88]/60"
                />
              </label>
            </div>

            {localTotals && (
              <div className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-xs text-white/80 space-y-1">
                <div className="flex justify-between">
                  <span>공급가 합계</span>
                  <span>{formatKRW(localTotals.supplySum)}원</span>
                </div>
                <label className="flex justify-between items-center gap-2 cursor-pointer select-none">
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={includeVat}
                      onChange={(e) => setIncludeVat(e.target.checked)}
                      className="rounded border-white/30 shrink-0"
                    />
                    <span>부가세 (10%) 적용</span>
                  </span>
                  <span className={includeVat ? "" : "text-white/45"}>{formatKRW(localTotals.vatSum)}원</span>
                </label>
                <div className="flex justify-between font-medium text-[#00ff88] pt-1 border-t border-white/10">
                  <span>{includeVat ? "견적금액 (부가세 포함)" : "견적금액 (공급가, VAT 별도)"}</span>
                  <span>{formatKRW(localTotals.grandTotal)}원</span>
                </div>
              </div>
            )}

            <label className="flex items-center gap-2 text-white/75 text-xs cursor-pointer select-none">
              <input
                type="checkbox"
                checked={setProcessing}
                onChange={(e) => setSetProcessing(e.target.checked)}
                className="rounded border-white/30"
              />
              발송 후 주문 상태를 &quot;처리중&quot;으로 변경
            </label>

            {sendError && (
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-red-200 text-xs">
                {sendError}
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-1">
              <GlowCapsuleButton
                type="button"
                onClick={() => void runPreview()}
                variant="secondary"
                className="!px-4 !py-2 text-sm"
                disabled={previewLoading || quantity === null || unitPrice === null}
              >
                {previewLoading ? "미리보기 갱신 중…" : "미리보기 새로고침"}
              </GlowCapsuleButton>
              <GlowCapsuleButton
                type="button"
                onClick={() => void handleSend()}
                className="!px-4 !py-2 text-sm"
                disabled={sendLoading || quantity === null || unitPrice === null || !previewHtml}
              >
                {sendLoading ? "발송 중…" : "고객 이메일로 발송"}
              </GlowCapsuleButton>
            </div>
          </div>

          <div className="flex flex-col min-h-[240px] lg:min-h-[380px] rounded-xl border border-white/10 bg-white overflow-hidden">
            <div className="px-3 py-2 border-b border-black/10 shrink-0 space-y-1">
              <div className="text-xs font-medium text-black/70">미리보기 (서버 생성 HTML)</div>
              <p className="text-[10px] leading-snug text-black/45">
                회사 정보가 없으면 상호·주소 등이 &quot;— 미설정 —&quot;으로 보입니다. 실제 발송은 .env의 COMPANY_* 전부가 필요합니다.
              </p>
            </div>
            {previewError && (
              <div className="p-3 text-amber-800 text-xs bg-amber-50 border-b border-amber-100">{previewError}</div>
            )}
            <div className="flex-1 min-h-[220px] lg:min-h-[320px] overflow-auto bg-neutral-100">
              {previewHtml ? (
                <iframe
                  title="견적서 미리보기"
                  srcDoc={previewHtml}
                  className="w-full min-h-[280px] lg:min-h-[360px] h-full border-0 bg-white"
                  sandbox="allow-same-origin"
                />
              ) : (
                <div className="p-6 text-center text-black/45 text-sm">
                  {quantity === null || unitPrice === null
                    ? "수량과 단가를 입력하면 미리보기가 표시됩니다."
                    : previewLoading
                      ? "불러오는 중…"
                      : "미리보기를 준비 중입니다."}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
