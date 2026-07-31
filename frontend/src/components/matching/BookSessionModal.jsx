'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Calendar, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../shared/Modal';
import { sessionsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const schema = z.object({
  scheduledAt: z.string().min(1, 'Pick a date & time'),
  duration:    z.coerce.number().min(15, 'Minimum 15 minutes').max(180, 'Max 180 minutes'),
  meetingLink: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  notes:       z.string().max(300, 'Max 300 characters').optional().or(z.literal('')),
});

// Get min datetime string (now + 1 hour) for the input
const minDateTime = () => {
  const d = new Date(Date.now() + 60 * 60 * 1000);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

export default function BookSessionModal({ open, onClose, match }) {
  const { user, refreshUser } = useAuth();
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { scheduledAt: '', duration: 60, meetingLink: '', notes: '' },
  });

  const insufficientCredits = (user?.credits ?? 0) < 1;

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      await sessionsAPI.book({
        teacherId:   match.candidateId,
        skillId:     match.theyTeachId,
        title:       `${match.theyTeach} — with ${match.user?.name}`,
        scheduledAt: new Date(data.scheduledAt).toISOString(),
        duration:    data.duration,
        meetingLink: data.meetingLink || undefined,
        notes:       data.notes || undefined,
      });
      await refreshUser(); // credits just changed
      toast.success('Session booked! Check your Sessions tab.');
      reset();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to book session.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Book a session">
      <div className="mb-4 p-3 rounded-xl bg-brand-50 border border-brand-100 text-sm">
        <p className="text-slate-700">
          Learning <span className="font-semibold">{match?.theyTeach}</span> from{' '}
          <span className="font-semibold">{match?.user?.name}</span>
        </p>
      </div>

      {insufficientCredits && (
        <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-100 text-sm text-amber-700 flex items-center gap-2">
          <Zap size={14} /> You need at least 1 credit to book a session.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="sb-label">Date & time</label>
          <input
            type="datetime-local"
            min={minDateTime()}
            {...register('scheduledAt')}
            className="sb-input"
          />
          {errors.scheduledAt && <p className="sb-error">{errors.scheduledAt.message}</p>}
        </div>

        <div>
          <label className="sb-label">Duration (minutes)</label>
          <select {...register('duration')} className="sb-input">
            {[30, 45, 60, 90, 120].map(d => <option key={d} value={d}>{d} minutes</option>)}
          </select>
          {errors.duration && <p className="sb-error">{errors.duration.message}</p>}
        </div>

        <div>
          <label className="sb-label">Meeting link <span className="text-slate-400 font-normal">(optional)</span></label>
          <input {...register('meetingLink')} className="sb-input" placeholder="https://meet.google.com/…" />
          {errors.meetingLink && <p className="sb-error">{errors.meetingLink.message}</p>}
        </div>

        <div>
          <label className="sb-label">Notes for your teacher <span className="text-slate-400 font-normal">(optional)</span></label>
          <textarea {...register('notes')} className="sb-input resize-none" rows={2}
            placeholder="What would you like to focus on?" />
          {errors.notes && <p className="sb-error">{errors.notes.message}</p>}
        </div>

        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <Zap size={12} className="text-amber-500" /> Costs 1 credit
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="sb-btn-ghost">Cancel</button>
            <button type="submit" disabled={saving || insufficientCredits} className="sb-btn-primary flex items-center gap-2">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Calendar size={14} />}
              Confirm booking
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
