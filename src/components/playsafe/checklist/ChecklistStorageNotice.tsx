const notices = [
  "작성 중인 내용과 사진은 이 기기의 브라우저에만 임시 저장되며, ‘안전성평가 완료 후 등록’을 누르기 전에는 서버로 전송되지 않습니다.",
  "18개 항목을 모두 확인해야 등록할 수 있고, 등록하면 시설정보·기구사진·평가 결과·위험요소 사진이 한 번에 제출됩니다.",
  "다른 기기나 다른 브라우저에서는 작성 중인 기록을 이어서 볼 수 없습니다.",
  "브라우저 방문 기록·사이트 데이터를 삭제하거나 시크릿(비공개) 창을 닫으면 등록 전 기록이 사라집니다.",
  "등록 후에는 수정할 수 없으니, 필요하면 ‘기록 내려받기’ 또는 ‘평가표 인쇄’로 사본을 보관해 주세요.",
];

export function ChecklistStorageNotice() {
  return (
    <aside className="check-notice" aria-label="기록 저장 안내">
      <strong className="check-notice-title">기록 저장 안내</strong>
      <ul>
        {notices.map((notice) => (
          <li key={notice}>{notice}</li>
        ))}
      </ul>
    </aside>
  );
}
