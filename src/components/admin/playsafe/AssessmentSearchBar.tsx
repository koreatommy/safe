"use client";

import type { AssessmentSearch, AssessmentSearchField } from "@/lib/playsafe-workflow/adminTypes";
import { AdminSearchForm } from "./AdminSearchForm";

const FIELD_OPTIONS: ReadonlyArray<{ value: AssessmentSearchField; label: string }> = [
  { value: "facility", label: "시설명" },
  { value: "assessor", label: "평가자" },
  { value: "submitter", label: "입력자" },
];

type AssessmentSearchBarProps = {
  value: AssessmentSearch;
  onSearch: (next: AssessmentSearch) => void;
};

export function AssessmentSearchBar({ value, onSearch }: AssessmentSearchBarProps) {
  return (
    <AdminSearchForm
      value={{ option: value.field, keyword: value.keyword }}
      options={FIELD_OPTIONS}
      defaultOption="facility"
      selectLabel="검색 항목"
      keywordLabel="검색어"
      placeholder="검색어를 입력하세요"
      onSearch={({ option, keyword }) => onSearch({ field: option, keyword })}
    />
  );
}
