"use client";

import { useCallback, useEffect, useState } from "react";
import type { AdminRegistrationRow, RegistrationSearch } from "@/lib/playsafe-workflow/adminTypes";
import { fetchAdminRegistrations } from "@/lib/playsafe-workflow/client/adminApi";
import { ADMIN_REGISTRATION_PAGE_SIZE } from "@/lib/playsafe-workflow/constants";

const message = (e: unknown) => (e instanceof Error ? e.message : "네트워크 오류가 발생했습니다.");

const INITIAL_SEARCH: RegistrationSearch = { keyword: "", target: "all" };

export function usePlaysafeRegistrationsAdmin() {
  const [registrations, setRegistrations] = useState<AdminRegistrationRow[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearchState] = useState<RegistrationSearch>(INITIAL_SEARCH);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fetchAdminRegistrations(search, page);
      setRegistrations(result.registrations);
      setTotal(result.total);
      setError(null);
    } catch (e) {
      setError(message(e));
      setRegistrations([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const setSearch = useCallback((next: RegistrationSearch) => {
    setSearchState({ keyword: next.keyword.trim(), target: next.target });
    setPage(1);
  }, []);

  return {
    registrations,
    total,
    page,
    pageSize: ADMIN_REGISTRATION_PAGE_SIZE,
    setPage,
    search,
    setSearch,
    isLoading,
    error,
  };
}
