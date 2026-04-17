import { readFile } from "node:fs/promises";
import path from "node:path";
import { unstable_noStore as noStore } from "next/cache";

const IMAGE_CONTENT_TYPE_BY_EXT: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ asset: string }> },
) {
  noStore();
  const { asset } = await params;
  const ext = path.extname(asset).toLowerCase();
  const contentType = IMAGE_CONTENT_TYPE_BY_EXT[ext];

  if (!contentType) {
    return new Response("Unsupported asset type", { status: 400 });
  }

  const baseDir = path.join(process.cwd(), "src", "app", "inspect_tool");
  const assetPath = path.join(baseDir, asset);
  const normalized = path.normalize(assetPath);

  if (!normalized.startsWith(baseDir + path.sep)) {
    return new Response("Invalid asset path", { status: 400 });
  }

  try {
    const bytes = await readFile(normalized);
    return new Response(bytes, {
      headers: {
        "content-type": contentType,
        "cache-control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
