import { readFile } from "node:fs/promises";
import path from "node:path";

const PRESENTATION_FILE_NAME = "객관주의_구성주의_30장_프레젠테이션.html";

export async function GET() {
  const filePath = path.join(
    process.cwd(),
    "src",
    "app",
    "pt",
    PRESENTATION_FILE_NAME,
  );

  try {
    const html = await readFile(filePath, "utf-8");

    return new Response(html, {
      headers: {
        "content-type": "text/html; charset=utf-8",
      },
    });
  } catch {
    return new Response("PT HTML 파일을 찾을 수 없습니다.", {
      status: 404,
      headers: {
        "content-type": "text/plain; charset=utf-8",
      },
    });
  }
}
