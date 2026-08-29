'use client';
import { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, Circle, ShieldCheck, Link2, FileQuestion, Users, AlertCircle, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../shared/Modal';
import api from '../../services/api';

const STEPS = [
  { key: 'quiz',        label: 'Knowledge Quiz',     icon: FileQuestion, desc: 'Answer 5 questions about your skill' },
  { key: 'evidence',    label: 'Proof of Work',      icon: Link2,        desc: 'Share a portfolio, certificate, or project link' },
  { key: 'endorsement', label: 'Peer Endorsement',   icon: Users,        desc: 'Earned automatically after teaching sessions' },
];

// ── Step 1: Quiz ─────────────────────────────────────────────────────────────
function QuizStep({ verification, onDone }) {
  const [answers, setAnswers] = useState(
    verification.quizQuestions.map(q => ({ question: q, answer: '' }))
  );
  const [saving, setSaving] = useState(false);

  const allAnswered = answers.every(a => a.answer.trim().length >= 10);

  const submit = async () => {
    setSaving(true);
    try {
      await api.post(`/verification/${verification._id}/quiz`, { answers });
      toast.success('Quiz submitted!');
      onDone();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit quiz.');
    } finally {
      setSaving(false);
    }
  };

  if (verification.stepsCompleted.quiz) {
    return (
      <div className="flex flex-col items-center py-6 text-center gap-2">
        <CheckCircle2 size={36} className="text-emerald-500" />
        <p className="font-semibold text-slate-700">Quiz submitted!</p>
        <p className="text-sm text-slate-400">Your answers are awaiting admin review.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-500 bg-brand-50 border border-brand-100 rounded-xl p-3">
        Answer each question in at least one sentence. Be specific — the admin will read your answers carefully.
      </p>
      {verification.quizQuestions.map((q, i) => (
        <div key={i}>
          <label className="sb-label">Q{i + 1}. {q}</label>
          <textarea
            value={answers[i].answer}
            onChange={e => {
              const updated = [...answers];
              updated[i] = { ...updated[i], answer: e.target.value };
              setAnswers(updated);
            }}
            className="sb-input resize-none"
            rows={3}
            placeholder="Your answer…"
          />
          <p className="text-xs text-slate-400 mt-0.5">{answers[i].answer.length} chars (min 10)</p>
        </div>
      ))}
      <button
        onClick={submit}
        disabled={saving || !allAnswered}
        className="sb-btn-primary w-full flex items-center justify-center gap-2"
      >
        {saving && <Loader2 size={14} className="animate-spin" />}
        Submit quiz answers
      </button>
    </div>
  );
}

// ── Step 2: Evidence ─────────────────────────────────────────────────────────
function EvidenceStep({ verification, onDone }) {
  const [url,   setUrl]   = useState(verification.evidenceUrl || '');
  const [note,  setNote]  = useState(verification.evidenceNote || '');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!url.trim()) return toast.error('Please provide a URL.');
    setSaving(true);
    try {
      await api.post(`/verification/${verification._id}/evidence`, {
        evidenceUrl:  url.trim(),
        evidenceNote: note.trim(),
      });
      toast.success('Evidence submitted!');
      onDone();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit evidence.');
    } finally {
      setSaving(false);
    }
  };

  if (verification.stepsCompleted.evidence) {
    return (
      <div className="flex flex-col items-center py-6 text-center gap-2">
        <CheckCircle2 size={36} className="text-emerald-500" />
        <p className="font-semibold text-slate-700">Evidence submitted!</p>
        <a href={verification.evidenceUrl} target="_blank" rel="noopener noreferrer"
          className="text-xs text-brand-600 flex items-center gap-1 hover:underline">
          {verification.evidenceUrl} <ExternalLink size={11} />
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500 bg-brand-50 border border-brand-100 rounded-xl p-3">
        Provide a link that proves your skill — a GitHub repo, portfolio, certificate, LinkedIn, Behance, or any public project.
      </p>
      <div>
        <label className="sb-label">Evidence URL</label>
        <input
          value={url}
          onChange={e => setUrl(e.target.value)}
          className="sb-input"
          placeholder="https://github.com/you/project or https://yourportfolio.com"
          type="url"
        />
      </div>
      <div>
        <label className="sb-label">Description <span className="text-slate-400 font-normal">(optional)</span></label>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          className="sb-input resize-none"
          rows={2}
          maxLength={500}
          placeholder="Briefly explain what this link shows about your skill…"
        />
      </div>
      <button
        onClick={submit}
        disabled={saving || !url.trim()}
        className="sb-btn-primary w-full flex items-center justify-center gap-2"
      >
        {saving && <Loader2 size={14} className="animate-spin" />}
        Submit evidence
      </button>
    </div>
  );
}

// ── Step 3: Endorsement (informational only — earned automatically) ────────────
function EndorsementStep({ verification }) {
  const count = verification.endorsements?.length ?? 0;
  return (
    <div className="flex flex-col items-center py-6 text-center gap-3">
      <div className="w-14 h-14 rounded-full bg-violet-50 flex items-center justify-center">
        <Users size={26} className="text-violet-500" />
      </div>
      <p className="font-semibold text-slate-700">
        {count} peer endorsement{count !== 1 ? 's' : ''} so far
      </p>
      <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
        After each completed teaching session, your learner can endorse this skill.
        Endorsements are collected automatically — no action needed from you.
      </p>
      {count > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mt-1">
          {verification.endorsements.slice(0, 5).map((e, i) => (
            <span key={i} className="text-xs px-3 py-1 bg-violet-50 text-violet-700 rounded-full border border-violet-100">
              {e.endorserName}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main modal ────────────────────────────────────────────────────────────────
export default function VerificationModal({ open, onClose, skill, onVerified }) {
  const [verification, setVerification] = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [activeStep,   setActiveStep]   = useState('quiz');

  useEffect(() => {
    if (!open || !skill?._id) return;
    setLoading(true);

    api.post(`/verification/start/${skill._id}`)
      .then(res => {
        setVerification(res.data.verification);
        // Auto-select first incomplete step
        const v = res.data.verification;
        if (!v.stepsCompleted.quiz)     setActiveStep('quiz');
        else if (!v.stepsCompleted.evidence) setActiveStep('evidence');
        else setActiveStep('endorsement');
      })
      .catch(err => toast.error(err.response?.data?.message || 'Could not start verification.'))
      .finally(() => setLoading(false));
  }, [open, skill?._id]);

  const refresh = () => {
    api.get(`/verification/skill/${skill._id}`)
      .then(res => {
        const v = res.data.verification;
        setVerification(v);
        if (!v.stepsCompleted.quiz)          setActiveStep('quiz');
        else if (!v.stepsCompleted.evidence) setActiveStep('evidence');
        else                                  setActiveStep('endorsement');
        if (v.status === 'approved') onVerified?.();
      });
  };

  const STATUS_BANNER = {
    under_review: { color: 'bg-amber-50 border-amber-100 text-amber-700', icon: Loader2, text: 'Under admin review — we\'ll notify you once a decision is made.' },
    approved:     { color: 'bg-emerald-50 border-emerald-100 text-emerald-700', icon: CheckCircle2, text: 'Skill verified! ✅ You can now be booked as a teacher for this skill.' },
    rejected:     { color: 'bg-red-50 border-red-100 text-red-600', icon: AlertCircle, text: null },
  };

  return (
    <Modal open={open} onClose={onClose} title={`Verify — ${skill?.name}`} maxWidth="max-w-xl">
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={24} className="animate-spin text-brand-400" />
        </div>
      ) : !verification ? (
        <p className="text-center text-slate-400 py-8">Could not load verification.</p>
      ) : (
        <div className="space-y-5">

          {/* Status banner */}
          {verification.status !== 'pending' && (
            <div className={`flex items-start gap-2.5 p-3 rounded-xl border text-sm ${STATUS_BANNER[verification.status]?.color}`}>
              {verification.status === 'rejected' ? (
                <div>
                  <p className="font-medium">Submission rejected</p>
                  {verification.adminNote && <p className="mt-0.5 text-xs">{verification.adminNote}</p>}
                  <p className="mt-1 text-xs">Please resubmit with stronger evidence.</p>
                </div>
              ) : (
                <p>{STATUS_BANNER[verification.status]?.text}</p>
              )}
            </div>
          )}

          {/* Step indicators */}
          <div className="flex gap-2">
            {STEPS.map(({ key, label, icon: Icon }) => {
              const done    = verification.stepsCompleted[key];
              const active  = activeStep === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveStep(key)}
                  className={`flex-1 flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center ${
                    done    ? 'border-emerald-300 bg-emerald-50'  :
                    active  ? 'border-brand-500  bg-brand-50'     :
                              'border-slate-100  bg-white hover:border-slate-200'
                  }`}
                >
                  {done
                    ? <CheckCircle2 size={18} className="text-emerald-500" />
                    : <Icon size={18} className={active ? 'text-brand-600' : 'text-slate-400'} />}
                  <span className={`text-xs font-medium leading-tight ${
                    done ? 'text-emerald-600' : active ? 'text-brand-700' : 'text-slate-500'
                  }`}>{label}</span>
                </button>
              );
            })}
          </div>

          {/* Active step content */}
          <div className="pt-1">
            {activeStep === 'quiz'        && <QuizStep        verification={verification} onDone={refresh} />}
            {activeStep === 'evidence'    && <EvidenceStep    verification={verification} onDone={refresh} />}
            {activeStep === 'endorsement' && <EndorsementStep verification={verification} />}
          </div>
        </div>
      )}
    </Modal>
  );
}
