import { getCard, getPublicUrl } from "@/lib/digital-card/registry";
import { getCardQrPng } from "@/lib/digital-card/qr";

type RouteContext = {
  params: Promise<{
    slug: string;
    asset: string;
  }>;
};

const QR_ASSETS = new Set(["qr-code.png", "qr-code-dark.png"]);

export async function GET(_: Request, context: RouteContext) {
  const { slug, asset } = await context.params;

  if (!QR_ASSETS.has(asset) || !getCard(slug)) {
    return new Response("Not Found", { status: 404 });
  }

  const fileBuffer = await getCardQrPng(getPublicUrl(slug));

  return new Response(new Uint8Array(fileBuffer), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
