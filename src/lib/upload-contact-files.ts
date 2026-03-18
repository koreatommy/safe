import { getSupabaseClient } from '@/lib/supabase';

const BUCKET = 'contact-attachments';
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

const ALLOWED_TYPES = [
  'application/pdf',
  'image/png', 'image/jpeg', 'image/gif', 'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
  'text/plain',
];

export interface UploadResult {
  name: string;
  url: string;
  size: number;
}

export function validateFile(file: File): string | null {
  if (file.size > MAX_FILE_SIZE) {
    return `${file.name}: 파일 크기는 20MB 이하여야 합니다.`;
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return `${file.name}: 허용되지 않는 파일 형식입니다. (PDF, 이미지, 문서, ZIP, TXT만 가능)`;
  }
  return null;
}

export async function uploadContactFiles(files: File[]): Promise<UploadResult[]> {
  const supabase = getSupabaseClient();
  const results: UploadResult[] = [];
  const timestamp = Date.now();

  for (const file of files) {
    const sanitized = file.name.replace(/[^a-zA-Z0-9가-힣._-]/g, '_');
    const filePath = `${timestamp}/${sanitized}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, file, { cacheControl: '3600', upsert: false });

    if (error) {
      throw new Error(`${file.name} 업로드 실패: ${error.message}`);
    }

    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(filePath);

    results.push({
      name: file.name,
      url: urlData.publicUrl,
      size: file.size,
    });
  }

  return results;
}
