import Link from "next/link";

export default function GimpoRiskReportsPage() {
  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <h1 className="mb-2 text-xl font-semibold text-neutral-900">
        김포 위험성평가 보고서
      </h1>
      <p className="mb-8 text-sm text-neutral-600">
        아래 링크에서 각 보고서를 열 수 있습니다.
      </p>
      <ul className="space-y-3 text-neutral-800">
        <li>
          <Link
            className="text-blue-700 underline underline-offset-2 hover:text-blue-900"
            href="/report/gimpo/risk/report1"
          >
            신종·유사 어린이놀이시설 위험성평가 보고서 – 하이채채 키즈풀
          </Link>
        </li>
        <li>
          <Link
            className="text-blue-700 underline underline-offset-2 hover:text-blue-900"
            href="/report/gimpo/risk/report2"
          >
            위험성평가 보고서 — 안녕 오아시스 키즈풀
          </Link>
        </li>
      </ul>
    </main>
  );
}
