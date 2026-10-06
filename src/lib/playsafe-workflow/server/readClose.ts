import "server-only";

import type { NextResponse } from "next/server";
import { jsonError, readJson } from "@/lib/server/http";
import type { CloseRegistrationInput } from "../types";
import { parseCloseInput, validateCloseInput } from "../validation/closeRegistration";
import { requireSubmitter, type SubmitterContext } from "./requireSubmitter";

type ReadCloseResult =
  | { ok: true; context: SubmitterContext; input: CloseRegistrationInput }
  | { ok: false; response: NextResponse };

/** 입력자 헤더와 대상 아님 종결 본문을 함께 검증한다. */
export async function readClose(request: Request): Promise<ReadCloseResult> {
  const auth = requireSubmitter(request);
  if (!auth.ok) return auth;
  const input = parseCloseInput(await readJson(request));
  if (!input) return { ok: false, response: jsonError("등록 정보가 올바르지 않습니다.", 400) };
  const problem = validateCloseInput(input);
  if (problem) return { ok: false, response: jsonError(problem, 400) };
  return { ok: true, context: auth.context, input };
}
