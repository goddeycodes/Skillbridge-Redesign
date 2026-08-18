'use client';
import { useState, useEffect, useCallback } from 'react';
import { Loader2, Calendar, Sparkles } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { sessionsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import SessionCard from './SessionCard';
import LearningProgress from './LearningProgress';
import ChatModal from '../chat/ChatModal';
import RateSessionModal from './RateSessionModal';

const TABS = [
  { key: 'upcoming',  label: 'Upcoming'  },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

/**
 * Shared session list UI, scoped to a single role so "My Learning" only
 * shows sessions where the viewer is the learner, and "Teaching Sessions"
 * only shows sessions where the viewer is the teacher.
 */
export default function SessionsView({ role, title, subtitle, icon: Icon = Calendar }) {
  const { refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [sessions,  setSessions]  = useState([]);
  const [loading,   setLoading]   = useState(true);

  const [chatSession, setChatSession] = useState(null);
  const [rateSession, setRateSession] = useState(null);
  const [progress,    setProgress]    = useState([]);

  const loadSessions = useCallback(async (tab) => {
    setLoading(true);
    try {
      const res = await sessionsAPI.getAll({ status: tab, role });
      setSessions(res.data.sessions);
    } catch {
      toast.error('Failed to load sessions.');
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => { loadSessions(activeTab); }, [activeTab, loadSessions]);

  // "Currently learning" progress summary is only meaningful from the
  // learner's side — there's no equivalent concept for teaching.
  const refreshProgress = useCallback(() => {
    if (role !== 'learner') return;
    sessionsAPI.getProgress()
      .then(res => setProgress(res.data.progress))
      .catch(() => {}); // non-critical — just skip showing the panel
  }, [role]);

  useEffect(() => { refreshProgress(); }, [refreshProgress]);

  const handleAccept = async (id) => {
    try {
      await sessionsAPI.accept(id);
      toast.success('Request accepted — session confirmed!');
      loadSessions(activeTab);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept request.');
    }
  };

  const handleDecline = async (id) => {
    if (!confirm('Decline this session request? The credit will be refunded to the learner.')) return;
    try {
      await sessionsAPI.decline(id);
      toast.success('Request declined.');
      loadSessions(activeTab);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to decline request.');
    }
  };

  const handleComplete = async (id) => {
    if (!confirm('Mark this session as complete? This will release the credit to the teacher.')) return;
    try {
      await sessionsAPI.complete(id);
      toast.success('Session marked complete!');
      loadSessions(activeTab);
      refreshProgress();
      refreshUser();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete session.');
    }
  };

  const handleCancel = async (id) => {
    const msg = role === 'learner'
      ? 'Withdraw this request? Your credit will be refunded.'
      : 'Cancel this session? The credit will be refunded to the learner.';
    if (!confirm(msg)) return;
    try {
      await sessionsAPI.cancel(id);
      toast.success('Session cancelled, credit refunded.');
      loadSessions(activeTab);
      refreshProgress();
      refreshUser();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel session.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Icon size={22} className="text-brand-500" /> {title}
        </h1>
        <p className="text-slate-500 mt-1 text-sm">{subtitle}</p>
      </div>

      {role === 'learner' && <LearningProgress progress={progress} />}

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
          <Icon size={32} className="mb-3 text-slate-200" />
          <p className="font-medium text-slate-600">No {activeTab} sessions</p>
          <p className="text-sm mt-1">
            {activeTab === 'upcoming'
              ? (role === 'learner' ? 'Book a session after finding a match.' : 'Requests from learners will show up here.')
              : `You have no ${activeTab} sessions yet.`}
          </p>
          {activeTab === 'upcoming' && role === 'learner' && (
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
              onAccept={handleAccept}
              onDecline={handleDecline}
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
