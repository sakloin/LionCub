// Minimal editorial lion cub: a face circle ringed by 12 mane "tuft" circles,
// two tiny ears, a triangular nose and a soft mouth. Ported from
// design-handoff/design/components.jsx (LionMarkSvg).

export function LionMark({
  size = 64,
  color = "currentColor",
}: {
  size?: number;
  color?: string;
}) {
  const cx = 32;
  const cy = 34;
  const faceR = 12.5;
  const maneR = 16;
  const tuftR = 3.4;
  const tufts = Array.from({ length: 12 }, (_, i) => {
    const a = ((i * 30 - 90) * Math.PI) / 180;
    return [cx + maneR * Math.cos(a), cy + maneR * Math.sin(a)] as const;
  });
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-label="Lion Cub"
      role="img"
    >
      {tufts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={tuftR} stroke={color} strokeWidth="1.3" fill="none" />
      ))}
      <path
        d={`M${cx - 9} ${cy - 13} L${cx - 7} ${cy - 16.5} L${cx - 5} ${cy - 13} Z`}
        stroke={color}
        strokeWidth="1.2"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d={`M${cx + 5} ${cy - 13} L${cx + 7} ${cy - 16.5} L${cx + 9} ${cy - 13} Z`}
        stroke={color}
        strokeWidth="1.2"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx={cx} cy={cy} r={faceR} stroke={color} strokeWidth="1.5" fill="none" />
      <circle cx={cx - 5} cy={cy - 2} r="1.1" fill={color} />
      <circle cx={cx + 5} cy={cy - 2} r="1.1" fill={color} />
      <path d={`M${cx - 1.8} ${cy + 2.6} L${cx + 1.8} ${cy + 2.6} L${cx} ${cy + 4.6} Z`} fill={color} />
      <path d={`M${cx} ${cy + 4.6} L${cx} ${cy + 6.2}`} stroke={color} strokeWidth="1" strokeLinecap="round" />
      <path
        d={`M${cx} ${cy + 6.2} Q${cx - 2.4} ${cy + 7.6} ${cx - 3.8} ${cy + 6.6}`}
        stroke={color}
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M${cx} ${cy + 6.2} Q${cx + 2.4} ${cy + 7.6} ${cx + 3.8} ${cy + 6.6}`}
        stroke={color}
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Logo lockup: mark + "Lion Cub" wordmark + "Baby Clothing" line.
export default function LogoMark({
  size = 28,
  color = "currentColor",
  showWordmark = true,
}: {
  size?: number;
  color?: string;
  showWordmark?: boolean;
}) {
  if (!showWordmark) return <LionMark size={size} color={color} />;
  return (
    <span className="inline-flex items-center" style={{ gap: size * 0.32 }}>
      <LionMark size={size} color={color} />
      <span className="flex flex-col leading-none" style={{ gap: 2 }}>
        <span
          className="lc-display-i"
          style={{ fontSize: size * 0.7, color, letterSpacing: "-0.02em" }}
        >
          Lion Cub
        </span>
        <span
          className="lc-mono uppercase"
          style={{ fontSize: size * 0.22, color, letterSpacing: "0.32em", opacity: 0.6 }}
        >
          Baby Clothing
        </span>
      </span>
    </span>
  );
}
