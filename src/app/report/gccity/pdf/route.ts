import { readFile } from "node:fs/promises";
import path from "node:path";

export async function GET() {
  const filePath = path.join(
    process.cwd(),
    "src",
    "app",
    "report",
    "html",
    "gccity",
    "gccity_water_play20260618.pdf",
  );
  const buf = await readFile(filePath);

  return new Response(buf, {
    headers: {
      "content-type": "application/pdf",
      "content-disposition":
        'inline; filename="과천시_물놀이형_어린이놀이시설_점검결과보고서.pdf"',
      "cache-control": "no-store",
    },
  });
}
