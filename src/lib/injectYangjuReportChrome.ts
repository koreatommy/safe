const YANGJU_INDEX_PATH = "/report/yangju";
const CHROME_MARKER = "yangju-report-chrome";

const TOOLBAR_HTML = `
<div class="yangju-report-toolbar" role="toolbar" aria-label="보고서 도구">
  <a class="yangju-toolbar-btn yangju-toolbar-btn-index" href="${YANGJU_INDEX_PATH}">목록으로</a>
  <button type="button" class="yangju-toolbar-btn yangju-toolbar-btn-print" id="yangju-print-btn">PDF 인쇄</button>
</div>
`.trim();

const CHROME_STYLE = `
<style id="${CHROME_MARKER}-style">
.yangju-report-toolbar{
  position:fixed;top:0;left:0;right:0;z-index:9999;
  display:flex;justify-content:flex-end;align-items:center;gap:8px;
  padding:10px 16px;
  background:rgba(26,39,68,0.96);
  border-bottom:1px solid rgba(255,255,255,0.12);
  box-shadow:0 4px 20px rgba(26,39,68,0.25);
  backdrop-filter:blur(8px);
}
body:has(.yangju-report-toolbar){padding-top:56px;}
.yangju-toolbar-btn{
  display:inline-flex;align-items:center;justify-content:center;
  min-height:36px;padding:0 14px;border-radius:8px;
  font-family:'Noto Sans KR',sans-serif;font-size:13px;font-weight:600;
  cursor:pointer;text-decoration:none;transition:background .2s,transform .2s;
}
.yangju-toolbar-btn-index{
  background:rgba(255,255,255,0.12);color:#fff;border:1px solid rgba(255,255,255,0.22);
}
.yangju-toolbar-btn-index:hover{background:rgba(255,255,255,0.2);}
.yangju-toolbar-btn-print{
  background:#e65100;color:#fff;border:1px solid #bf360c;
  box-shadow:0 2px 6px rgba(230,81,0,0.35);
}
.yangju-toolbar-btn-print:hover{background:#f57c00;transform:translateY(-1px);}

@media print{
  @page{size:A4;margin:10mm 8mm;}
  *,*::before,*::after{
    -webkit-print-color-adjust:exact!important;
    print-color-adjust:exact!important;
    color-adjust:exact!important;
  }

  .yangju-report-toolbar,
  .toc{display:none!important;}

  body{padding:0!important;}
  .page-container{padding:0!important;max-width:100%!important;}
  .section{box-shadow:none!important;break-inside:auto;padding:18px 12px!important;}
  .cover{
    break-after:page;
    background:linear-gradient(135deg,#1B2A4A 0%,#2C3E6B 40%,#3B6CB4 100%)!important;
    color:#fff!important;
  }
  .pb{page-break-before:always;}
  .table-wrapper{overflow:visible!important;border-radius:0!important;}
  table{min-width:0!important;width:100%!important;table-layout:fixed!important;}
  .page-container table,
  .report table{font-size:9px!important;}
  .page-container thead th,
  .report thead th{
    padding:3px 2px!important;font-size:7.5px!important;
    white-space:normal!important;line-height:1.25!important;letter-spacing:-0.02em;
    background:#1B2A4A!important;color:#fff!important;
  }
  .page-container tbody td,
  .report tbody td{padding:3px 2px!important;font-size:8.5px!important;}
  .facility-name,
  .td-left,
  table td.left{
    max-width:none!important;font-size:8px!important;line-height:1.3!important;
    word-break:keep-all!important;overflow-wrap:anywhere!important;text-align:left!important;
  }
  .page-container tbody td>span:not([class]),
  .report tbody td>span:not([class]){font-size:10px!important;}
  .badge,.overall-badge{font-size:7.5px!important;padding:2px 4px!important;white-space:normal!important;line-height:1.2!important;}
  .charts-row{grid-template-columns:1fr 1fr!important;gap:10px!important;}
  .chart-box,.chart-canvas-wrap,
  div[style*="height:280px"],div[style*="height:300px"]{
    height:auto!important;min-height:180px!important;page-break-inside:avoid;
  }
  canvas,.yangju-chart-print-img{
    display:block!important;
    visibility:visible!important;
    opacity:1!important;
    max-width:100%!important;
    width:100%!important;
    height:280px!important;
    page-break-inside:avoid;
    object-fit:contain;
  }
  div[style*="height:300px"] canvas,
  div[style*="height:300px"] .yangju-chart-print-img{height:300px!important;}
  .mini-table{font-size:8px!important;}
  .mini-table th,.mini-table td{padding:2px 3px!important;font-size:7.5px!important;}
  .facility-detail,.issue-card,.facility-card{page-break-inside:avoid;}
  .good-summary-box,.good-chips,.rate-grid{page-break-inside:avoid;}
  .good-chip{font-size:8px!important;padding:1px 5px!important;}
  .issue-chip{font-size:7.5px!important;padding:1px 5px!important;}
  .stats-grid{gap:8px!important;}
  .stat-card{padding:10px 8px!important;}
  .stat-value,.stat-card .num{font-size:22px!important;}

  #sec4 .duty-compliance-table{font-size:9px!important;}
  #sec4 .duty-compliance-table .issue-desc-row td{padding:2px 6px 4px 8px!important;}

  .report{
    max-width:100%!important;box-shadow:none!important;
    padding:12px!important;margin:0!important;background:#fff!important;
  }
  .report-header{
    margin:0 0 16px 0!important;padding:16px 18px!important;
    background:#1a3a6c!important;color:#fff!important;
  }
  .finding{flex-direction:column!important;page-break-inside:avoid;gap:8px!important;}
  .finding .photo-wrap{flex:none!important;width:100%!important;max-width:100%!important;}
  .finding .photo{max-width:100%!important;height:auto!important;}
  .bar-label{width:130px!important;font-size:9px!important;}
  .bar-fill{font-size:9px!important;}
  .stat-cards{grid-template-columns:repeat(4,1fr)!important;gap:6px!important;}
  .stat-card .label{font-size:10px!important;}
  h2{page-break-after:avoid;}
}
</style>
`.trim();

