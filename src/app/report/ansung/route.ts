import { buildStandaloneReportHtml } from "@/lib/buildStandaloneReportHtml";

export async function GET() {
  const html = await buildStandaloneReportHtml("ansung_water_play202606.html");

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
