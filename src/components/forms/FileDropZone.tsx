"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, FileText, Image, FileSpreadsheet, Archive, File } from "lucide-react";
import { validateFile } from "@/lib/upload-contact-files";

interface FileDropZoneProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  error?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(type: string) {
  if (type.startsWith("image/")) return <Image className="w-5 h-5 text-purple-400" />;
  if (type === "application/pdf") return <FileText className="w-5 h-5 text-red-400" />;
  if (type.includes("spreadsheet") || type.includes("excel")) return <FileSpreadsheet className="w-5 h-5 text-green-400" />;
  if (type.includes("zip")) return <Archive className="w-5 h-5 text-yellow-400" />;
  return <File className="w-5 h-5 text-blue-400" />;
}

export function FileDropZone({ files, onFilesChange, maxFiles = 10, error }: FileDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const newFiles = Array.from(incoming);
    const errors: string[] = [];
    const valid: File[] = [];

    for (const file of newFiles) {
      const err = validateFile(file);
      if (err) {
        errors.push(err);
      } else {
        const isDuplicate = files.some(
          (f) => f.name === file.name && f.size === file.size
        );
        if (!isDuplicate) valid.push(file);
      }
    }

    const total = files.length + valid.length;
    if (total > maxFiles) {
      errors.push(`최대 ${maxFiles}개까지 첨부할 수 있습니다.`);
      valid.splice(maxFiles - files.length);
    }

    setFileErrors(errors);
    if (valid.length > 0) onFilesChange([...files, ...valid]);
  }, [files, maxFiles, onFilesChange]);

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
    setFileErrors([]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-3">
      {/* 드롭 영역 */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200
          flex flex-col items-center justify-center gap-3 py-8 px-4
          ${isDragOver
            ? "border-[#00ff88] bg-[#00ff88]/10"
            : "border-white/20 hover:border-white/40 bg-white/[0.02]"
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleInputChange}
          accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.doc,.docx,.xls,.xlsx,.zip,.txt"
        />
        <motion.div
          animate={isDragOver ? { scale: 1.1, y: -4 } : { scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Upload className={`w-8 h-8 ${isDragOver ? "text-[#00ff88]" : "text-white/50"}`} />
        </motion.div>
        <div className="text-center">
          <p className={`text-sm font-medium ${isDragOver ? "text-[#00ff88]" : "text-white/70"}`}>
            {isDragOver ? "여기에 놓으세요" : "파일을 드래그하거나 클릭하여 첨부"}
          </p>
          <p className="text-xs text-white/40 mt-1">
            PDF, 이미지, 문서, ZIP, TXT (최대 20MB, {maxFiles}개까지)
          </p>
        </div>
      </div>

      {/* 파일 목록 */}
      <AnimatePresence mode="popLayout">
        {files.map((file, index) => (
          <motion.div
            key={`${file.name}-${file.size}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl glass-panel border border-white/10"
          >
            {getFileIcon(file.type)}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white/90 truncate">{file.name}</p>
              <p className="text-xs text-white/50">{formatFileSize(file.size)}</p>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeFile(index); }}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-red-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* 에러 메시지 */}
      {(fileErrors.length > 0 || error) && (
        <div className="space-y-1">
          {fileErrors.map((err, i) => (
            <p key={i} className="text-red-400 text-xs">{err}</p>
          ))}
          {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>
      )}
    </div>
  );
}
