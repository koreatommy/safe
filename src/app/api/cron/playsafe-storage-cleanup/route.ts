import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { jsonError, serviceUnavailable } from "@/lib/server/http";
import { createServiceClient } from "@/lib/server/supabaseAdmin";
import { removeOrphanPhotos } from "@/lib/playsafe-workflow/server/orphanPhotoCleanup";

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const expected = Buffer.from(`Bearer ${secret}`);
  const actual = Buffer.from(request.headers.get("authorization") ?? "");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/** Vercel Cron이 매일 호출한다. CRON_SECRET이 없으면 실행하지 않는다. */
export async function GET(request: Request) {
  if (!isAuthorized(request)) return jsonError("권한이 없습니다.", 401);
  const admin = createServiceClient();
  if (!admin) return serviceUnavailable();

  const removed = await removeOrphanPhotos(admin);
  if (removed === null) return jsonError("정리 작업에 실패했습니다.", 502);
  return NextResponse.json({ removed });
}
