import { buildStandaloneReportHtml } from "@/lib/buildStandaloneReportHtml";

export async function GET() {
  const html = await buildStandaloneReportHtml("gc_report_01.html");

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
