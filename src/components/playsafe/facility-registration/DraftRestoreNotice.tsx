import "./draft-restore-notice.css";

type DraftRestoreNoticeProps = {
  facilityName: string;
  onStartNew: () => void;
};

export function DraftRestoreNotice({ facilityName, onStartNew }: DraftRestoreNoticeProps) {
  return (
    <div className="draft-restore-notice" role="status">
      <p>
        이 브라우저에 임시 저장된 <strong>{facilityName || "시설정보"}</strong> 입력 내용을 불러왔습니다. 다른 시설을
        등록하려면 새로 입력하세요.
      </p>
      <button type="button" className="btn" onClick={onStartNew}>
        새로 입력하기
      </button>
    </div>
  );
}
