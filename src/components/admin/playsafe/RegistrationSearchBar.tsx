"use client";

import type { RegistrationSearch, TargetFilter } from "@/lib/playsafe-workflow/adminTypes";
import { AdminSearchForm } from "./AdminSearchForm";

const TARGET_OPTIONS: ReadonlyArray<{ value: TargetFilter; label: string }> = [
  { value: "all", label: "평가대상여부 전체" },
  { value: "target", label: "대상" },
  { value: "not_target", label: "비대상" },
];

type RegistrationSearchBarProps = {
  value: RegistrationSearch;
  onSearch: (next: RegistrationSearch) => void;
};

export function RegistrationSearchBar({ value, onSearch }: RegistrationSearchBarProps) {
  return (
    <AdminSearchForm
      value={{ option: value.target, keyword: value.keyword }}
      options={TARGET_OPTIONS}
      defaultOption="all"
      selectLabel="평가대상여부"
      keywordLabel="시설명 검색"
      placeholder="시설명으로 검색"
      onSearch={({ option, keyword }) => onSearch({ target: option, keyword })}
    />
  );
}
