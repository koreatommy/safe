import type { ReactNode } from "react";

type SectionHeadProps = {
  eyebrow: string;
  title: ReactNode;
  description: ReactNode;
  tag?: string;
  descriptionClassName?: string;
};

export function SectionHead({ eyebrow, title, description, tag, descriptionClassName }: SectionHeadProps) {
  return (
    <div className="section-head">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        <p className={descriptionClassName}>{description}</p>
      </div>
      {tag && <span className="tag">{tag}</span>}
    </div>
  );
}
