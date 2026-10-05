import { buildStandaloneReportHtml } from "@/lib/buildStandaloneReportHtml";
import { injectYangjuReportChrome } from "@/lib/injectYangjuReportChrome";
import { getYangjuRiskReportFileName } from "../yangju-risk-reports";

const REPORT_ID_MAP: Record<string, number> = {
  report1: 1,
  report2: 2,
  report3: 3,
  report4: 4,
};

type RouteContext = {
  params: Promise<{ reportId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { reportId } = await context.params;
  const numericId = REPORT_ID_MAP[reportId];
  const fileName = numericId ? getYangjuRiskReportFileName(numericId) : undefined;

  if (!fileName) {
    return new Response("Not Found", { status: 404 });
  }

  const html = injectYangjuReportChrome(await buildStandaloneReportHtml(fileName));

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
