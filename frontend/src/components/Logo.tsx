// Logo oficial SAPLINK — conceito "Pulse Node" (monitoramento de saúde de integrações).
// <Logo /> = marca + wordmark; <Logo variant="mark" /> = só o ícone.

export function LogoMark({ size = 28, className = "" }: { size?: number; className?: string }) {
  // gradiente único por instância evita colisão de ids quando há vários no DOM
  const id = "slk-mark-" + size;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} role="img" aria-label="SAPLINK">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#a78bfa" />
          <stop offset=".55" stopColor="#22d3ee" />
          <stop offset="1" stopColor="#34d399" />
        </linearGradient>
      </defs>
      <rect x="6" y="6" width="52" height="52" rx="15" fill="none" stroke={`url(#${id})`} strokeWidth="4" />
      <path d="M14 33 H25 L30 22 L36 44 L40 33 H50" fill="none" stroke={`url(#${id})`} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="50" cy="33" r="4.5" fill="#34d399" />
    </svg>
  );
}

export default function Logo({ size = 28, className = "", wordmark = true }: { size?: number; className?: string; wordmark?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark size={size} />
      {wordmark && (
        <span className="font-extrabold tracking-tight" style={{ fontSize: size * 0.62 }}>
          <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">SAP</span>
          <span className="text-[#e2e0ea]">LINK</span>
        </span>
      )}
    </span>
  );
}
