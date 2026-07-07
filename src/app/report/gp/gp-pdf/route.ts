import { readFile } from "node:fs/promises";
import path from "node:path";

export async function GET() {
  const filePath = path.join(process.cwd(), "src", "app", "report", "html", "gp", "gp.pdf");
  const buf = await readFile(filePath);

  return new Response(buf, {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": 'attachment; filename="gp.pdf"',
      "cache-control": "public, max-age=3600",
    },
  });
}
