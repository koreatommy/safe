"use client";

import { useCallback, useEffect, useState } from "react";
import type { EligibilityInquiry, InquiryStatus, InquiryStatusFilter } from "@/lib/eligibility-inquiry/types";

const ENDPOINT = "/api/admin/eligibility-inquiries";

async function adminFetch<T>(init: RequestInit & { query?: string } = {}): Promise<T> {
  const { query = "", ...rest } = init;
  const res = await fetch(`${ENDPOINT}${query}`, {
    ...rest,
    headers: { "Content-Type": "application/json" },
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(data.error ?? "요청에 실패했습니다.");
  return data;
}

const message = (e: unknown) => (e instanceof Error ? e.message : "네트워크 오류가 발생했습니다.");

export function useEligibilityInquiriesAdmin() {
  const [inquiries, setInquiries] = useState<EligibilityInquiry[]>([]);
  const [filter, setFilter] = useState<InquiryStatusFilter>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const refetch = useCallback(async (quiet = false) => {
    if (!quiet) setIsLoading(true);
    try {
      const data = await adminFetch<{ inquiries: EligibilityInquiry[] }>({ query: `?status=${filter}` });
      setInquiries(data.inquiries ?? []);
      setError(null);
    } catch (e) {
      setError(message(e));
      setInquiries([]);
    } finally {
      if (!quiet) setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const mutate = useCallback(
    async (id: string, method: "PATCH" | "DELETE", body: Record<string, unknown>) => {
      setBusyId(id);
      try {
        await adminFetch({ method, body: JSON.stringify({ id, ...body }) });
        await refetch(true);
        return true;
      } catch (e) {
        setError(message(e));
        return false;
      } finally {
        setBusyId(null);
      }
    },
    [refetch],
  );

  const updateStatus = (id: string, status: InquiryStatus) => mutate(id, "PATCH", { status });
  const saveNote = (id: string, adminNote: string) => mutate(id, "PATCH", { adminNote });
  const remove = (id: string) => mutate(id, "DELETE", {});

  return { inquiries, filter, setFilter, isLoading, error, busyId, refetch, updateStatus, saveNote, remove };
}
