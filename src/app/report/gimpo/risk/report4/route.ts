import { buildStandaloneReportHtml } from "@/lib/buildStandaloneReportHtml";

export async function GET() {
  const html = await buildStandaloneReportHtml(
    "gimpo/risk/위험성평가_보고서_김포플레이맘워터룸.html",
  );

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
