'use client';
import { Calendar, Clock, Video, MessageCircle, CheckCircle2, XCircle, User, Star, Check, Hourglass } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import Badge from '../shared/Badge';

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   color: 'amber' },
  confirmed: { label: 'Confirmed', color: 'blue'  },
  completed: { label: 'Completed', color: 'green' },
  cancelled: { label: 'Cancelled', color: 'red'   },
};

export default function SessionCard({ session, onOpenChat, onAccept, onDecline, onComplete, onCancel, onRate }) {
  const { otherUser, role, title, scheduledAt, duration, status, meetingLink, canRate } = session;
  const date = new Date(scheduledAt);
  const isPending   = status === 'pending';
  const isConfirmed = status === 'confirmed';
  const statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

  return (
    <div className="sb-card p-4 flex flex-col gap-3">

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center overflow-hidden shrink-0">
            {otherUser?.avatar
              ? <img src={otherUser.avatar} alt={otherUser.name} className="w-full h-full object-cover" />
              : <User size={16} className="text-brand-500" />}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-800 truncate">{title}</p>
            <p className="text-xs text-slate-400">
              {role === 'teacher' ? 'Teaching' : 'Learning from'} <span className="font-medium text-slate-500">{otherUser?.name}</span>
            </p>
            {isPending && role === 'teacher' && (
              <p className="text-[11px] text-amber-600 font-medium mt-0.5 flex items-center gap-1">
                <Hourglass size={10} /> Waiting on your response
              </p>
            )}
            {isPending && role === 'learner' && (
              <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                <Hourglass size={10} /> Awaiting response from {otherUser?.name}
              </p>
            )}
          </div>
        </div>
        <Badge label={statusCfg.label} color={statusCfg.color} />
      </div>

      {/* Date/time/duration */}
      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <Calendar size={12} />
          {isToday(date) ? 'Today' : format(date, 'EEE, MMM d, yyyy')}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock size={12} /> {format(date, 'h:mm a')} · {duration}min
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => onOpenChat(session)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <MessageCircle size={13} /> Chat
        </button>

        {meetingLink && isConfirmed && !isPast(date) && (
          <a
            href={meetingLink} target="_blank" rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-brand-600 bg-brand-50 rounded-lg hover:bg-brand-100 transition-colors"
          >
            <Video size={13} /> Join
          </a>
        )}

        {isPending && role === 'teacher' ? (
          <>
            <button
              onClick={() => onAccept(session.id)}
              title="Accept request"
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-success-600 bg-success-50 rounded-lg hover:bg-success-100 transition-colors"
            >
              <Check size={14} /> Accept
            </button>
            <button
              onClick={() => onDecline(session.id)}
              title="Decline request"
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              <XCircle size={14} /> Decline
            </button>
          </>
        ) : isPending && role === 'learner' ? (
          <button
            onClick={() => onCancel(session.id)}
            title="Withdraw request"
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-500 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <XCircle size={14} /> Withdraw
          </button>
        ) : isConfirmed && (
          <>
            <button
              onClick={() => onComplete(session.id)}
              aria-label="Mark session complete"
              title="Mark complete"
              className="p-2 rounded-lg text-success-500 hover:bg-success-50 transition-colors"
            >
              <CheckCircle2 size={16} />
            </button>
            <button
              onClick={() => onCancel(session.id)}
              aria-label="Cancel session"
              title="Cancel"
              className="p-2 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
            >
              <XCircle size={16} />
            </button>
          </>
        )}

        {canRate && (
          <button
            onClick={() => onRate(session)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gold-600 bg-gold-50 rounded-lg hover:bg-gold-100 transition-colors"
          >
            <Star size={13} /> Rate
          </button>
        )}
      </div>
    </div>
  );
}