import { buildStandaloneReportHtml } from "@/lib/buildStandaloneReportHtml";
import { injectYangjuReportChrome } from "@/lib/injectYangjuReportChrome";
import { getYangjuReportFileName } from "../yangju-reports";

type RouteContext = {
  params: Promise<{ reportId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { reportId } = await context.params;
  const fileName = getYangjuReportFileName(reportId);

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
