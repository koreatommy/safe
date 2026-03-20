"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { uploadContactFiles } from "@/lib/upload-contact-files";

/** 문의별 관리자 메모 한 건(댓글 형식) */
export interface InquiryMemo {
  id: string;
  inquiry_id: string;
  body: string;
  created_at: string;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  affiliation: string;
  inquiry: string;
  status: "pending" | "processing" | "completed";
  notes: string | null;
  notes_updated_at: string | null;
  attachment_urls: unknown;
  created_at: string;
  updated_at: string;
  /** 댓글 형식 관리자 메모 목록 (최신순) */
  memo_entries: InquiryMemo[];
}

export type InquiryFilter = "all" | "pending" | "processing" | "completed";

export type AttachmentEntry = { name: string; url: string };

type StoredAttachment = { name: string; url: string; size?: number };

function parseStoredAttachments(raw: unknown): StoredAttachment[] {
  if (!raw) return [];
  let arr: unknown[] = [];
  if (Array.isArray(raw)) {
    arr = raw;
  } else if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      arr = Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return arr
    .map((v) => {
      if (typeof v === "string") {
        return { name: v.split("/").pop() || "파일", url: v };
      }
      if (v && typeof v === "object" && "url" in v && typeof (v as { url: unknown }).url === "string") {
        const o = v as { url: string; name?: string; size?: number };
        const rec: StoredAttachment = {
          name: o.name || o.url.split("/").pop() || "파일",
          url: o.url,
        };
        if (typeof o.size === "number") rec.size = o.size;
        return rec;
      }
      return null;
    })
    .filter((v): v is StoredAttachment => v !== null);
}

export function parseAttachmentUrls(raw: unknown): AttachmentEntry[] {
  return parseStoredAttachments(raw).map(({ name, url }) => ({ name, url }));
}

