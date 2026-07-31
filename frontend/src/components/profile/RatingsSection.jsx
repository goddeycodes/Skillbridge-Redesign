'use client';
import { Star } from 'lucide-react';

function StarRow({ score }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={13}
          className={i <= score ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'} />
      ))}
    </div>
  );
}

export default function RatingsSection({ ratings }) {
  if (!ratings?.length) return (
    <div className="sb-card p-8 flex flex-col items-center text-center text-slate-400">
      <Star size={28} className="mb-2 text-slate-200" />
      <p className="text-sm font-medium text-slate-500">No ratings yet</p>
      <p className="text-xs mt-1">Ratings appear here after completed sessions.</p>
    </div>
  );

  const avg = (ratings.reduce((s, r) => s + r.score, 0) / ratings.length).toFixed(1);

  return (
    <div className="sb-card overflow-hidden">
      {/* Summary */}
      <div className="flex items-center gap-4 px-5 py-4 border-b border-slate-100 bg-slate-50">
        <p className="text-4xl font-bold text-slate-800">{avg}</p>
        <div>
          <StarRow score={Math.round(avg)} />
          <p className="text-xs text-slate-400 mt-1">{ratings.length} rating{ratings.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* List */}
      <ul className="divide-y divide-slate-100">
        {ratings.map((r, i) => (
          <li key={i} className="px-5 py-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center shrink-0 text-xs font-semibold text-brand-600">
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <StarRow score={r.score} />
              {r.feedback && <p className="mt-1 text-sm text-slate-600 leading-relaxed">{r.feedback}</p>}
              <p className="text-xs text-slate-400 mt-1">{new Date(r.createdAt).toLocaleDateString()}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
