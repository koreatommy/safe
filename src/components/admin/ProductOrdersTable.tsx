"use client";

import { Fragment, useEffect, useState } from "react";
import { useProductOrdersAdmin, type InspectToolProductOrder, type ProductOrderStatus } from "@/hooks/useProductOrdersAdmin";
import { QuoteInlinePanel } from "@/components/admin/QuoteInlinePanel";

function statusLabel(s: ProductOrderStatus) {
  switch (s) {
    case "completed":
      return "완료";
    case "processing":
      return "처리중";
    default:
      return "대기";
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const TABLE_COL_COUNT = 11;

export function ProductOrdersTable() {
  const { orders, filter, setFilter, isLoading, error, updatingId, deletingId, updateStatus, deleteOrder, refetch } =
    useProductOrdersAdmin();
  const [quoteOrder, setQuoteOrder] = useState<InspectToolProductOrder | null>(null);

  useEffect(() => {
    if (quoteOrder && !orders.some((o) => o.id === quoteOrder.id)) {
      setQuoteOrder(null);
    }
  }, [orders, quoteOrder]);

  const rowBusy = (id: string) => updatingId === id || deletingId === id;

  const toggleQuote = (o: InspectToolProductOrder) => {
    setQuoteOrder((prev) => (prev?.id === o.id ? null : o));
  };

  const quoteSent = () => {
    void refetch({ quiet: true });
    setQuoteOrder(null);
  };

  return (
    <div className="space-y-6 min-w-0">
      <div className="flex flex-wrap gap-2">
        {(["all", "pending", "processing", "completed"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border transition-all text-sm ${
              filter === s
                ? "bg-[#00ff88]/20 border-[#00ff88] text-white"
                : "bg-white/5 border-white/10 text-white/70 hover:border-white/20"
            }`}
          >
            {s === "all" ? "전체" : statusLabel(s)}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-amber-100/90 text-sm">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-white/70 text-sm">로딩 중...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 text-white/70 text-sm">접수 내역이 없습니다.</div>
      ) : (
        <>
          <div className="md:hidden space-y-3">
            {orders.map((o) => (
              <div
                key={o.id}
                className={`rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-2 text-sm text-white/90 ${
                  quoteOrder?.id === o.id ? "ring-1 ring-[#00ff88]/45" : ""
                }`}
              >
                <div className="flex justify-between gap-2 items-start">
                  <span className="font-medium text-white">{o.customer_name}</span>
                  <select
                    value={o.status}
                    disabled={rowBusy(o.id)}
                    onChange={(e) => updateStatus(o.id, e.target.value as ProductOrderStatus)}
                    className="rounded-lg border border-white/20 bg-black/40 text-white text-xs px-2 py-1 max-w-[8rem]"
                  >
                    <option value="pending">대기</option>
                    <option value="processing">처리중</option>
                    <option value="completed">완료</option>
                  </select>
                </div>
                <div className="text-white/60 text-xs space-y-1">
                  <div>소속: {o.organization}</div>
                  <div>연락처: {o.phone}</div>
                  <div>이메일: {o.email}</div>
                  <div>
                    수량: {o.quantity}
                    {o.discount_eligible ? " · 10개+ 할인 안내 대상" : ""}
                  </div>
                  <div>접수: {formatDate(o.created_at)}</div>
                  {o.request_note ? <div className="text-white/80 pt-1">요청: {o.request_note}</div> : null}
                </div>
                <div className="mt-2 flex flex-col gap-2">
                  <button
                    type="button"
                    disabled={rowBusy(o.id)}
                    onClick={() => toggleQuote(o)}
                    className="w-full rounded-lg border border-[#00ff88]/40 bg-[#00ff88]/10 px-3 py-2 text-xs text-[#00ff88] hover:bg-[#00ff88]/20 disabled:opacity-40 disabled:pointer-events-none"
                  >
                    {quoteOrder?.id === o.id ? "견적서 접기" : "견적서"}
                  </button>
                  <button
                    type="button"
                    disabled={rowBusy(o.id)}
                    onClick={() => {
                      if (!window.confirm("이 구매 신청을 삭제할까요? 되돌릴 수 없습니다.")) return;
                      void deleteOrder(o.id);
                    }}
                    className="w-full rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200 hover:bg-red-500/20 disabled:opacity-40 disabled:pointer-events-none"
                  >
                    {deletingId === o.id ? "삭제 중…" : "주문 삭제"}
                  </button>
                </div>
                {quoteOrder?.id === o.id && (
                  <div className="pt-3 mt-1 border-t border-white/10">
                    <QuoteInlinePanel order={o} onClose={() => setQuoteOrder(null)} onSent={quoteSent} />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm text-white/90 border-collapse min-w-[820px]">
              <thead>
                <tr className="border-b border-white/10 text-white/50">
                  <th className="py-2 pr-3 font-medium">접수일</th>
                  <th className="py-2 pr-3 font-medium">이름</th>
                  <th className="py-2 pr-3 font-medium">소속</th>
                  <th className="py-2 pr-3 font-medium">연락처</th>
                  <th className="py-2 pr-3 font-medium">이메일</th>
                  <th className="py-2 pr-3 font-medium w-16">수량</th>
                  <th className="py-2 pr-3 font-medium">할인</th>
                  <th className="py-2 pr-3 font-medium min-w-[140px]">요청</th>
                  <th className="py-2 pr-3 font-medium w-28">상태</th>
                  <th className="py-2 pr-2 font-medium w-28 text-center">견적서</th>
                  <th className="py-2 pr-0 font-medium w-24 text-center">삭제</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <Fragment key={o.id}>
                    <tr className={`border-b border-white/5 align-top ${quoteOrder?.id === o.id ? "bg-[#00ff88]/[0.06]" : ""}`}>
                      <td className="py-2.5 pr-3 text-white/70 whitespace-nowrap">{formatDate(o.created_at)}</td>
                      <td className="py-2.5 pr-3">{o.customer_name}</td>
                      <td className="py-2.5 pr-3 max-w-[200px] break-words">{o.organization}</td>
                      <td className="py-2.5 pr-3 whitespace-nowrap">{o.phone}</td>
                      <td className="py-2.5 pr-3 break-all max-w-[200px]">{o.email}</td>
                      <td className="py-2.5 pr-3">{o.quantity}</td>
                      <td className="py-2.5 pr-3 text-white/70">{o.discount_eligible ? "해당" : "-"}</td>
                      <td className="py-2.5 pr-3 text-white/70 max-w-[220px] break-words">
                        {o.request_note ?? "—"}
                      </td>
                      <td className="py-2.5 pr-3">
                        <select
                          value={o.status}
                          disabled={rowBusy(o.id)}
                          onChange={(e) => updateStatus(o.id, e.target.value as ProductOrderStatus)}
                          className="w-full max-w-[7rem] rounded-lg border border-white/20 bg-black/40 text-white text-xs px-2 py-1.5"
                        >
                          <option value="pending">대기</option>
                          <option value="processing">처리중</option>
                          <option value="completed">완료</option>
                        </select>
                      </td>
                      <td className="py-2.5 pr-2 text-center align-middle">
                        <button
                          type="button"
                          disabled={rowBusy(o.id)}
                          onClick={() => toggleQuote(o)}
                          className="rounded-lg border border-[#00ff88]/40 bg-[#00ff88]/10 px-2 py-1.5 text-xs text-[#00ff88] hover:bg-[#00ff88]/20 whitespace-nowrap disabled:opacity-40 disabled:pointer-events-none"
                        >
                          {quoteOrder?.id === o.id ? "접기" : "견적서"}
                        </button>
                      </td>
                      <td className="py-2.5 pr-0 text-center align-middle">
                        <button
                          type="button"
                          disabled={rowBusy(o.id)}
                          onClick={() => {
                            if (!window.confirm("이 구매 신청을 삭제할까요? 되돌릴 수 없습니다.")) return;
                            void deleteOrder(o.id);
                          }}
                          className="rounded-lg border border-red-500/40 bg-red-500/10 px-2 py-1.5 text-xs text-red-200 hover:bg-red-500/20 whitespace-nowrap disabled:opacity-40 disabled:pointer-events-none"
                        >
                          {deletingId === o.id ? "삭제 중" : "삭제"}
                        </button>
                      </td>
                    </tr>
                    {quoteOrder?.id === o.id && (
                      <tr className="border-b border-white/10 align-top">
                        <td colSpan={TABLE_COL_COUNT} className="p-3 sm:p-4 bg-black/30">
                          <QuoteInlinePanel order={o} onClose={() => setQuoteOrder(null)} onSent={quoteSent} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <div className="text-white/50 text-xs sm:text-sm">총 {orders.length}건의 구매 신청이 있습니다.</div>
    </div>
  );
}