export function useInquiries() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<InquiryFilter>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchInquiries = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("safe_contact_inquiries")
        .select("*")
        .order("created_at", { ascending: false });

      if (filter !== "all") {
        query = query.eq("status", filter);
      }

      const { data: inquiryData, error: inquiryError } = await query;
      if (inquiryError) {
        console.error("데이터 조회 오류:", inquiryError);
        setInquiries([]);
        return;
      }

      const ids = (inquiryData || []).map((row) => row.id);
      let memoMap: Record<string, InquiryMemo[]> = {};

      if (ids.length > 0) {
        try {
          const { data: memoData, error: memoError } = await supabase
            .from("safe_contact_inquiry_notes")
            .select("*")
            .in("inquiry_id", ids)
            .order("created_at", { ascending: false });

          if (!memoError && memoData) {
            for (const m of memoData as InquiryMemo[]) {
              if (!memoMap[m.inquiry_id]) memoMap[m.inquiry_id] = [];
              memoMap[m.inquiry_id].push(m);
            }
          }
        } catch {
          // 테이블이 없으면 무시하고 기존 notes 컬럼만 사용
        }
      }

      setInquiries(
        (inquiryData || []).map((row) => {
          const dbMemos = memoMap[row.id] ?? [];
          // 새 테이블에 메모가 없고, 기존 notes 컬럼에 값이 있으면 임시 항목으로 표시
          if (dbMemos.length === 0 && row.notes?.trim()) {
            const legacyMemo: InquiryMemo = {
              id: `legacy-${row.id}`,
              inquiry_id: row.id,
              body: row.notes,
              created_at: row.notes_updated_at || row.updated_at,
            };
            return { ...row, memo_entries: [legacyMemo] };
          }
          return { ...row, memo_entries: dbMemos };
        })
      );
    } catch (error) {
      console.error("예상치 못한 오류:", error);
      setInquiries([]);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  const handleStatusChange = async (id: string, newStatus: Inquiry["status"]) => {
    setUpdatingId(id);
    try {
      const { error } = await supabase
        .from("safe_contact_inquiries")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) {
        alert("상태 변경에 실패했습니다.");
        return;
      }
      setInquiries((prev) =>
        prev.map((inq) => (inq.id === id ? { ...inq, status: newStatus } : inq))
      );
    } catch {
      alert("상태 변경에 실패했습니다.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`${name}님의 문의사항을 삭제하시겠습니까?`)) return;

    setDeletingId(id);
    try {
      const { error } = await supabase
        .from("safe_contact_inquiries")
        .delete()
        .eq("id", id);

      if (error) {
        alert("삭제에 실패했습니다.");
        return;
      }
      setInquiries((prev) => prev.filter((inq) => inq.id !== id));
    } catch {
      alert("삭제에 실패했습니다.");
    } finally {
      setDeletingId(null);
    }
  };

  const addMemo = async (inquiryId: string, body: string) => {
    const trimmed = body?.trim();
    if (!trimmed) return false;
    setUpdatingId(inquiryId);
    try {
      const { data, error } = await supabase
        .from("safe_contact_inquiry_notes")
        .insert({ inquiry_id: inquiryId, body: trimmed })
        .select()
        .single();

      if (error) {
        alert("메모 추가에 실패했습니다.");
        return false;
      }
      setInquiries((prev) =>
        prev.map((inq) =>
          inq.id === inquiryId
            ? {
                ...inq,
                memo_entries: [data as InquiryMemo, ...inq.memo_entries],
              }
            : inq
        )
      );
      return true;
    } catch {
      alert("메모 추가에 실패했습니다.");
      return false;
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteMemo = async (inquiryId: string, memoId: string) => {
    setUpdatingId(inquiryId);
    try {
      const { error } = await supabase
        .from("safe_contact_inquiry_notes")
        .delete()
        .eq("id", memoId)
        .eq("inquiry_id", inquiryId);

      if (error) {
        alert("메모 삭제에 실패했습니다.");
        return false;
      }
      setInquiries((prev) =>
        prev.map((inq) =>
          inq.id === inquiryId
            ? {
                ...inq,
                memo_entries: inq.memo_entries.filter((m) => m.id !== memoId),
              }
            : inq
        )
      );
      return true;
    } catch {
      alert("메모 삭제에 실패했습니다.");
      return false;
    } finally {
      setUpdatingId(null);
    }
  };

  const MAX_INQUIRY_ATTACHMENTS = 10;

  const appendInquiryAttachments = async (inquiryId: string, files: File[]) => {
    if (files.length === 0) return false;
    setUpdatingId(inquiryId);
    try {
      const { data: row, error: fetchError } = await supabase
        .from("safe_contact_inquiries")
        .select("attachment_urls")
        .eq("id", inquiryId)
        .single();

      if (fetchError || !row) {
        alert("문의 첨부 정보를 불러오지 못했습니다.");
        return false;
      }

      const existing = parseStoredAttachments(row.attachment_urls);
      const remainingSlots = MAX_INQUIRY_ATTACHMENTS - existing.length;
      if (remainingSlots <= 0) {
        alert(`첨부파일은 최대 ${MAX_INQUIRY_ATTACHMENTS}개까지입니다.`);
        return false;
      }
      const toUpload = files.slice(0, remainingSlots);
      if (toUpload.length < files.length) {
        alert(`일부만 업로드됩니다. (최대 ${MAX_INQUIRY_ATTACHMENTS}개까지)`);
      }

      const uploaded = await uploadContactFiles(toUpload);
      const merged: StoredAttachment[] = [...existing, ...uploaded];

      const { error: updateError } = await supabase
        .from("safe_contact_inquiries")
        .update({ attachment_urls: merged })
        .eq("id", inquiryId);

      if (updateError) {
        alert("첨부 추가 저장에 실패했습니다.");
        return false;
      }

      setInquiries((prev) =>
        prev.map((inq) =>
          inq.id === inquiryId ? { ...inq, attachment_urls: merged } : inq
        )
      );
      return true;
    } catch (e) {
      alert(e instanceof Error ? e.message : "첨부 업로드 중 오류가 발생했습니다.");
      return false;
    } finally {
      setUpdatingId(null);
    }
  };

  return {
    inquiries,
    isLoading,
    filter,
    setFilter,
    updatingId,
    deletingId,
    handleStatusChange,
    handleDelete,
    addMemo,
    deleteMemo,
    appendInquiryAttachments,
  };
}
