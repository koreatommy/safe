import Link from "next/link";
import { PLACE_ETC } from "@/data/playsafe/facility-registration";
import type { CompletedRegistration } from "@/data/playsafe/types";
import type { Submitter } from "@/lib/playsafe-workflow/types";
import { playsafeRoutes } from "@/lib/playsafe/routes";

type RegistrationSummaryProps = {
  registration: CompletedRegistration;
  submitter: Submitter | null;
};

function display(value: string) {
  return value.trim() || "-";
}

export function RegistrationSummary({ registration, submitter }: RegistrationSummaryProps) {
  const { information: info, equipment, facilityPhotos = [] } = registration;
  const place = info.place === PLACE_ETC && info.placeEtc ? `${PLACE_ETC} (${info.placeEtc})` : info.place;
  const address = [info.postcode && `(${info.postcode})`, info.address, info.detailAddress].filter(Boolean).join(" ");

  const facts = [
    ["시설명", info.facilityName],
    ["임시시설번호", info.facilityNo],
    ["설치장소", place],
    ["주소", address],
    ["물놀이형", info.water],
    ["실내외", info.indoor],
    ["관리주체", info.managerName],
    ["연락처", [info.phone, info.email].filter(Boolean).join(" · ")],
    ["입력자", submitter ? `${submitter.name} (${submitter.email})` : ""],
  ] as const;

  return (
    <section className="assessment-registration" aria-label="입력한 시설정보">
      <header>
        <strong>저장된 시설정보 (안전성평가 등록 전)</strong>
        <Link href={playsafeRoutes.facilityInfo} className="btn">
          시설정보 다시 입력
        </Link>
      </header>
      <dl>
        {facts.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{display(value)}</dd>
          </div>
        ))}
      </dl>
      {facilityPhotos.length > 0 && (
        <div className="assessment-facility-photos">
          <span>시설 전경사진</span>
          <ul>
            {facilityPhotos.map((photo, index) => (
              <li key={photo.id}>
                {/* eslint-disable-next-line @next/next/no-img-element -- short-lived signed URL */}
                <img src={photo.photo} alt={`시설 전경사진 ${index + 1}`} />
              </li>
            ))}
          </ul>
        </div>
      )}
      <ul className="assessment-equipment">
        {equipment.map((row) => (
          <li key={row.id}>
            {row.photo ? (
              // eslint-disable-next-line @next/next/no-img-element -- short-lived signed URL
              <img src={row.photo} alt={`${row.type} 기구사진`} />
            ) : (
              <span className="assessment-equipment-empty">사진 없음</span>
            )}
            <div>
              <strong>{row.type}</strong>
              <span>
                {row.id}
                {row.date ? ` · 설치 ${row.date}` : ""}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
