import "server-only";

import type { NextResponse } from "next/server";
import { jsonError, readJson } from "@/lib/server/http";
import type { SubmissionInput } from "../submissionTypes";
import { parseSubmissionInput, validateSubmissionInput } from "../validation/submission";
import { requireSubmitter, type SubmitterContext } from "./requireSubmitter";

type ReadSubmissionResult =
  | { ok: true; context: SubmitterContext; input: SubmissionInput }
  | { ok: false; response: NextResponse };

/** 입력자 헤더와 등록 본문을 함께 검증한다. */
export async function readSubmission(request: Request): Promise<ReadSubmissionResult> {
  const auth = requireSubmitter(request);
  if (!auth.ok) return auth;
  const input = parseSubmissionInput(await readJson(request));
  if (!input) return { ok: false, response: jsonError("등록 정보가 올바르지 않습니다.", 400) };
  const problem = validateSubmissionInput(input);
  if (problem) return { ok: false, response: jsonError(problem, 400) };
  return { ok: true, context: auth.context, input };
}
