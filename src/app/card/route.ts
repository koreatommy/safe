import { listCards } from "@/lib/digital-card/registry";
import { renderDigitalCardIndexHtml } from "@/lib/digital-card/render";

export async function GET() {
  const html = renderDigitalCardIndexHtml(listCards());

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
