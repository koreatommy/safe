import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  page: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
};

const WINDOW = 5;

function visiblePages(page: number, pageCount: number): number[] {
  const start = Math.max(1, Math.min(page - Math.floor(WINDOW / 2), pageCount - WINDOW + 1));
  const end = Math.min(pageCount, start + WINDOW - 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

const baseButton = "min-w-8 h-8 px-2 rounded-md border text-xs transition-colors disabled:opacity-30 disabled:cursor-not-allowed";

export function Pagination({ page, total, pageSize, onChange }: PaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  if (pageCount <= 1) return null;

  return (
    <nav aria-label="페이지 이동" className="flex items-center justify-center gap-1">
      <button
        type="button"
        aria-label="이전 페이지"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className={`${baseButton} border-white/10 bg-white/5 text-white/70 hover:border-white/25`}
      >
        <ChevronLeft className="w-4 h-4 mx-auto" />
      </button>
      {visiblePages(page, pageCount).map((value) => (
        <button
          key={value}
          type="button"
          aria-current={value === page ? "page" : undefined}
          onClick={() => onChange(value)}
          className={`${baseButton} ${
            value === page
              ? "border-[#00ff88] bg-[#00ff88]/20 text-white"
              : "border-white/10 bg-white/5 text-white/70 hover:border-white/25"
          }`}
        >
          {value}
        </button>
      ))}
      <button
        type="button"
        aria-label="다음 페이지"
        disabled={page >= pageCount}
        onClick={() => onChange(page + 1)}
        className={`${baseButton} border-white/10 bg-white/5 text-white/70 hover:border-white/25`}
      >
        <ChevronRight className="w-4 h-4 mx-auto" />
      </button>
    </nav>
  );
}
