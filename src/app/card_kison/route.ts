import { readFile } from "node:fs/promises";
import { join } from "node:path";

export async function GET() {
  const htmlPath = join(process.cwd(), "src/app/card_kison/digital-card.html");
  const html = await readFile(htmlPath, "utf-8");
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
