import { readFile } from "node:fs/promises";
import path from "node:path";

const CHART_CDN_TAG =
  '<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.7/chart.umd.min.js"></script>';

async function buildStandaloneHtml(): Promise<string> {
  const root = process.cwd();
  const reportPath = path.join(root, "src", "app", "report", "report_modify.html");
  const chartPath = path.join(root, "node_modules", "chart.js", "dist", "chart.umd.js");

  const [reportHtml, chartScript] = await Promise.all([
    readFile(reportPath, "utf-8"),
    readFile(chartPath, "utf-8"),
  ]);

  // Inline local Chart.js to avoid external CDN dependency failures.
  const safeChartScript = chartScript.replace(/<\/script>/gi, "<\\/script>");
  return reportHtml.replace(CHART_CDN_TAG, `<script>${safeChartScript}</script>`);
}

export async function GET() {
  const html = await buildStandaloneHtml();

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
