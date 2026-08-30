'use client';
import { useState } from 'react';
import { Calendar, Clock, Video, MessageCircle, CheckCircle2, XCircle, User, Star, Check, X as XIcon, Paperclip } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import Badge from '../shared/Badge';
import MaterialsModal from '../shared/MaterialsModal';

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   color: 'amber' },
  confirmed: { label: 'Confirmed', color: 'blue'  },
  completed: { label: 'Completed', color: 'green' },
  cancelled: { label: 'Cancelled', color: 'red'   },
};

export default function SessionCard({ session, onOpenChat, onJoinVideo, onAccept, onDecline, onComplete, onCancel, onRate }) {
  const { otherUser, role, title, scheduledAt, duration, status, meetingLink, hasVideoRoom, canRate } = session;
  const date = new Date(scheduledAt);
  const isUpcoming = !isPast(date) && (status === 'pending' || status === 'confirmed');
  const statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const [materialsOpen, setMaterialsOpen] = useState(false);

  const isTeacher = role === 'teacher';
  const awaitingTeacherAction = status === 'pending' && isTeacher;
  const awaitingLearnerResponse = status === 'pending' && !isTeacher;

  const canJoin = status === 'confirmed' && isUpcoming && (hasVideoRoom || meetingLink);
  // Materials (recordings/notes) only make sense once a session is real —
  // no point offering an upload slot for a request that's still pending.
  const showMaterials = status === 'confirmed' || status === 'completed';

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

      {/* Pending request awaiting teacher decision */}
      {awaitingTeacherAction && (
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => onAccept(session.id)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-bold text-white bg-success-500 rounded-lg hover:bg-success-600 transition-colors"
          >
            <Check size={14} /> Accept
          </button>
          <button
            onClick={() => onDecline(session.id)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-bold text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            <XIcon size={14} /> Decline
          </button>
        </div>
      )}

      {awaitingLearnerResponse && (
        <div className="rounded-lg bg-gold-50 border border-gold-100 px-3 py-2 text-xs text-gold-700 font-medium">
          Waiting for {otherUser?.name || 'the teacher'} to accept your request.
        </div>
      )}

      {/* Actions */}
      {!awaitingTeacherAction && (
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => onOpenChat(session)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <MessageCircle size={13} /> Chat
          </button>

          {canJoin && hasVideoRoom && (
            <button
              onClick={() => onJoinVideo(session)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-brand-600 bg-brand-50 rounded-lg hover:bg-brand-100 transition-colors"
            >
              <Video size={13} /> Join
            </button>
          )}

          {canJoin && !hasVideoRoom && meetingLink && (
            <a
              href={meetingLink} target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-brand-600 bg-brand-50 rounded-lg hover:bg-brand-100 transition-colors"
            >
              <Video size={13} /> Join
            </a>
          )}

          {showMaterials && (
            <button
              onClick={() => setMaterialsOpen(true)}
              aria-label="Session materials"
              title="Materials"
              className="p-2 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
            >
              <Paperclip size={16} />
            </button>
          )}

          {status === 'confirmed' && (
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

          {awaitingLearnerResponse && (
            <button
              onClick={() => onCancel(session.id)}
              className="px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Withdraw
            </button>
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
      )}

      <MaterialsModal
        open={materialsOpen}
        onClose={() => setMaterialsOpen(false)}
        parentType="session"
        parentId={session.id}
        canUpload
        title={`Materials — ${title}`}
      />
    </div>
  );
}