// components/shared/Logo.jsx
//
// The Orbit Mark. Two nodes in permanent mutual orbit — teal and coral each
// pass through both positions over time, same as every SkillBridge member
// passes through both "teaching" and "learning." A gold spark shuttles
// between them on the connecting line: the credit economy, made literal.
//
// Defaults to a STATIC frozen frame (two solid dots + a line) — that's what
// belongs in nav bars, the sidebar, favicons, print, anywhere the mark needs
// to be instantly legible and cheap to render. Pass `animated` only for
// contexts where motion itself is meaningful: a match-finding screen, a
// session-connecting state, a page loader — i.e. real "in progress" moments,
// not decoration.
//
// Usage:
//   <Logo />                          // static mark + wordmark, brand colors
//   <Logo showWordmark={false} />     // mark only, e.g. mobile nav
//   <Logo variant="white" />          // for dark hero / footer sections
//   <Logo animated />                 // spinning + shuttling — loading/matching states only

import Link from 'next/link';

const VARIANTS = {
  color: { line: '#D8D2C6', nodeA: '#1C6E6A', nodeB: '#FF6B4A', spark: '#F2A93B', wordmarkA: '#211F1B', wordmarkB: '#1C6E6A' },
  white: { line: 'rgba(255,255,255,0.35)', nodeA: '#FFFFFF', nodeB: '#FF6B4A', spark: '#F2A93B', wordmarkA: '#FFFFFF', wordmarkB: '#FFFFFF' },
  mono:  { line: 'currentColor', nodeA: 'currentColor', nodeB: 'currentColor', spark: 'currentColor', wordmarkA: 'currentColor', wordmarkB: 'currentColor' },
};

function Mark({ size = 28, variant = 'color', animated = false }) {
  const c = VARIANTS[variant] || VARIANTS.color;

  if (!animated) {
    // Frozen frame — the shape the mark rests on when not "in progress."
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
        <line x1="7" y1="20" x2="33" y2="20" stroke={c.line} strokeWidth="1.6" />
        <circle cx="7" cy="20" r="5.4" fill={c.nodeA} />
        <circle cx="33" cy="20" r="5.4" fill={c.nodeB} />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 40 40" overflow="visible" aria-hidden="true">
      <g className="logo-orbit-spin">
        <circle cx="20" cy="20" r="13" fill="none" stroke={c.line} strokeWidth="1" strokeDasharray="0.5 3.4" opacity="0.6" />
        <line x1="7" y1="20" x2="33" y2="20" stroke={c.line} strokeWidth="1.4" />
        <circle className="logo-node-pulse" cx="7" cy="20" r="5.4" fill={c.nodeA} />
        <circle className="logo-node-pulse logo-node-pulse-delay" cx="33" cy="20" r="5.4" fill={c.nodeB} />
        <circle r="2.1" fill={c.spark}>
          <animateMotion
            path="M7,20 L33,20 L7,20"
            dur="2.2s"
            repeatCount="indefinite"
            keyTimes="0;0.5;1"
            keyPoints="0;1;0"
            calcMode="linear"
          />
        </circle>
      </g>
    </svg>
  );
}

export default function Logo({
  href = '/',
  size = 28,
  showWordmark = true,
  variant = 'color',   // 'color' | 'white' | 'mono'
  animated = false,    // only for real in-progress states — see note above
  className = '',
}) {
  const c = VARIANTS[variant] || VARIANTS.color;

  const content = (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Mark size={size} variant={variant} animated={animated} />
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