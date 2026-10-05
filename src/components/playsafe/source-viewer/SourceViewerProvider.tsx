"use client";

import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { clampGuidePage } from "@/lib/playsafe/assets";
import { SourceViewerContext } from "./sourceViewerContext";
import { SourceViewerDialog } from "./SourceViewerDialog";

export function SourceViewerProvider({ children }: { children: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [page, setPage] = useState(1);

  const goToPage = useCallback((next: number) => {
    setPage(clampGuidePage(next));
    if (dialogRef.current) dialogRef.current.scrollTop = 0;
  }, []);

  const openPage = useCallback(
    (next: number) => {
      goToPage(next);
      const dialog = dialogRef.current;
      if (dialog && !dialog.open) dialog.showModal();
    },
    [goToPage],
  );

  const api = useMemo(() => ({ openPage }), [openPage]);

  return (
    <SourceViewerContext.Provider value={api}>
      {children}
      <SourceViewerDialog ref={dialogRef} page={page} onPageChange={goToPage} />
    </SourceViewerContext.Provider>
  );
}
