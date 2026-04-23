import { readFile } from "node:fs/promises";
import { join } from "node:path";

type RouteContext = {
  params: Promise<{
    asset: string;
  }>;
};

const ASSET_MIME_TYPES: Record<string, string> = {
  "qr-code.png": "image/png",
  "qr-code-dark.png": "image/png",
};

export async function GET(_: Request, context: RouteContext) {
  const { asset } = await context.params;
  const contentType = ASSET_MIME_TYPES[asset];

  if (!contentType) {
    return new Response("Not Found", { status: 404 });
  }

  const filePath = join(process.cwd(), "src/app/card", asset);
  const fileBuffer = await readFile(filePath);

  return new Response(fileBuffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
