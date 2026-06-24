// Bandeiras em SVG (o emoji de bandeira não renderiza no Windows — vira "BR/US/ES").
export default function FlagIcon({ code, className = "" }: { code: string; className?: string }) {
  const cls = `inline-block rounded-[2px] shrink-0 ${className}`;
  if (code === "pt") {
    return (
      <svg viewBox="0 0 28 20" width="20" height="14" className={cls} aria-hidden="true">
        <rect width="28" height="20" fill="#009b3a" />
        <polygon points="14,2.5 25.5,10 14,17.5 2.5,10" fill="#fedf00" />
        <circle cx="14" cy="10" r="4" fill="#002776" />
      </svg>
    );
  }
  if (code === "en") {
    return (
      <svg viewBox="0 0 28 20" width="20" height="14" className={cls} aria-hidden="true">
        <rect width="28" height="20" fill="#b22234" />
        {[2.6, 5.7, 8.8, 11.9, 15, 18.1].map((y, i) => (
          <rect key={i} y={y} width="28" height="1.55" fill="#fff" />
        ))}
        <rect width="12" height="10.8" fill="#3c3b6e" />
      </svg>
    );
  }
  // es
  return (
    <svg viewBox="0 0 28 20" width="20" height="14" className={cls} aria-hidden="true">
      <rect width="28" height="20" fill="#c60b1e" />
      <rect y="5" width="28" height="10" fill="#ffc400" />
    </svg>
  );
}
