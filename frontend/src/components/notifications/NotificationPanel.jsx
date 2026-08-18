'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import {
  X, CheckCheck, Sparkles, Calendar, MessageCircle,
  Star, ShieldCheck, ShieldAlert, Zap, Users, BookOpen, Bell,
} from 'lucide-react';
import { notificationsAPI } from '../../services/api';
import { useSocket } from '../../hooks/useSocket';

const TYPE_CONFIG = {
  match_found:           { icon: Sparkles,      accent: 'bg-violet-500' },
  session_booked:        { icon: Calendar,      accent: 'bg-brand-500'  },
  session_reminder:      { icon: Calendar,      accent: 'bg-amber-500'  },
  session_completed:     { icon: CheckCheck,    accent: 'bg-emerald-500'},
  session_cancelled:     { icon: X,             accent: 'bg-red-400'    },
  new_reply:             { icon: MessageCircle, accent: 'bg-sky-500'    },
  new_message:           { icon: MessageCircle, accent: 'bg-sky-500'    },
  skill_endorsed:        { icon: Users,         accent: 'bg-violet-500' },
  verification_approved: { icon: ShieldCheck,   accent: 'bg-emerald-500'},
  verification_rejected: { icon: ShieldAlert,   accent: 'bg-amber-500'  },
  rating_received:       { icon: Star,          accent: 'bg-amber-500'  },
  credit_earned:         { icon: Zap,           accent: 'bg-amber-400'  },
  welcome:               { icon: BookOpen,      accent: 'bg-brand-600'  },
};

// ── Individual notification row ───────────────────────────────────────────────
function NotificationItem({ notification, onRead, onDismiss, onNavigate }) {
  const cfg  = TYPE_CONFIG[notification.type] || TYPE_CONFIG.welcome;
  const Icon = cfg.icon;
  const isNew = !notification.read;

  return (
    <div
      onClick={() => {
        if (isNew) onRead(notification._id);
        if (notification.link) onNavigate(notification.link);
      }}
      className={`relative flex items-start gap-3 px-4 py-3.5 cursor-pointer group transition-colors
        ${isNew ? 'bg-brand-50/60 hover:bg-brand-50' : 'hover:bg-slate-50'}`}
    >
      {isNew && (
        <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
      )}
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cfg.accent}`}>
        <Icon size={16} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug ${isNew ? 'font-semibold text-slate-800' : 'font-medium text-slate-700'}`}>
          {notification.title}
        </p>
        <p className="text-xs text-slate-500 mt-0.5 leading-snug">{notification.body}</p>
        <p className="text-xs text-slate-400 mt-1">
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </p>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDismiss(notification._id); }}
        className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-slate-200 text-slate-400 transition-all shrink-0 mt-0.5"
      >
        <X size={12} />
      </button>
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────
export default function NotificationPanel({ open, onClose }) {
  const router   = useRouter();
  const socket   = useSocket();
  const panelRef = useRef(null);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [loading,       setLoading]       = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationsAPI.getAll({ limit: 30 });
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    } catch { /* fail silently */ }
    finally   { setLoading(false); }
  }, []);

  // Load when panel opens
  useEffect(() => { if (open) load(); }, [open, load]);

  // Real-time push from Socket.io
  useEffect(() => {
    if (!socket) return;
    const handler = (notif) => {
      setNotifications(prev => [notif, ...prev]);
      setUnreadCount(c => c + 1);
    };
    socket.on('notification', handler);
    return () => socket.off('notification', handler);
  }, [socket]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  const handleRead = useCallback(async (id) => {
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    setUnreadCount(c => Math.max(0, c - 1));
    await notificationsAPI.markRead(id);
  }, []);

  const handleDismiss = useCallback(async (id) => {
    const n = notifications.find(x => x._id === id);
    setNotifications(prev => prev.filter(x => x._id !== id));
    if (n && !n.read) setUnreadCount(c => Math.max(0, c - 1));
    await notificationsAPI.dismiss(id);
  }, [notifications]);

  const handleMarkAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    await notificationsAPI.markAllRead();
  };

  const handleNavigate = (link) => {
    router.push(link);
    onClose();
  };

  return (
    <div
      ref={panelRef}
      className={`
        fixed right-4 top-[68px] z-50 w-80 sm:w-96 bg-white rounded-2xl
        shadow-xl border border-slate-100 transition-all duration-200 origin-top-right
        ${open ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-slate-800 text-sm">Notifications</h2>
          {unreadCount > 0 && (
            <span className="flex items-center justify-center min-w-[20px] h-5 rounded-full bg-brand-500 text-white text-xs font-bold px-1.5">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
            >
              <CheckCheck size={12} /> Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Notification list */}
      <div className="max-h-[480px] overflow-y-auto divide-y divide-slate-50">
        {loading ? (
          <div className="flex flex-col gap-3 p-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-start gap-3 animate-pulse">
                <div className="w-9 h-9 rounded-xl bg-slate-100 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-3/4 bg-slate-100 rounded" />
                  <div className="h-3 w-1/2 bg-slate-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
              <Bell size={20} className="text-slate-300" />
            </div>
            <p className="text-sm font-medium text-slate-600">You're all caught up</p>
            <p className="text-xs text-slate-400 mt-1">
              Matches, sessions, and messages will appear here.
            </p>
          </div>
        ) : (
          notifications.map(n => (
            <NotificationItem
              key={n._id}
              notification={n}
              onRead={handleRead}
              onDismiss={handleDismiss}
              onNavigate={handleNavigate}
            />
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-2.5 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400">Showing last 30 notifications</p>
        </div>
      )}
    </div>
  );
}

// ── Named export: used by Navbar for the bell badge count ─────────────────────
export function useUnreadCount() {
  const socket = useSocket();
  const [count, setCount] = useState(0);

  useEffect(() => {
    notificationsAPI.getAll({ limit: 1 })
      .then(res => setCount(res.data.unreadCount ?? 0))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handler = () => setCount(c => c + 1);
    socket.on('notification', handler);
    return () => socket.off('notification', handler);
  }, [socket]);

  const reset = () => setCount(0);
  return { count, reset };
}