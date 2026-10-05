import "./footer.css";

export function SiteFooter() {
  return (
    <>
      <footer className="site-footer">
        <div className="wrap footer-row">
          <div>
            <b>어린이 놀이공간 안전가이드</b>
            <br />
            출처: 행정안전부 〈신종·유사 어린이놀이시설에 대한 안전관리 가이드라인〉
            <br />
            발행: 안전관리지원기관 (사)창의융합연구원
          </div>
          <div>
            첨부본 기반 웹 재구성 · 공식 기관 웹사이트가 아닙니다.
            <br />
            사진·도표·포스터는 첨부 PDF에 수록된 자료입니다.
          </div>
        </div>
      </footer>
      <a className="top-link" href="#top" aria-label="맨 위로 이동">
        ↑
      </a>
    </>
  );
}
