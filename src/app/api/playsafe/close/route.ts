import { NextResponse } from "next/server";
import { jsonError, readJson } from "@/lib/server/http";
import { requireSubmitter } from "@/lib/playsafe-workflow/server/requireSubmitter";
import { rpcErrorMessage } from "@/lib/playsafe-workflow/server/rpcErrors";
import { parseCloseInput, validateCloseInput } from "@/lib/playsafe-workflow/validation/closeRegistration";

export async function POST(request: Request) {
  const auth = requireSubmitter(request);
  if (!auth.ok) return auth.response;
  const { admin, submitter } = auth.context;

  const input = parseCloseInput(await readJson(request));
  if (!input) return jsonError("등록 정보가 올바르지 않습니다.", 400);
  const problem = validateCloseInput(input);
  if (problem) return jsonError(problem, 400);

  const { data, error } = await admin.rpc("close_playsafe_registration", {
    payload: {
      id: input.id,
      submitter,
      consentAt: input.consentAt,
      eligibilityVersion: input.eligibilityVersion,
      information: input.information,
      answers: input.answers,
    },
  });
  if (error) return jsonError(rpcErrorMessage(error), 409);
  return NextResponse.json(data);
}
