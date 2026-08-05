'use client';
import { useState } from 'react';
import { ArrowRightLeft, MapPin, Star, CheckCircle, Calendar } from 'lucide-react';
import Badge from '../shared/Badge';
import Avatar from '../shared/Avatar';
import MatchScoreRing from './MatchScoreRing';
import BookSessionModal from './BookSessionModal';

const PROFICIENCY_COLOR = { beginner: 'slate', intermediate: 'blue', advanced: 'amber', expert: 'green' };

export default function MatchCard({ match }) {
  const [booking, setBooking] = useState(false);
  const { user, matchPercent, youTeach, theyTeach, theyTeachCategory, theyTeachProf, theyTeachLang } = match;

  return (
    <>
      <div className="sb-card p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">

        {/* Header — avatar, name, score */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar user={user} size={48} bg="bg-brand-100" text="text-brand-500" />
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
                  <span className="flex items-center gap-1"><MapPin size={11} /> {user.timezone.split('/')[1]?.replace('_',' ') || user.timezone}</span>
                )}
              </div>
            </div>
          </div>
          <MatchScoreRing percent={matchPercent} />
        </div>

        {/* Exchange summary */}
        <div className="bg-slate-50 rounded-xl p-3.5 space-y-2.5">
          <div className="flex items-center gap-2.5 text-sm">
            <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
              <span className="text-[10px] font-bold text-brand-600">You</span>
            </div>
            <span className="text-slate-600">teach <span className="font-semibold text-slate-800">{youTeach}</span></span>
          </div>

          <div className="flex justify-center">
            <ArrowRightLeft size={14} className="text-slate-300" />
          </div>

          <div className="flex items-center gap-2.5 text-sm">
            <div className="w-6 h-6 rounded-full bg-learn-100 flex items-center justify-center shrink-0">
              <span className="text-[10px] font-bold text-learn-600">{user?.name?.[0] || '?'}</span>
            </div>
            <span className="text-slate-600">teaches <span className="font-semibold text-slate-800">{theyTeach}</span></span>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5">
          {theyTeachCategory && <Badge label={theyTeachCategory} color="slate" />}
          {theyTeachProf && <Badge label={theyTeachProf} color={PROFICIENCY_COLOR[theyTeachProf] || 'slate'} />}
          {theyTeachLang && theyTeachLang !== 'English' && <Badge label={theyTeachLang} color="amber" />}
        </div>

        {/* Action */}
        <button
          onClick={() => setBooking(true)}
          className="sb-btn-primary w-full flex items-center justify-center gap-2 mt-1"
        >
          <Calendar size={14} /> Book a session
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