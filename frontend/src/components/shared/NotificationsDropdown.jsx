'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Check, Circle } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';

const TYPE_DOT_COLOR = {
  session_booked:     'bg-brand-500',
  session_requested:  'bg-amber-500',
  session_accepted:   'bg-success-500',
  session_declined:   'bg-red-400',
  session_completed:  'bg-success-500',
  session_cancelled:  'bg-red-400',
  new_rating:         'bg-gold-500',
  new_reply:          'bg-accent-500',
  new_community_post: 'bg-violet-500',
  new_message:        'bg-accent-500',
  credit_earned:      'bg-gold-500',
};

function timeAgo(dateStr) {
  const diffMs = Math.max(0, Date.now() - new Date(dateStr).getTime());
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export default function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const router = useRouter();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleClick = async (n) => {
    if (!n.read) await markAsRead(n._id);
    setOpen(false);
    if (n.link) router.push(n.link);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-accent-500 text-white text-[10px] font-semibold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-slate-100 shadow-lg text-sm max-h-96 overflow-y-auto z-50">
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 sticky top-0 bg-white">
            <p className="font-semibold text-slate-800">Notifications</p>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700"
              >
                <Check size={12} /> Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-slate-400">
              <Bell size={22} className="mx-auto mb-2 text-slate-300" />
              <p>No notifications yet.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <button
                key={n._id}
                onClick={() => handleClick(n)}
                className={`w-full text-left flex items-start gap-2 px-3 py-2.5 border-b border-slate-50 hover:bg-slate-50 transition-colors ${!n.read ? 'bg-brand-50/40' : ''}`}
              >
                <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${TYPE_DOT_COLOR[n.type] || 'bg-slate-300'}`} />
                <span className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 truncate">{n.title}</p>
                  {n.body && <p className="text-xs text-slate-500 line-clamp-2">{n.body}</p>}
                  <p className="text-[11px] text-slate-400 mt-0.5">{timeAgo(n.createdAt)}</p>
                </span>
                {!n.read && <Circle size={7} className="mt-1.5 fill-accent-500 text-accent-500 flex-shrink-0" />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
