"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface Application {
  id: string;
  name: string;
  email: string;
  phone: string;
  affiliation: string;
  status: "pending" | "confirmed" | "cancelled";
  notes: string | null;
  certificate_number: string | null;
  certificate_file_url: string | null;
  created_at: string;
  updated_at: string;
}

export type ApplicationFilter = "all" | "pending" | "confirmed" | "cancelled";

export function useApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<ApplicationFilter>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploadingFileId, setUploadingFileId] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("safe_education_applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (filter !== "all") {
        query = query.eq("status", filter);
      }

      const { data, error } = await query;
      if (error) {
        console.error("데이터 조회 오류:", error);
        return;
      }
      setApplications(data || []);
    } catch (error) {
      console.error("예상치 못한 오류:", error);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleStatusChange = async (id: string, newStatus: Application["status"]) => {
    setUpdatingId(id);
    try {
      const { error } = await supabase
        .from("safe_education_applications")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) {
        alert("상태 변경에 실패했습니다.");
        return;
      }

      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
      );
    } catch {
      alert("상태 변경에 실패했습니다.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`${name}님의 신청을 삭제하시겠습니까?`)) return;

    setDeletingId(id);
    try {
      const { error } = await supabase
        .from("safe_education_applications")
        .delete()
        .eq("id", id);

      if (error) {
        alert("삭제에 실패했습니다.");
        return;
      }
      setApplications((prev) => prev.filter((app) => app.id !== id));
    } catch {
      alert("삭제에 실패했습니다.");
    } finally {
      setDeletingId(null);
    }
  };

  const saveCertificateNumber = async (id: string, certificateNumber: string | null) => {
    setUpdatingId(id);
    try {
      const { error } = await supabase
        .from("safe_education_applications")
        .update({ certificate_number: certificateNumber })
        .eq("id", id);

      if (error) {
        alert("수료증 번호 저장에 실패했습니다.");
        return false;
      }

      setApplications((prev) =>
        prev.map((app) =>
          app.id === id ? { ...app, certificate_number: certificateNumber } : app
        )
      );
      return true;
    } catch {
      alert("수료증 번호 저장에 실패했습니다.");
      return false;
    } finally {
      setUpdatingId(null);
    }
  };

  const uploadFile = async (id: string, file: File) => {
    if (!file.type.includes("pdf")) {
      alert("PDF 파일만 업로드 가능합니다.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("파일 크기는 10MB 이하여야 합니다.");
      return;
    }

    setUploadingFileId(id);
    let uploadedFilePath: string | null = null;

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${id}_${Date.now()}.${fileExt}`;
      uploadedFilePath = fileName;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("certificates")
        .upload(fileName, file, { cacheControl: "3600", upsert: true });

      if (uploadError || !uploadData) {
        const msg = uploadError?.message?.toLowerCase() || "";
        if (msg.includes("bucket not found")) alert("Storage 버킷을 찾을 수 없습니다.");
        else if (msg.includes("row-level security") || msg.includes("policy")) alert("파일 업로드 권한이 없습니다.");
        else alert("파일 업로드에 실패했습니다.");
        return;
      }

      const { data: { publicUrl } } = supabase.storage.from("certificates").getPublicUrl(fileName);

      const response = await fetch(publicUrl, { method: "HEAD" });
      if (!response.ok) {
        await supabase.storage.from("certificates").remove([fileName]);
        alert("업로드된 파일을 확인할 수 없습니다.");
        return;
      }

      const { error: updateError } = await supabase
        .from("safe_education_applications")
        .update({ certificate_file_url: publicUrl })
        .eq("id", id);

      if (updateError) {
        await supabase.storage.from("certificates").remove([fileName]);
        alert("파일 정보 저장에 실패했습니다.");
        return;
      }

      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, certificate_file_url: publicUrl } : app))
      );
    } catch {
      if (uploadedFilePath) {
        await supabase.storage.from("certificates").remove([uploadedFilePath]).catch(() => {});
      }
      alert("파일 업로드 중 오류가 발생했습니다.");
    } finally {
      setUploadingFileId(null);
    }
  };

  const updateFile = async (id: string, file: File) => {
    const application = applications.find((app) => app.id === id);
    const existingFileUrl = application?.certificate_file_url;

    if (!file.type.includes("pdf")) {
      alert("PDF 파일만 업로드 가능합니다.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("파일 크기는 10MB 이하여야 합니다.");
      return;
    }

    setUploadingFileId(id);
    let uploadedFilePath: string | null = null;

    try {
      let oldFilePath: string | null = null;
      if (existingFileUrl) {
        try {
          const url = new URL(existingFileUrl);
          const pathParts = url.pathname.split("/");
          const idx = pathParts.indexOf("certificates");
          if (idx !== -1 && idx < pathParts.length - 1) {
            oldFilePath = pathParts.slice(idx + 1).join("/");
          }
        } catch {}
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${id}_${Date.now()}.${fileExt}`;
      uploadedFilePath = fileName;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("certificates")
        .upload(fileName, file, { cacheControl: "3600", upsert: true });

      if (uploadError || !uploadData) {
        alert("파일 업로드에 실패했습니다.");
        return;
      }

      const { data: { publicUrl } } = supabase.storage.from("certificates").getPublicUrl(fileName);

      const response = await fetch(publicUrl, { method: "HEAD" });
      if (!response.ok) {
        await supabase.storage.from("certificates").remove([fileName]);
        alert("업로드된 파일을 확인할 수 없습니다.");
        return;
      }

      const { error: updateError } = await supabase
        .from("safe_education_applications")
        .update({ certificate_file_url: publicUrl })
        .eq("id", id);

      if (updateError) {
        await supabase.storage.from("certificates").remove([fileName]);
        alert("파일 정보 저장에 실패했습니다.");
        return;
      }

      if (oldFilePath) {
        await supabase.storage.from("certificates").remove([oldFilePath]).catch(() => {});
      }

      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, certificate_file_url: publicUrl } : app))
      );
    } catch {
      if (uploadedFilePath) {
        await supabase.storage.from("certificates").remove([uploadedFilePath]).catch(() => {});
      }
      alert("파일 수정 중 오류가 발생했습니다.");
    } finally {
      setUploadingFileId(null);
    }
  };

  const deleteFile = async (id: string, fileUrl: string) => {
    if (!confirm("수료증 파일을 삭제하시겠습니까?")) return;

    setUploadingFileId(id);
    try {
      let filePath: string | null = null;
      try {
        const url = new URL(fileUrl);
        const pathParts = url.pathname.split("/");
        const idx = pathParts.indexOf("certificates");
        if (idx === -1 || idx === pathParts.length - 1) {
          alert("파일 경로를 찾을 수 없습니다.");
          return;
        }
        filePath = pathParts.slice(idx + 1).join("/");
      } catch {
        alert("파일 URL이 유효하지 않습니다.");
        return;
      }

      await supabase.storage.from("certificates").remove([filePath]);

      const { error: updateError } = await supabase
        .from("safe_education_applications")
        .update({ certificate_file_url: null })
        .eq("id", id);

      if (updateError) {
        alert("파일 정보 삭제에 실패했습니다.");
        return;
      }

      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, certificate_file_url: null } : app))
      );
    } catch {
      alert("파일 삭제 중 오류가 발생했습니다.");
    } finally {
      setUploadingFileId(null);
    }
  };

  return {
    applications,
    isLoading,
    filter,
    setFilter,
    updatingId,
    deletingId,
    uploadingFileId,
    handleStatusChange,
    handleDelete,
    saveCertificateNumber,
    uploadFile,
    updateFile,
    deleteFile,
  };
}
