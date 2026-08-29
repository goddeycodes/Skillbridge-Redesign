'use client';
import { GraduationCap, User, Calendar } from 'lucide-react';
import { format, isToday } from 'date-fns';

/**
 * Summarises the learner's sessions grouped by skill — since there's no
 * curriculum/lesson model, "progress" here is a session count per skill,
 * plus the next scheduled session if one exists.
 */
export default function LearningProgress({ progress }) {
  if (!progress?.length) return null;

  return (
    <div className="sb-card p-4">
      <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-3">
        <GraduationCap size={16} className="text-brand-500" /> Currently learning
      </h2>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {progress.map((p) => {
          const inProgress = !!p.nextSessionAt;
          return (
            <div key={p.skillId} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-slate-800 text-sm truncate">{p.skillName}</p>
                <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  inProgress ? 'bg-brand-100 text-brand-700' : 'bg-slate-200 text-slate-500'
                }`}>
                  {inProgress ? 'In progress' : 'No session scheduled'}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <User size={11} />
                {p.teacher
                  ? <span>with <span className="font-medium text-slate-600">{p.teacher.name}</span></span>
                  : <span className="italic">Teacher unavailable</span>}
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                <span className="text-slate-500">
                  {p.completedCount} of {p.totalCount} session{p.totalCount === 1 ? '' : 's'} completed
                </span>
                {inProgress && (
                  <span className="flex items-center gap-1 text-brand-600 font-medium">
                    <Calendar size={11} />
                    {isToday(new Date(p.nextSessionAt)) ? 'Today' : format(new Date(p.nextSessionAt), 'MMM d')}
                  </span>
                )}
              </div>

              {/* Simple visual progress bar based on sessions completed vs total booked so far */}
              <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-brand-500 rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.round((p.completedCount / Math.max(p.totalCount, 1)) * 100))}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
