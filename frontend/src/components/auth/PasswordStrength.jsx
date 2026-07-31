'use client';

const checks = [
  { label: '8+ characters',    test: (p) => p.length >= 8 },
  { label: 'Uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'Number',           test: (p) => /[0-9]/.test(p) },
];

export default function PasswordStrength({ password }) {
  if (!password) return null;
  const passed = checks.filter(c => c.test(password)).length;
  const colors = ['bg-red-400', 'bg-yellow-400', 'bg-brand-500'];
  const color  = colors[Math.min(passed - 1, 2)] || 'bg-slate-200';

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < passed ? color : 'bg-slate-200'}`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-0.5">
        {checks.map(c => (
          <span key={c.label} className={`text-xs flex items-center gap-1 ${c.test(password) ? 'text-brand-600' : 'text-slate-400'}`}>
            <span>{c.test(password) ? '✓' : '○'}</span> {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}
