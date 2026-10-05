"use client";

import { useState, type FormEvent } from "react";
import { Search } from "lucide-react";

export type AdminSearchValue<T extends string> = { option: T; keyword: string };

type AdminSearchFormProps<T extends string> = {
  value: AdminSearchValue<T>;
  options: ReadonlyArray<{ value: T; label: string }>;
  defaultOption: T;
  selectLabel: string;
  keywordLabel: string;
  placeholder: string;
  onSearch: (next: AdminSearchValue<T>) => void;
};

const fieldClass =
  "h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[#00ff88]/60 focus:outline-none";

export function AdminSearchForm<T extends string>({
  value,
  options,
  defaultOption,
  selectLabel,
  keywordLabel,
  placeholder,
  onSearch,
}: AdminSearchFormProps<T>) {
  const [keyword, setKeyword] = useState(value.keyword);
  const [option, setOption] = useState<T>(value.option);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch({ option, keyword });
  };

  const handleReset = () => {
    setKeyword("");
    setOption(defaultOption);
    onSearch({ option: defaultOption, keyword: "" });
  };

  return (
    <form onSubmit={handleSubmit} role="search" className="flex flex-col sm:flex-row gap-2 min-w-0">
      <select
        aria-label={selectLabel}
        value={option}
        onChange={(event) => setOption(event.target.value as T)}
        className={`${fieldClass} sm:w-44 [&>option]:bg-neutral-900`}
      >
        {options.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
      <div className="relative flex-1 min-w-0">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        <input
          type="search"
          aria-label={keywordLabel}
          placeholder={placeholder}
          maxLength={100}
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          className={`${fieldClass} w-full pl-9 placeholder:text-white/40`}
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="h-10 flex-1 sm:flex-none rounded-lg border border-[#00ff88] bg-[#00ff88]/20 px-4 text-sm text-white transition-colors hover:bg-[#00ff88]/30"
        >
          검색
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="h-10 flex-1 sm:flex-none rounded-lg border border-white/10 bg-white/5 px-4 text-sm text-white/70 transition-colors hover:border-white/20"
        >
          초기화
        </button>
      </div>
    </form>
  );
}
