import { getCard } from "@/lib/digital-card/registry";
import {
  renderDigitalCardHtml,
  renderDigitalCardIndexHtml,
} from "@/lib/digital-card/render";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_: Request, context: RouteContext) {
  const { slug } = await context.params;
  const card = getCard(slug);

  if (!card) {
    return new Response("Not Found", { status: 404 });
  }

  const html = renderDigitalCardHtml(card);

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
