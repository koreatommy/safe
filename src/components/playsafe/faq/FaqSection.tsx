import { faqs } from "@/data/playsafe/faqs";
import { FaqAnswer } from "./FaqAnswer";
import "./faq.css";

export function FaqSection() {
  return (
    <section className="section white" id="faq">
      <div className="wrap faq-layout">
        <div className="faq-intro">
          <span className="eyebrow">07 · QUESTIONS & ANSWERS</span>
          <h2>
            궁금한 점을
            <br />
            풀어드립니다.
          </h2>
          <p>
            관리주체가 자주 묻는 질문을
            <br />
            가이드라인의 설명으로 정리했습니다.
          </p>
          <span className="tag">원문 Q&A PDF 32–33쪽 외</span>
        </div>
        <div>
          {faqs.map((faq) => (
            <details key={faq.question}>
              <summary>{faq.question}</summary>
              <FaqAnswer answer={faq.answer} link={faq.link} />
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