const CHROME_SCRIPT = `
<script id="${CHROME_MARKER}-script">
(function () {
  var chartSnapshots = [];
  var chartsFrozen = false;

  function refreshCharts() {
    if (typeof Chart === "undefined") return;
    document.querySelectorAll("canvas").forEach(function (canvas) {
      try {
        var chart = Chart.getChart(canvas);
        if (!chart) return;
        chart.resize();
        chart.update("none");
      } catch (e) {}
    });
  }

  function freezeChartsForPrint() {
    if (chartsFrozen) return;
    refreshCharts();
    chartSnapshots = [];
    document.querySelectorAll("canvas").forEach(function (canvas) {
      try {
        var chart = Chart.getChart(canvas);
        if (chart) {
          chart.resize();
          chart.update("none");
        }
        var rect = canvas.getBoundingClientRect();
        var img = document.createElement("img");
        img.src = canvas.toDataURL("image/png");
        img.className = "yangju-chart-print-img";
        img.alt = "";
        img.style.width = rect.width + "px";
        img.style.height = rect.height + "px";
        img.setAttribute("data-yangju-chart-snapshot", "1");
        canvas.insertAdjacentElement("afterend", img);
        canvas.style.display = "none";
        chartSnapshots.push({ canvas: canvas, img: img });
      } catch (e) {}
    });
    chartsFrozen = true;
  }

  function restoreChartsAfterPrint() {
    if (!chartsFrozen) return;
    chartSnapshots.forEach(function (snap) {
      snap.canvas.style.display = "";
      if (snap.img && snap.img.parentNode) {
        snap.img.parentNode.removeChild(snap.img);
      }
    });
    chartSnapshots = [];
    chartsFrozen = false;
    refreshCharts();
  }

  function printReport() {
    freezeChartsForPrint();
    setTimeout(function () {
      window.print();
    }, 150);
  }

  window.addEventListener("beforeprint", freezeChartsForPrint);
  window.addEventListener("afterprint", restoreChartsAfterPrint);

  var printBtn = document.getElementById("yangju-print-btn");
  if (printBtn) {
    printBtn.addEventListener("click", printReport);
  }
})();
</script>
`.trim();

export function injectYangjuReportChrome(html: string): string {
  if (html.includes(`${CHROME_MARKER}-style`)) {
    return html;
  }

  let result = html.replace("</head>", `${CHROME_STYLE}\n</head>`);
  result = result.replace(/<body([^>]*)>/i, `<body$1>\n${TOOLBAR_HTML}\n`);
  result = result.replace("</body>", `${CHROME_SCRIPT}\n</body>`);
  return result;
}
