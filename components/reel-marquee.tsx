type ReelMarqueeProps = {
  items: string[];
};

export function ReelMarquee({ items }: ReelMarqueeProps) {
  const doubled = [...items, ...items];

  return (
    <div className="reel-marquee" aria-label="Highlighted photography categories">
      <div className="reel-marquee__track">
        {doubled.map((item, index) => (
          <span key={`${item}-${index}`} className="reel-marquee__item">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
