import "server-only";

import type { NextResponse } from "next/server";
import { jsonError, readJson } from "@/lib/server/http";
import type { ApplicationInput } from "../types";
import { parseApplicationInput, validateApplicationInput } from "../validation/application";
import { requireSubmitter, type SubmitterContext } from "./requireSubmitter";

type ReadApplicationResult =
  | { ok: true; context: SubmitterContext; input: ApplicationInput }
  | { ok: false; response: NextResponse };

/** 입력자 헤더와 등록신청(시설정보·자격 답변) 본문을 함께 검증한다. */
export async function readApplication(request: Request): Promise<ReadApplicationResult> {
  const auth = requireSubmitter(request);
  if (!auth.ok) return auth;
  const input = parseApplicationInput(await readJson(request));
  if (!input) return { ok: false, response: jsonError("등록 정보가 올바르지 않습니다.", 400) };
  const problem = validateApplicationInput(input);
  if (problem) return { ok: false, response: jsonError(problem, 400) };
  return { ok: true, context: auth.context, input };
}
