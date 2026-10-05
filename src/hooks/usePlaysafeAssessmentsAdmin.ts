"use client";

import { useCallback, useEffect, useState } from "react";
import type { AdminAssessmentRow, AssessmentSearch } from "@/lib/playsafe-workflow/adminTypes";
import { fetchAdminAssessments } from "@/lib/playsafe-workflow/client/adminApi";
import { ADMIN_ASSESSMENT_PAGE_SIZE } from "@/lib/playsafe-workflow/constants";

const message = (e: unknown) => (e instanceof Error ? e.message : "네트워크 오류가 발생했습니다.");

export function usePlaysafeAssessmentsAdmin(initialRegistrationId?: string | null) {
  const [assessments, setAssessments] = useState<AdminAssessmentRow[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearchState] = useState<AssessmentSearch>({
    field: "facility",
    keyword: "",
    registrationId: initialRegistrationId ?? undefined,
  });
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fetchAdminAssessments(search, page);
      setAssessments(result.assessments);
      setTotal(result.total);
      setError(null);
    } catch (e) {
      setError(message(e));
      setAssessments([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const setSearch = useCallback((next: AssessmentSearch) => {
    setSearchState({ ...next, keyword: next.keyword.trim() });
    setPage(1);
  }, []);

  return {
    assessments,
    total,
    page,
    pageSize: ADMIN_ASSESSMENT_PAGE_SIZE,
    setPage,
    search,
    setSearch,
    isLoading,
    error,
  };
}
