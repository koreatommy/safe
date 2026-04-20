"use client";

import { useCallback, useEffect, useState } from "react";
import { getAdminApiPassword } from "@/lib/auth";

export type ProductOrderStatus = "pending" | "processing" | "completed";

export type ProductOrderFilter = "all" | ProductOrderStatus;

export interface InspectToolProductOrder {
  id: string;
  customer_name: string;
  organization: string;
  phone: string;
  email: string;
  quantity: number;
  discount_eligible: boolean;
  request_note: string | null;
  privacy_agreed: boolean;
  status: ProductOrderStatus;
  created_at: string;
}

export function useProductOrdersAdmin() {
  const [orders, setOrders] = useState<InspectToolProductOrder[]>([]);
  const [filter, setFilter] = useState<ProductOrderFilter>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async (opts?: { quiet?: boolean }) => {
    const pwd = getAdminApiPassword();
    if (!pwd) {
      setError("관리자 세션이 없습니다. 로그아웃 후 다시 로그인해 주세요.");
      setOrders([]);
      setIsLoading(false);
      return;
    }
    if (!opts?.quiet) setIsLoading(true);
    setError(null);
    try {
      const q = filter === "all" ? "all" : filter;
      const res = await fetch(`/api/admin/inspect-tool-product-orders?status=${encodeURIComponent(q)}`, {
        headers: { "x-admin-password": pwd },
      });
      const data = (await res.json().catch(() => ({}))) as { orders?: InspectToolProductOrder[]; error?: string };
      if (!res.ok) {
        setError(data.error ?? "목록을 불러오지 못했습니다.");
        setOrders([]);
        return;
      }
      setOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch {
      setError("네트워크 오류가 발생했습니다.");
      setOrders([]);
    } finally {
      if (!opts?.quiet) setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateStatus = useCallback(
    async (id: string, status: ProductOrderStatus) => {
      const pwd = getAdminApiPassword();
      if (!pwd) {
        setError("관리자 세션이 없습니다. 다시 로그인해 주세요.");
        return false;
      }
      setUpdatingId(id);
      setError(null);
      try {
        const res = await fetch("/api/admin/inspect-tool-product-orders", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-admin-password": pwd,
          },
          body: JSON.stringify({ id, status }),
        });
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        if (!res.ok) {
          setError(data.error ?? "상태 변경에 실패했습니다.");
          return false;
        }
        await fetchOrders({ quiet: true });
        return true;
      } catch {
        setError("네트워크 오류가 발생했습니다.");
        return false;
      } finally {
        setUpdatingId(null);
      }
    },
    [fetchOrders]
  );

  const deleteOrder = useCallback(
    async (id: string) => {
      const pwd = getAdminApiPassword();
      if (!pwd) {
        setError("관리자 세션이 없습니다. 다시 로그인해 주세요.");
        return false;
      }
      setDeletingId(id);
      setError(null);
      try {
        const res = await fetch("/api/admin/inspect-tool-product-orders", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "x-admin-password": pwd,
          },
          body: JSON.stringify({ id }),
        });
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        if (!res.ok) {
          setError(data.error ?? "삭제에 실패했습니다.");
          return false;
        }
        await fetchOrders({ quiet: true });
        return true;
      } catch {
        setError("네트워크 오류가 발생했습니다.");
        return false;
      } finally {
        setDeletingId(null);
      }
    },
    [fetchOrders]
  );

  return {
    orders,
    filter,
    setFilter,
    isLoading,
    error,
    updatingId,
    deletingId,
    refetch: fetchOrders,
    updateStatus,
    deleteOrder,
  };
}

/** 견적서 미리보기·발송 — `/api/admin/send-quote` */
export type AdminSendQuoteBody = {
  orderId: string;
  quantity: number;
  unitPrice: number;
  quoteTitle?: string;
  itemName?: string;
  itemDetails?: string;
  setProcessing?: boolean;
  preview?: boolean;
  /** false면 부가세 0원·합계는 공급가만 */
  includeVat?: boolean;
};

export type AdminSendQuoteResult =
  | {
      ok: true;
      html?: string;
      grandTotal?: number;
      supplySum?: number;
      vatSum?: number;
      sentTo?: string;
    }
  | { ok: false; error: string };

export async function postAdminQuoteEmail(
  password: string,
  body: AdminSendQuoteBody,
): Promise<AdminSendQuoteResult> {
  try {
    const res = await fetch("/api/admin/send-quote", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": password,
      },
      body: JSON.stringify(body),
    });
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      html?: string;
      grandTotal?: number;
      supplySum?: number;
      vatSum?: number;
      sentTo?: string;
    };
    if (!res.ok) {
      return { ok: false, error: typeof data.error === "string" ? data.error : "요청에 실패했습니다." };
    }
    return {
      ok: true,
      html: data.html,
      grandTotal: data.grandTotal,
      supplySum: data.supplySum,
      vatSum: data.vatSum,
      sentTo: data.sentTo,
    };
  } catch {
    return { ok: false, error: "네트워크 오류가 발생했습니다." };
  }
}
