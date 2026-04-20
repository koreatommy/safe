import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { unstable_noStore as noStore } from "next/cache";

const ASSET_CONTENT_TYPE_BY_EXT: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

export const dynamic = "force-dynamic";

function parseByteRange(
  rangeHeader: string,
  totalSize: number,
): { start: number; end: number } | null {
  // Only support a single bytes range: bytes=start-end
  if (!rangeHeader.startsWith("bytes=")) return null;
  const raw = rangeHeader.replace("bytes=", "").trim();
  if (!raw || raw.includes(",")) return null;

  const [startRaw, endRaw] = raw.split("-");
  const hasStart = startRaw !== "";
  const hasEnd = endRaw !== "";

  if (!hasStart && !hasEnd) return null;

  let start = 0;
  let end = totalSize - 1;

  if (!hasStart && hasEnd) {
    // bytes=-N (last N bytes)
    const suffixLength = Number(endRaw);
    if (!Number.isFinite(suffixLength) || suffixLength <= 0) return null;
    start = Math.max(totalSize - suffixLength, 0);
  } else {
    start = Number(startRaw);
    if (!Number.isFinite(start) || start < 0) return null;
    if (hasEnd) {
      end = Number(endRaw);
      if (!Number.isFinite(end) || end < start) return null;
    }
  }

  if (start >= totalSize) return null;
  end = Math.min(end, totalSize - 1);
  return { start, end };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ asset: string }> },
) {
  noStore();
  const { asset } = await params;
  const ext = path.extname(asset).toLowerCase();
  const contentType = ASSET_CONTENT_TYPE_BY_EXT[ext];

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
    const fileInfo = await stat(normalized);
    const bytes = await readFile(normalized);
    const isVideo = ext === ".mp4" || ext === ".webm";

    if (isVideo) {
      const rangeHeader = request.headers.get("range");
      const totalSize = fileInfo.size;

      if (rangeHeader) {
        const parsed = parseByteRange(rangeHeader, totalSize);
        if (!parsed) {
          return new Response(null, {
            status: 416,
            headers: {
              "content-range": `bytes */${totalSize}`,
              "accept-ranges": "bytes",
            },
          });
        }

        const { start, end } = parsed;
        const chunk = bytes.subarray(start, end + 1);

        return new Response(chunk, {
          status: 206,
          headers: {
            "content-type": contentType,
            "content-length": String(chunk.byteLength),
            "content-range": `bytes ${start}-${end}/${totalSize}`,
            "accept-ranges": "bytes",
            "cache-control": "public, max-age=86400, stale-while-revalidate=604800",
          },
        });
      }
    }

    return new Response(bytes, {
      headers: {
        "content-type": contentType,
        "content-length": String(fileInfo.size),
        ...(isVideo ? { "accept-ranges": "bytes" } : {}),
        "cache-control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
