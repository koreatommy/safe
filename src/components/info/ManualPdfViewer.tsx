"use client";

import { useCallback, useState } from "react";
import { Download, ExternalLink, FileText, RefreshCw } from "lucide-react";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { GlowCapsuleButton } from "@/components/glass/GlowCapsuleButton";
import { motion } from "framer-motion";

export interface ManualPdfViewerProps {
  sectionId: string;
  title: string;
  description: string;
  fileUrl: string;
  downloadLabel: string;
  viewLabel?: string;
  externalUrl?: string;
  externalLabel?: string;
}

const PDF_VIEWER_HEIGHT = "min(70vh, 800px)";

export function ManualPdfViewer({
  sectionId,
  title,
  description,
  fileUrl,
  downloadLabel,
  viewLabel = "PDF 바로보기",
  externalUrl,
  externalLabel = "외부 사이트 바로가기",
}: ManualPdfViewerProps) {
  const [isViewerVisible, setIsViewerVisible] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  const handleShowViewer = useCallback(() => {
    setLoadError(false);
    setIsViewerVisible(true);
    setIframeKey((prev) => prev + 1);
  }, []);

  const handleRetry = useCallback(() => {
    setLoadError(false);
    setIframeKey((prev) => prev + 1);
  }, []);

  return (
    <section id={sectionId} className="px-4 md:px-8 py-16 md:py-24">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <GlassPanel className="p-6 md:p-10 border-[#1e3a5f]/30 space-y-6">
            <div>
              <p className="text-[#00ff88] text-sm font-medium mb-3">매뉴얼</p>
              <h2 className="text-white text-xl md:text-2xl font-medium mb-3">{title}</h2>
              <p className="text-white/80 text-sm md:text-base leading-relaxed mb-2">
                {description}
              </p>
              <p className="text-white/60 text-sm leading-relaxed">
                아래 PDF 뷰어를 통해 매뉴얼을 바로 확인할 수 있습니다. PDF가 정상적으로
                표시되지 않는 경우 다운로드 버튼을 클릭하여 파일을 열람해 주세요.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              <GlowCapsuleButton
                onClick={handleShowViewer}
                className="text-sm px-5 py-2.5 inline-flex items-center gap-2"
              >
                <FileText className="w-4 h-4" aria-hidden />
                {viewLabel}
              </GlowCapsuleButton>
              <GlowCapsuleButton
                href={fileUrl}
                download
                className="text-sm px-5 py-2.5 inline-flex items-center gap-2"
                variant="secondary"
              >
                <Download className="w-4 h-4" aria-hidden />
                {downloadLabel}
              </GlowCapsuleButton>
              <GlowCapsuleButton
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm px-5 py-2.5 inline-flex items-center gap-2"
                variant="secondary"
              >
                <ExternalLink className="w-4 h-4" aria-hidden />
                새 창에서 열기
              </GlowCapsuleButton>
              {externalUrl && (
                <GlowCapsuleButton
                  href={externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm px-5 py-2.5 inline-flex items-center gap-2"
                  variant="secondary"
                >
                  <ExternalLink className="w-4 h-4" aria-hidden />
                  {externalLabel}
                </GlowCapsuleButton>
              )}
            </div>

            {isViewerVisible && (
              <div className="space-y-3">
                {loadError ? (
                  <div
                    className="rounded-2xl border border-[#f59e0b]/40 bg-[#f59e0b]/10 p-6 text-center space-y-4"
                    role="alert"
                  >
                    <p className="text-white/90 text-sm md:text-base">
                      PDF를 불러오지 못했습니다. 다운로드 버튼을 이용해 주세요.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                      <GlowCapsuleButton
                        href={fileUrl}
                        download
                        className="text-sm px-5 py-2.5 inline-flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" aria-hidden />
                        {downloadLabel}
                      </GlowCapsuleButton>
                      <GlowCapsuleButton
                        onClick={handleRetry}
                        variant="secondary"
                        className="text-sm px-5 py-2.5 inline-flex items-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" aria-hidden />
                        다시 시도
                      </GlowCapsuleButton>
                    </div>
                  </div>
                ) : (
                  <div
                    className="rounded-2xl overflow-hidden border border-white/10 bg-white/5"
                    style={{ height: PDF_VIEWER_HEIGHT }}
                  >
                    <iframe
                      key={iframeKey}
                      src={`${fileUrl}#view=FitH`}
                      title={title}
                      className="w-full h-full border-0"
                      loading="lazy"
                      onError={() => setLoadError(true)}
                    />
                  </div>
                )}
              </div>
            )}
          </GlassPanel>
        </motion.div>
      </div>
    </section>
  );
}
