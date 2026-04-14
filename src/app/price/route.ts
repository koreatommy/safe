import { readFile } from "node:fs/promises";
import path from "node:path";

export async function GET() {
  const htmlPath = path.join(process.cwd(), "src", "app", "price", "pricing.html");
  const html = await readFile(htmlPath, "utf-8");

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
