'use client';
import { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, ShieldAlert, ExternalLink, Loader2, CheckCircle2, XCircle, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const STATUS_TABS = ['under_review', 'approved', 'rejected'];
const STATUS_LABELS = { under_review: 'Pending Review', approved: 'Approved', rejected: 'Rejected' };
const STATUS_COLOR  = { under_review: 'text-amber-600 bg-amber-50 border-amber-100', approved: 'text-emerald-600 bg-emerald-50 border-emerald-100', rejected: 'text-red-500 bg-red-50 border-red-100' };

function VerificationRow({ v, onReviewed }) {
  const [expanded,  setExpanded]  = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const [saving,    setSaving]    = useState(false);

  const review = async (decision) => {
    setSaving(true);
    try {
      await api.patch(`/verification/admin/${v._id}/review`, { decision, adminNote });
      toast.success(`Skill ${decision}!`);
      onReviewed();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Review failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="sb-card overflow-hidden">
      {/* Summary row */}
      <div
        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center shrink-0 text-sm font-bold text-brand-600">
          {v.userName?.[0]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800">{v.skillName}</p>
          <p className="text-xs text-slate-400">{v.userName} · submitted {format(new Date(v.updatedAt), 'MMM d, yyyy')}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Step indicators */}
          {['quiz','evidence','endorsement'].map(step => (
            <span key={step} className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
              v.stepsCompleted[step] ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'
            }`}>{step}</span>
          ))}
          {expanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-slate-100 p-5 space-y-5">

          {/* Quiz answers */}
          {v.quizAnswers?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-bold">1</span>
                Quiz Answers
              </h3>
              <div className="space-y-3">
                {v.quizAnswers.map((qa, i) => (
                  <div key={i} className="bg-slate-50 rounded-xl p-3">
                    <p className="text-xs font-semibold text-slate-600 mb-1">Q: {qa.question}</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{qa.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evidence */}
          {v.evidenceUrl && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-bold">2</span>
                Evidence
              </h3>
              <a href={v.evidenceUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-brand-600 hover:underline">
                <ExternalLink size={13} /> {v.evidenceUrl}
              </a>
              {v.evidenceNote && <p className="text-sm text-slate-500 mt-1">{v.evidenceNote}</p>}
            </div>
          )}

          {/* Endorsements */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-bold">3</span>
              Peer Endorsements ({v.endorsements?.length ?? 0})
            </h3>
            {v.endorsements?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {v.endorsements.map((e, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 bg-violet-50 text-violet-700 rounded-full border border-violet-100">
                    {e.endorserName}
                  </span>
                ))}
              </div>
            ) : <p className="text-xs text-slate-400">No endorsements yet.</p>}
          </div>

          {/* Admin review */}
          {v.status === 'under_review' && (
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <div>
                <label className="sb-label">Feedback for user <span className="text-slate-400 font-normal">(optional)</span></label>
                <textarea
                  value={adminNote}
                  onChange={e => setAdminNote(e.target.value)}
                  className="sb-input resize-none"
                  rows={2}
                  placeholder="Explain your decision — especially for rejections…"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => review('approved')}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-colors disabled:opacity-50"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  Approve
                </button>
                <button
                  onClick={() => review('rejected')}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors disabled:opacity-50"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                  Reject
                </button>
              </div>
            </div>
          )}

          {/* Already reviewed */}
          {v.status !== 'under_review' && (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium ${STATUS_COLOR[v.status]}`}>
              {v.status === 'approved' ? <ShieldCheck size={14} /> : <XCircle size={14} />}
              {STATUS_LABELS[v.status]}
              {v.adminNote && <span className="font-normal">— {v.adminNote}</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  const { user } = useAuth();
  const [tab,             setTab]             = useState('under_review');
  const [verifications,   setVerifications]   = useState([]);
  const [loading,         setLoading]         = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/verification/admin/all?status=${tab}`);
      setVerifications(res.data.verifications);
    } catch (err) {
      if (err.response?.status === 403) {
        toast.error('Admin access required.');
      } else {
        toast.error('Failed to load verifications.');
      }
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  if (!user?.isAdmin) {
    return (
      <div className="sb-card p-12 flex flex-col items-center text-center text-slate-400">
        <ShieldAlert size={36} className="mb-3 text-slate-200" />
        <p className="font-semibold text-slate-600">Admin access required</p>
        <p className="text-sm mt-1">This page is only accessible to platform administrators.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <ShieldCheck size={22} className="text-brand-500" /> Skill Verification Dashboard
        </h1>
        <p className="text-slate-500 mt-1 text-sm">Review and approve skill verification submissions.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {STATUS_TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t ? 'text-brand-600 border-brand-600' : 'text-slate-400 border-transparent hover:text-slate-600'
            }`}>
            {STATUS_LABELS[t]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={28} className="animate-spin text-brand-500" /></div>
      ) : verifications.length === 0 ? (
        <div className="sb-card p-10 text-center text-slate-400">
          <ShieldCheck size={28} className="mb-2 mx-auto text-slate-200" />
          <p className="text-sm font-medium text-slate-500">No {STATUS_LABELS[tab].toLowerCase()} submissions</p>
        </div>
      ) : (
        <div className="space-y-3">
          {verifications.map(v => (
            <VerificationRow key={v._id} v={v} onReviewed={load} />
          ))}
        </div>
      )}
    </div>
  );
}
