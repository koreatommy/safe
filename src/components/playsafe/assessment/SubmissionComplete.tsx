import Link from "next/link";
import { playsafeRoutes } from "@/lib/playsafe/routes";

export function SubmissionComplete({ facilityName }: { facilityName: string }) {
  return (
    <div className="check-complete" role="status">
      <strong>안전성평가 등록이 완료되었습니다.</strong>
      <p>
        ‘{facilityName}’의 시설정보와 안전성평가 결과가 서버에 등록되었습니다. 이 브라우저에 임시 저장된 작성 내용은
        삭제되었습니다.
      </p>
      <div className="row">
        <Link href={playsafeRoutes.facilityInfo} className="btn primary">
          다른 시설 입력하기 →
        </Link>
        <Link href={playsafeRoutes.home} className="btn">
          처음으로
        </Link>
      </div>
    </div>
  );
}
