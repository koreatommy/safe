import type { FaqItem } from "@/data/playsafe/types";

type FaqAnswerProps = Pick<FaqItem, "answer" | "link">;

export function FaqAnswer({ answer, link }: FaqAnswerProps) {
  const index = link ? answer.indexOf(link.label) : -1;
  if (!link || index < 0) return <p>{answer}</p>;

  return (
    <p>
      {answer.slice(0, index)}
      <a href={link.href} target="_blank" rel="noopener noreferrer">
        {link.label} ↗
      </a>
      {answer.slice(index + link.label.length)}
    </p>
  );
}
