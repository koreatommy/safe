import { readFile } from "node:fs/promises";
import path from "node:path";

/** CDN script tags replaced with inlined node_modules Chart.js UMD build. */
const CHART_CDN_TAGS = [
  '<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.7/chart.umd.min.js"></script>',
  '<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"></script>',
];

/**
 * Reads `src/app/report/<fileName>` and inlines Chart.js when a known CDN tag is present.
 */
export async function buildStandaloneReportHtml(fileName: string): Promise<string> {
  const root = process.cwd();
  const reportPath = path.join(root, "src", "app", "report", fileName);
  const chartPath = path.join(root, "node_modules", "chart.js", "dist", "chart.umd.js");

  const [reportHtml, chartScript] = await Promise.all([
    readFile(reportPath, "utf-8"),
    readFile(chartPath, "utf-8"),
  ]);

  const safeChartScript = chartScript.replace(/<\/script>/gi, "<\\/script>");
  const inline = `<script>${safeChartScript}</script>`;

  let result = reportHtml;
  for (const tag of CHART_CDN_TAGS) {
    if (result.includes(tag)) {
      result = result.replace(tag, inline);
      break;
    }
  }
  return result;
}
