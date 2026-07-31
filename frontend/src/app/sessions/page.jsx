'use client';
import { useState, useEffect, useCallback } from 'react';
import { Loader2, Calendar, Sparkles } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { sessionsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import SessionCard from '../../components/sessions/SessionCard';
import ChatModal from '../../components/chat/ChatModal';
import RateSessionModal from '../../components/sessions/RateSessionModal';

const TABS = [
  { key: 'upcoming',  label: 'Upcoming'  },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

export default function SessionsPage() {
  const { refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [sessions,  setSessions]  = useState([]);
  const [loading,   setLoading]   = useState(true);

  const [chatSession, setChatSession] = useState(null);
  const [rateSession, setRateSession] = useState(null);

  const loadSessions = useCallback(async (tab) => {
    setLoading(true);
    try {
      const res = await sessionsAPI.getAll({ status: tab });
      setSessions(res.data.sessions);
    } catch {
      toast.error('Failed to load sessions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSessions(activeTab); }, [activeTab, loadSessions]);

  const handleComplete = async (id) => {
    if (!confirm('Mark this session as complete? This will release the credit to the teacher.')) return;
    try {
      await sessionsAPI.complete(id);
      toast.success('Session marked complete!');
      loadSessions(activeTab);
      refreshUser();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete session.');
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancel this session? Your credit will be refunded.')) return;
    try {
      await sessionsAPI.cancel(id);
      toast.success('Session cancelled, credit refunded.');
      loadSessions(activeTab);
      refreshUser();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel session.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Calendar size={22} className="text-brand-500" /> Learning Sessions
        </h1>
        <p className="text-slate-500 mt-1 text-sm">Learn together with focused sessions, clear goals, and a simple schedule.</p>
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
              onComplete={handleComplete}
              onCancel={handleCancel}
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
    </div>
  );
}
