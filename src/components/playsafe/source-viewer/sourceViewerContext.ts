"use client";

import { createContext, useContext } from "react";

export type SourceViewerApi = {
  openPage: (page: number) => void;
};

export const SourceViewerContext = createContext<SourceViewerApi | null>(null);

export function useSourceViewer(): SourceViewerApi {
  const api = useContext(SourceViewerContext);
  if (!api) throw new Error("useSourceViewer must be used inside <SourceViewerProvider>");
  return api;
}
