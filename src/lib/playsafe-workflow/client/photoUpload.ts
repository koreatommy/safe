import { createBrowserSupabase } from "@/lib/supabase/browser";
import { PHOTO_CACHE_CONTROL_SECONDS } from "../constants";
import type { SignedUpload } from "../submissionTypes";

/** 서버가 입력자 확인 후 발급한 서명 업로드 토큰으로만 저장소에 쓴다. 경로가 uuid라 내용이 바뀌지 않으므로 오래 캐시한다. */
export async function uploadToSignedUrl(upload: SignedUpload, file: Blob, contentType: string) {
  const supabase = createBrowserSupabase();
  const { error } = await supabase.storage.from(upload.bucket).uploadToSignedUrl(upload.path, upload.token, file, {
    contentType,
    upsert: true,
    cacheControl: String(PHOTO_CACHE_CONTROL_SECONDS),
  });
  if (error) throw new Error(error.message);
}
