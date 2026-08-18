'use client';
import { useState } from 'react';
import { ArrowRightLeft, MapPin, Star, CheckCircle, Calendar, User, BookOpen, GraduationCap, ShieldAlert } from 'lucide-react';
import Badge from '../shared/Badge';
import MatchScoreRing from './MatchScoreRing';
import BookSessionModal from './BookSessionModal';

const PROFICIENCY_COLOR = { beginner: 'slate', intermediate: 'blue', advanced: 'amber', expert: 'green' };

export default function MatchCard({ match, highlightLearn }) {
  const [booking, setBooking] = useState(false);
  const {
    user, matchPercent,
    youTeach, youLearn, theyTeach, theyLearn,
    theyTeachCategory, theyTeachProf, theyTeachLang, theyTeachVerified,
  } = match;

  const canBook = theyTeachVerified !== false;

  const partnerInitial = user?.name?.[0] || '?';

  return (
    <>
      <div className="sb-card p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center overflow-hidden shrink-0">
              {user?.avatar
                ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                : <User size={20} className="text-brand-500" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="font-semibold text-slate-800 truncate">{user?.name}</p>
                {user?.isVerified && <CheckCircle size={13} className="text-brand-500 fill-brand-50 shrink-0" />}
              </div>
              <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Star size={11} className="text-gold-400 fill-gold-400" />
                  {user?.reputation?.toFixed(1) ?? '0.0'}
                </span>
                {user?.timezone && (
                  <span className="flex items-center gap-1">
                    <MapPin size={11} /> {user.timezone.split('/')[1]?.replace('_', ' ') || user.timezone}
                  </span>
                )}
              </div>
            </div>
          </div>
          <MatchScoreRing percent={matchPercent} />
        </div>

        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
          Mutual skill exchange
        </p>

        {/* What YOU receive and give */}
        <div className="rounded-xl border border-learn-100 bg-learn-50/60 p-3 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wide text-learn-700">Your side</p>
          <div className="flex items-start gap-2 text-sm">
            <BookOpen size={14} className="text-learn-600 mt-0.5 shrink-0" />
            <p className="text-slate-700">
              You <span className="font-semibold text-slate-900">learn</span>{' '}
              <span className={`font-bold ${highlightLearn === theyTeach ? 'text-learn-700' : 'text-slate-800'}`}>
                {theyTeach}
              </span>{' '}
              from {user?.name?.split(' ')[0] || 'them'}
            </p>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <GraduationCap size={14} className="text-brand-600 mt-0.5 shrink-0" />
            <p className="text-slate-700">
              You <span className="font-semibold text-slate-900">teach</span>{' '}
              <span className="font-bold text-slate-800">{youTeach}</span>{' '}
              to {user?.name?.split(' ')[0] || 'them'}
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-500">
            <ArrowRightLeft size={12} /> Knowledge exchange
          </div>
        </div>

        {/* What THEY receive and give */}
        <div className="rounded-xl border border-brand-100 bg-brand-50/60 p-3 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wide text-brand-700">
            {user?.name?.split(' ')[0] || 'Partner'}&apos;s side
          </p>
          <div className="flex items-start gap-2 text-sm">
            <BookOpen size={14} className="text-learn-600 mt-0.5 shrink-0" />
            <p className="text-slate-700">
              {partnerInitial} <span className="font-semibold text-slate-900">learns</span>{' '}
              <span className="font-bold text-slate-800">{youTeach}</span> from you
            </p>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <GraduationCap size={14} className="text-brand-600 mt-0.5 shrink-0" />
            <p className="text-slate-700">
              {partnerInitial} <span className="font-semibold text-slate-900">teaches</span>{' '}
              <span className={`font-bold ${highlightLearn === theyTeach ? 'text-brand-700' : 'text-slate-800'}`}>
                {theyTeach}
              </span>{' '}
              to you
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {theyTeachCategory && <Badge label={theyTeachCategory} color="slate" />}
          {theyTeachProf && <Badge label={theyTeachProf} color={PROFICIENCY_COLOR[theyTeachProf] || 'slate'} />}
          {theyTeachLang && theyTeachLang !== 'English' && <Badge label={theyTeachLang} color="amber" />}
          {theyTeachVerified
            ? <Badge label="Verified skill" color="green" />
            : <Badge label="Not verified" color="amber" />}
        </div>

        {!canBook && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 flex items-start gap-2">
            <ShieldAlert size={13} className="shrink-0 mt-0.5" />
            This skill isn&apos;t verified yet — session booking opens after the teacher completes verification.
          </p>
        )}

        <button
          onClick={() => setBooking(true)}
          disabled={!canBook}
          className="sb-btn-primary w-full flex items-center justify-center gap-2 mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {canBook ? <Calendar size={14} /> : <ShieldAlert size={14} />}
          {canBook ? 'Request a session' : 'Verification required'}
        </button>
      </div>

      <BookSessionModal
        open={booking}
        onClose={() => setBooking(false)}
        match={match}
      />
    </>
  );
}
