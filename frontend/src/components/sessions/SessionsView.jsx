'use client';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { Loader2, Calendar, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { sessionsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import SessionCard from '../../components/sessions/SessionCard';
import ChatModal from '../../components/chat/ChatModal';
import RateSessionModal from '../../components/sessions/RateSessionModal';
import ConfirmModal from '../../components/shared/ConfirmModal';

const TABS = [
  { key: 'upcoming',  label: 'Upcoming'  },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

// Actions that need a confirmation dialog before firing. Accept doesn't —
// accepting a request is a low-risk, easily-reversible-by-cancelling action,
// and forcing a confirm click on every single incoming request adds friction
// to what should be the fast path for a teacher.
const CONFIRM_REQUIRED = new Set(['decline', 'complete', 'cancel']);

function SessionsPageInner() {
  const { refreshUser } = useAuth();
  const searchParams = useSearchParams();
  // ?role=teacher -> "Teaching Sessions" nav link, ?role=learner -> "My Learning".
  // No param -> both, same as before this fix.
  const role = searchParams.get('role'); // 'teacher' | 'learner' | null

  const [activeTab, setActiveTab] = useState('upcoming');
  const [sessions,  setSessions]  = useState([]);
  const [loading,   setLoading]   = useState(true);

  const [chatSession, setChatSession] = useState(null);
  const [rateSession, setRateSession] = useState(null);

  const [pendingAction, setPendingAction] = useState(null); // { id, intent }
  const [actionLoading, setActionLoading] = useState(false);

  const loadSessions = useCallback(async (tab) => {
    setLoading(true);
    try {
      const params = { status: tab };
      if (role) params.role = role;
      const res = await sessionsAPI.getAll(params);
      setSessions(res.data.sessions);
    } catch {
      toast.error('Failed to load sessions.');
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => { loadSessions(activeTab); }, [activeTab, loadSessions]);

  const requestAction = (id, intent) => {
    if (CONFIRM_REQUIRED.has(intent)) {
      setPendingAction({ id, intent });
    } else {
      runAction(id, intent);
    }
  };

  const runAction = async (id, intent) => {
    setActionLoading(true);
    try {
      const actionMap = {
        accept:   () => sessionsAPI.accept(id),
        decline:  () => sessionsAPI.decline(id),
        complete: () => sessionsAPI.complete(id),
        cancel:   () => sessionsAPI.cancel(id),
      };
      await actionMap[intent]();

      const successMessages = {
        accept:   'Session accepted!',
        decline:  'Request declined, credit refunded to the learner.',
        complete: 'Session marked complete!',
        cancel:   'Session cancelled, credit refunded.',
      };
      toast.success(successMessages[intent]);

      loadSessions(activeTab);
      refreshUser();
      setPendingAction(null);
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${intent} session.`);
    } finally {
      setActionLoading(false);
    }
  };

  const runPendingAction = () => {
    if (!pendingAction) return;
    runAction(pendingAction.id, pendingAction.intent);
  };

  const CONFIRM_COPY = {
    decline:  { title: 'Decline this request?',    description: "The learner's credit will be refunded. This can't be undone.", confirmLabel: 'Decline request', danger: true },
    complete: { title: 'Mark session complete?',    description: "This releases the credit to the teacher. This can't be undone.", confirmLabel: 'Mark complete', danger: false },
    cancel:   { title: 'Cancel this session?',      description: "The credit will be refunded. This can't be undone.", confirmLabel: 'Cancel session', danger: true },
  };
  const confirmCopy = pendingAction ? CONFIRM_COPY[pendingAction.intent] : null;

  const heading = role === 'teacher' ? 'Teaching Sessions' : role === 'learner' ? 'My Learning' : 'Learning Sessions';
  const subheading = role === 'teacher'
    ? 'Requests to teach, and sessions you already have on the books.'
    : role === 'learner'
      ? 'Sessions you booked to learn from someone else.'
      : 'Learn together with focused sessions, clear goals, and a simple schedule.';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Calendar size={22} className="text-brand-500" /> {heading}
        </h1>
        <p className="text-slate-500 mt-1 text-sm">{subheading}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === t.key
                ? 'text-brand-600 border-brand-600'
                : 'text-slate-400 border-transparent hover:text-slate-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-500" size={28} /></div>
      ) : sessions.length === 0 ? (
        <div className="sb-card p-10 flex flex-col items-center text-center text-slate-400">
          <Calendar size={32} className="mb-3 text-slate-200" />
          <p className="font-medium text-slate-600">No {activeTab} sessions</p>
          <p className="text-sm mt-1">
            {activeTab === 'upcoming' ? 'Book a session after finding a match.' : `You have no ${activeTab} sessions yet.`}
          </p>
          {activeTab === 'upcoming' && (
            <Link href="/matching" className="mt-4 px-4 py-2 text-sm font-semibold text-brand-600 bg-brand-50 rounded-lg hover:bg-brand-100 transition-colors flex items-center gap-1.5">
              <Sparkles size={14} /> Find a match
            </Link>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {sessions.map(s => (
            <SessionCard
              key={s.id}
              session={s}
              onOpenChat={setChatSession}
              onAccept={(id) => requestAction(id, 'accept')}
              onDecline={(id) => requestAction(id, 'decline')}
              onComplete={(id) => requestAction(id, 'complete')}
              onCancel={(id) => requestAction(id, 'cancel')}
              onRate={setRateSession}
            />
          ))}
        </div>
      )}

      <ChatModal open={!!chatSession} onClose={() => setChatSession(null)} session={chatSession} />
      <RateSessionModal
        open={!!rateSession}
        onClose={() => setRateSession(null)}
        session={rateSession}
        onRated={() => loadSessions(activeTab)}
      />

      {confirmCopy && (
        <ConfirmModal
          open={!!pendingAction}
          onClose={() => setPendingAction(null)}
          onConfirm={runPendingAction}
          loading={actionLoading}
          danger={confirmCopy.danger}
          title={confirmCopy.title}
          description={confirmCopy.description}
          confirmLabel={confirmCopy.confirmLabel}
        />
      )}
    </div>
  );
}

export default function SessionsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-500" size={28} /></div>}>
      <SessionsPageInner />
    </Suspense>
  );
}