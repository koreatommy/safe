import type { AdminRegistrationDetail } from "@/lib/playsafe-workflow/adminTypes";
import { DetailSection, InfoGrid } from "./DetailSection";
import { FacilityPhotoThumbs } from "./FacilityPhotoThumbs";
import { formatDateTime, orDash } from "./format";

export function FacilityInfoSection({ registration }: { registration: AdminRegistrationDetail["registration"] }) {
  const info = registration.information;
  const place = info.place === "기타" && info.placeEtc ? `기타 (${info.placeEtc})` : info.place;
  const address = [info.postcode && `(${info.postcode})`, info.address, info.detailAddress].filter(Boolean).join(" ");

  return (
    <DetailSection title="관리주체·시설정보">
      <InfoGrid
        items={[
          ["입력자", `${registration.submitter.name} (${registration.submitter.email})`],
          ["시설명", orDash(info.facilityName)],
          ["임시시설번호", orDash(info.facilityNo)],
          ["설치장소", orDash(place)],
          ["주소", orDash(address)],
          ["물놀이형", orDash(info.water)],
          ["실내외", orDash(info.indoor)],
          ["관리주체", orDash(info.managerName)],
          ["전화번호", orDash(info.phone)],
          ["관리주체 이메일", orDash(info.email)],
          ["개인정보 동의", formatDateTime(registration.consentAt)],
        ]}
      />
      <FacilityPhotoThumbs photos={registration.facilityPhotos} />
    </DetailSection>
  );
}
