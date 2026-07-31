'use client';
import { useState } from 'react';
import { Star, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../shared/Modal';
import { sessionsAPI } from '../../services/api';

export default function RateSessionModal({ open, onClose, session, onRated }) {
  const [score, setScore]     = useState(0);
  const [hover, setHover]     = useState(0);
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving]   = useState(false);

  const submit = async () => {
    if (!score) return toast.error('Please select a star rating.');
    setSaving(true);
    try {
      await sessionsAPI.rate(session.id, { score, feedback: feedback.trim() || undefined });
      toast.success('Thanks for your feedback!');
      onRated();
      onClose();
      setScore(0); setFeedback('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit rating.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Rate this session">
      <div className="text-center mb-5">
        <p className="text-sm text-slate-500">How was your session with</p>
        <p className="font-semibold text-slate-800">{session?.otherUser?.name}</p>
      </div>

      <div className="flex justify-center gap-1.5 mb-5">
        {[1,2,3,4,5].map(i => (
          <button
            key={i}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setScore(i)}
          >
            <Star
              size={32}
              className={i <= (hover || score) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}
            />
          </button>
        ))}
      </div>

      <textarea
        value={feedback}
        onChange={e => setFeedback(e.target.value)}
        className="sb-input resize-none"
        rows={3}
        placeholder="Optional feedback for the community…"
        maxLength={300}
      />

      <div className="flex justify-end gap-2 pt-4">
        <button onClick={onClose} className="sb-btn-ghost">Skip</button>
        <button onClick={submit} disabled={saving} className="sb-btn-primary flex items-center gap-2">
          {saving && <Loader2 size={14} className="animate-spin" />}
          Submit rating
        </button>
      </div>
    </Modal>
  );
}
