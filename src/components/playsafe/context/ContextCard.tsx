type ContextCardProps = {
  variant: "challenge" | "solution";
  index: string;
  micro: string;
  title: string;
  description: string;
  items: string[];
};

export function ContextCard({ variant, index, micro, title, description, items }: ContextCardProps) {
  return (
    <article className={`context-card context-${variant} reveal`}>
      <span className="context-icon" aria-hidden="true">
        {index}
      </span>
      <div>
        <span className="micro">{micro}</span>
        <h3>{title}</h3>
        <p>{description}</p>
        <ul>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </article>
  );
}
