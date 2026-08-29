'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { notificationsAPI } from '../services/api';

export function useNotifications() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [loading,       setLoading]       = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await notificationsAPI.getAll({ limit: 30 });
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch {
      // fail silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    let socket = null;
    let attempts = 0;

    const interval = setInterval(() => {
      socket = window.__sbSocket;
      attempts++;

      if (socket?.connected) {
        clearInterval(interval);

        const handler = (notif) => {
          setNotifications(prev => [notif, ...prev]);
          setUnreadCount(c => c + 1);

          toast(
            (t) => (
              <button
                type="button"
                className="text-left w-full"
                onClick={() => {
                  toast.dismiss(t.id);
                  if (notif.link) router.push(notif.link);
                }}
              >
                <p className="font-semibold text-sm">{notif.title}</p>
                {notif.body && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notif.body}</p>}
                {notif.link && <p className="text-[11px] text-brand-600 mt-1">Tap to open →</p>}
              </button>
            ),
            { duration: 6000, id: `notif-${notif._id}` }
          );
        };

        socket.on('notification', handler);
        socket.__notifCleanup = () => socket.off('notification', handler);
      }

      if (attempts > 20) clearInterval(interval);
    }, 500);

    return () => {
      clearInterval(interval);
      if (socket?.__notifCleanup) socket.__notifCleanup();
    };
  }, [router]);

  const markAsRead = useCallback(async (id) => {
    setNotifications(prev =>
      prev.map(n => n._id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(c => Math.max(0, c - 1));
    try { await notificationsAPI.markAsRead(id); } catch { /* silent */ }
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    try { await notificationsAPI.markAllAsRead(); } catch { /* silent */ }
  }, []);

  const dismiss = useCallback(async (id) => {
    const n = notifications.find(x => x._id === id);
    setNotifications(prev => prev.filter(x => x._id !== id));
    if (n && !n.read) setUnreadCount(c => Math.max(0, c - 1));
    try { await notificationsAPI.remove(id); } catch { /* silent */ }
  }, [notifications]);

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead, dismiss, reload: load };
}
