import { processSteps, scheduleItems } from "@/data/playsafe/process";
import { SectionHead } from "../shared/SectionHead";
import { ProcedureDetails } from "./ProcedureDetails";
import "./process.css";

export function ProcessSection() {
  return (
    <section className="section white" id="process">
      <div className="wrap">
        <SectionHead
          eyebrow="03 · THE SAFETY CYCLE"
          title="찾고, 낮추고, 다시 살펴보세요."
          description="한 번의 확인으로 끝나지 않는 세 단계 안전관리입니다."
          tag="원문 PDF 11–15쪽"
        />
        <div className="steps">
          {processSteps.map((step, i) => (
            <article className="step reveal" key={step.title}>
              <span className="step-num">{String(i + 1).padStart(2, "0")}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
              <span className="tag">{step.tag}</span>
            </article>
          ))}
        </div>
        <div className="schedule">
          {scheduleItems.map((item) => (
            <div key={item.title}>
              <strong>{item.title}</strong>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
        <ProcedureDetails />
      </div>
    </section>
  );
}
