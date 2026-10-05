"use client";

import type { ReactNode } from "react";
import { useSourceViewer } from "./sourceViewerContext";

type SourcePageButtonProps = {
  page: number;
  className?: string;
  ariaLabel?: string;
  children: ReactNode;
};

export function SourcePageButton({ page, className = "btn", ariaLabel, children }: SourcePageButtonProps) {
  const { openPage } = useSourceViewer();
  return (
    <button type="button" className={className} aria-label={ariaLabel} onClick={() => openPage(page)}>
      {children}
    </button>
  );
}
