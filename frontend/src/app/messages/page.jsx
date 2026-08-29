'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { MessageCircle, Search, ArrowRight, UsersRound, CalendarDays } from 'lucide-react';
import { sessionsAPI } from '../../services/api';
import ChatModal from '../../components/chat/ChatModal';

function findSessionForDeepLink(sessions, { userId, roomId }) {
  if (userId) {
    const byUser = sessions.find(s => s.otherUser?.id === userId);
    if (byUser) return byUser;
  }
  if (roomId) {
    const byRoom = sessions.find(s => s.roomId === roomId);
    if (byRoom) return byRoom;
    // Legacy room IDs used '-' between UUIDs; match by participant IDs
    const byLegacy = sessions.find(s =>
      s.roomId?.includes(userId || '') ||
      (roomId.includes('::')
        ? false
        : s.otherUser?.id && roomId.includes(s.otherUser.id))
    );
    if (byLegacy) return byLegacy;
  }
  return null;
}

function MessagesPageInner() {
  const searchParams = useSearchParams();
  const [sessions, setSessions] = useState([]);
  const [chat,     setChat]     = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [query,    setQuery]    = useState('');

  const openFromParams = useCallback((all) => {
    const userParam = searchParams.get('user');
    const roomParam = searchParams.get('room');
    if (!userParam && !roomParam) return;

    const target = findSessionForDeepLink(all, {
      userId: userParam,
      roomId: roomParam,
    });
    if (target) setChat(target);
  }, [searchParams]);

  useEffect(() => {
    sessionsAPI.getAll({ status: 'all' })
      .then(r => {
        const all = r.data.sessions || [];
        setSessions(all);
        openFromParams(all);
      })
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, [openFromParams]);

  // Re-open chat when notification link params change while page is mounted
  useEffect(() => {
    if (!sessions.length) return;
    openFromParams(sessions);
  }, [searchParams, sessions, openFromParams]);

  const filtered = sessions.filter(s => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      s.title?.toLowerCase().includes(q) ||
      s.otherUser?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8">

      <section>
        <span className="eyebrow"><MessageCircle size={14} /> CONNECT</span>
        <h1 className="font-display mt-2 text-3xl font-extrabold tracking-tight">Messages</h1>
        <p className="mt-2 text-sm text-slate-500">
          Keep your learning conversations connected to the people and sessions that matter.
        </p>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">

        <section className="sb-card overflow-hidden">
          <div className="border-b border-slate-100 p-5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                className="sb-input pl-9"
                placeholder="Search conversations..."
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm text-slate-400">
              Loading conversations...
            </div>
          ) : filtered.length ? (
            <div className="divide-y divide-slate-100">
              {filtered.map(s => (
                <button
                  key={s.id}
                  onClick={() => setChat(s)}
                  className={`flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-slate-50
                    ${chat?.id === s.id ? 'bg-brand-50 border-l-2 border-brand-500' : ''}`}
                >
                  <div className="relative shrink-0">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-brand-600 overflow-hidden">
                      {s.otherUser?.avatar
                        ? <img src={s.otherUser.avatar} alt="" className="h-full w-full object-cover" />
                        : <MessageCircle size={19} />}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">
                      {s.title || 'Skill exchange conversation'}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {s.otherUser?.name
                        ? `${s.role === 'teacher' ? 'Teaching' : 'Learning from'} ${s.otherUser.name}`
                        : 'Continue the conversation around your learning session.'}
                    </p>
                  </div>

                  <ArrowRight size={15} className="shrink-0 text-slate-300" />
                </button>
              ))}
            </div>
          ) : query ? (
            <div className="p-10 text-center text-sm text-slate-400">
              No conversations match &ldquo;{query}&rdquo;
            </div>
          ) : (
            <div className="p-10 text-center">
              <MessageCircle className="mx-auto text-slate-300" size={28} />
              <p className="mt-2 font-bold">Your conversations live around sessions</p>
              <p className="mt-1 text-sm text-slate-500">
                Book a learning session to start a focused conversation with your exchange partner.
              </p>
            </div>
          )}
        </section>

        <aside className="rounded-2xl border border-brand-100 bg-brand-50 p-6">
          <div className="rounded-xl bg-white p-3 inline-flex text-brand-600">
            <UsersRound size={20} />
          </div>
          <h2 className="mt-4 text-lg font-extrabold">Learn together, not alone.</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Use messages to agree on goals, share resources, prepare for sessions,
            and keep the learning relationship going.
          </p>
          <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-slate-500">
            <CalendarDays size={14} /> Conversations are linked to your sessions
          </div>
        </aside>
      </div>

      <ChatModal open={!!chat} onClose={() => setChat(null)} session={chat} />
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-sm text-slate-400">Loading messages…</div>}>
      <MessagesPageInner />
    </Suspense>
  );
}
