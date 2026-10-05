const notices = [
  "등록 전까지 모든 입력 내용과 사진은 이 브라우저에만 임시 저장됩니다. 다른 기기에서는 볼 수 없고, 사이트 데이터 삭제·시크릿 창 종료 시 사라집니다.",
  "18개 항목을 모두 확인하면 등록할 수 있으며, 등록 후에는 수정할 수 없습니다.",
  "사진은 ‘위험요소 있음’ 항목에만 3장까지 첨부되며, 상태를 바꾸면 삭제됩니다.",
  "사진까지 보관하려면 ‘기록 내려받기’ 대신 ‘안전성평가표 인쇄’를 이용해 주세요.",
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
