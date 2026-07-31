export default function Badge({ label, color = 'blue', size = 'sm' }) {
  const colors = {
    blue:   'bg-blue-50   text-blue-700   border-blue-100',
    green:  'bg-green-50  text-green-700  border-green-100',
    amber:  'bg-amber-50  text-amber-700  border-amber-100',
    violet: 'bg-violet-50 text-violet-700 border-violet-100',
    slate:  'bg-slate-100 text-slate-600  border-slate-200',
    red:    'bg-red-50    text-red-600    border-red-100',
  };
  const sizes = { xs: 'text-xs px-2 py-0.5', sm: 'text-xs px-2.5 py-1' };
  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${colors[color]} ${sizes[size]}`}>
      {label}
    </span>
  );
}
