"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

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
}

export type InquiryFilter = "all" | "pending" | "processing" | "completed";

export type AttachmentEntry = { name: string; url: string };

export function parseAttachmentUrls(raw: unknown): AttachmentEntry[] {
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
      if (typeof v === "string") return { name: v.split("/").pop() || "파일", url: v };
      if (v && typeof v === "object" && "url" in v && typeof (v as { url: unknown }).url === "string") {
        const o = v as { url: string; name?: string };
        return { name: o.name || o.url.split("/").pop() || "파일", url: o.url };
      }
      return null;
    })
    .filter((v): v is AttachmentEntry => v !== null);
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

      const { data, error } = await query;
      if (error) {
        console.error("데이터 조회 오류:", error);
        setInquiries([]);
        return;
      }
      setInquiries(data || []);
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

  const saveNotes = async (id: string, notes: string | null) => {
    setUpdatingId(id);
    const trimmedNotes = notes?.trim() || null;
    const notesUpdatedAt = trimmedNotes ? new Date().toISOString() : null;
    try {
      let error = (await supabase
        .from("safe_contact_inquiries")
        .update({ notes: trimmedNotes, notes_updated_at: notesUpdatedAt })
        .eq("id", id)).error;

      if (error) {
        const isColumnMissing =
          error.message?.includes("notes_updated_at") ||
          error.code === "42703";
        if (isColumnMissing) {
          error = (await supabase
            .from("safe_contact_inquiries")
            .update({ notes: trimmedNotes })
            .eq("id", id)).error;
        }
      }

      if (error) {
        alert("메모 저장에 실패했습니다.");
        return false;
      }
      setInquiries((prev) =>
        prev.map((inq) =>
          inq.id === id
            ? { ...inq, notes: trimmedNotes, notes_updated_at: notesUpdatedAt }
            : inq
        )
      );
      return true;
    } catch {
      alert("메모 저장에 실패했습니다.");
      return false;
    } finally {
      setUpdatingId(null);
    }
  };

  return {
    inquiries, isLoading, filter, setFilter,
    updatingId, deletingId,
    handleStatusChange, handleDelete, saveNotes,
  };
}
