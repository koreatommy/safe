"use client";

import { useEffect, useState } from "react";
import type { AdminRegistrationDetail } from "@/lib/playsafe-workflow/adminTypes";
import { readCachedDetail, writeCachedDetail } from "@/lib/playsafe-workflow/client/adminDetailCache";
import { fetchAdminDetail } from "@/lib/playsafe-workflow/client/adminApi";

type FetchResult = { registrationId: string; detail: AdminRegistrationDetail | null; error: string | null };

export function usePlaysafeAdminDetail(registrationId: string) {
  const [result, setResult] = useState<FetchResult | null>(null);
  const cached = readCachedDetail(registrationId);

  useEffect(() => {
    if (readCachedDetail(registrationId)) return;
    let active = true;
    fetchAdminDetail(registrationId)
      .then((detail) => {
        writeCachedDetail(registrationId, detail);
        if (active) setResult({ registrationId, detail, error: null });
      })
      .catch((e: unknown) => {
        const error = e instanceof Error ? e.message : "상세를 불러오지 못했습니다.";
        if (active) setResult({ registrationId, detail: null, error });
      });
    return () => {
      active = false;
    };
  }, [registrationId]);

  const current = result?.registrationId === registrationId ? result : null;
  return { detail: cached ?? current?.detail ?? null, error: cached ? null : (current?.error ?? null) };
}
