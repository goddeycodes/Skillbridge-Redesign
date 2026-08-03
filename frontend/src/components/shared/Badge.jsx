// components/shared/Badge.jsx
//
// NOTE: callers still pass color="blue" / "violet" / "amber" / "green" etc —
// deliberately unchanged, so PostCard.jsx, MatchCard.jsx, SkillCard.jsx, and
// SessionCard.jsx all repaint correctly with zero edits on their end. Only
// what each key *points to* changed.

export default function Badge({ label, color = 'blue', size = 'sm' }) {
  const colors = {
    blue:   'bg-brand-50   text-brand-700   border-brand-100',   // was literal blue-*
    green:  'bg-success-50 text-success-700 border-success-100', // was literal green-*
    amber:  'bg-gold-50    text-gold-700    border-gold-100',    // was literal amber-*
    violet: 'bg-learn-50   text-learn-700   border-learn-100',   // was literal violet-*
    slate:  'bg-slate-100  text-slate-600   border-slate-200',
    red:    'bg-red-50     text-red-600     border-red-100',     // stays red — cancelled/error is intentionally outside the 5-token brand palette
  };
  const sizes = { xs: 'text-xs px-2 py-0.5', sm: 'text-xs px-2.5 py-1' };
  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${colors[color]} ${sizes[size]}`}>
      {label}
    </span>
  );
}