import Link from 'next/link';

const VARIANTS = {
  color: { arc: '#1C6E6A', spark: '#F2A93B', wordmarkA: '#211F1B', wordmarkB: '#1C6E6A' },
  white: { arc: '#FFFFFF', spark: '#F2A93B', wordmarkA: '#FFFFFF', wordmarkB: '#FFFFFF' },
  mono:  { arc: 'currentColor', spark: 'currentColor', wordmarkA: 'currentColor', wordmarkB: 'currentColor' },
};

function Mark({ size = 28, variant = 'color' }) {
  const c = VARIANTS[variant] || VARIANTS.color;
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path
        d="M4 26C10 14 30 14 36 26"
        stroke={c.arc}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="20" cy="12" r="3.4" fill={c.spark} />
    </svg>
  );
}

export default function Logo({
  href = '/',
  size = 28,
  showWordmark = true,
  variant = 'color',   // 'color' | 'white' | 'mono'
  className = '',
}) {
  const c = VARIANTS[variant] || VARIANTS.color;

  const content = (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Mark size={size} variant={variant} />
      {showWordmark && (
        <span className="font-display font-bold text-lg tracking-tight">
          <span style={{ color: c.wordmarkA }}>Skill</span>
          <span style={{ color: c.wordmarkB }}>Bridge</span>
        </span>
      )}
    </span>
  );

  if (!href) return content;

  return (
    <Link href={href} className="inline-flex items-center">
      {content}
    </Link>
  );
}