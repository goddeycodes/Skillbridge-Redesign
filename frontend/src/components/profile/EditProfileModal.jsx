'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../shared/Modal';
import { usersAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const schema = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters'),
  bio:      z.string().max(300, 'Bio must be under 300 characters').optional().or(z.literal('')),
  avatar:   z.string().url('Must be a valid URL').optional().or(z.literal('')),
  timezone: z.string(),
});

const TIMEZONES = [
  'UTC', 'Africa/Accra', 'Africa/Lagos', 'Africa/Nairobi',
  'Europe/London', 'Europe/Paris', 'America/New_York',
  'America/Chicago', 'America/Los_Angeles', 'Asia/Dubai',
  'Asia/Kolkata', 'Asia/Tokyo', 'Australia/Sydney',
];

export default function EditProfileModal({ open, onClose, user }) {
  const { refreshUser } = useAuth();
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name:     user?.name     || '',
      bio:      user?.bio      || '',
      avatar:   user?.avatar   || '',
      timezone: user?.timezone || 'UTC',
    },
  });

  const bio = watch('bio', '');

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      await usersAPI.updateMe(data);
      await refreshUser();
      toast.success('Profile updated!');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit profile">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        {/* Name */}
        <div>
          <label className="sb-label">Display name</label>
          <input {...register('name')} className="sb-input" placeholder="Your full name" />
          {errors.name && <p className="sb-error">{errors.name.message}</p>}
        </div>

        {/* Bio */}
        <div>
          <label className="sb-label">Bio <span className="text-slate-400 font-normal">(optional)</span></label>
          <textarea
            {...register('bio')}
            className="sb-input resize-none"
            rows={3}
            placeholder="Tell the community what you're about…"
          />
          <div className="flex justify-between mt-0.5">
            {errors.bio ? <p className="sb-error">{errors.bio.message}</p> : <span />}
            <p className="text-xs text-slate-400">{bio?.length ?? 0}/300</p>
          </div>
        </div>

        {/* Avatar URL */}
        <div>
          <label className="sb-label">Avatar URL <span className="text-slate-400 font-normal">(optional)</span></label>
          <input {...register('avatar')} className="sb-input" placeholder="https://example.com/photo.jpg" />
          {errors.avatar && <p className="sb-error">{errors.avatar.message}</p>}
        </div>

        {/* Timezone */}
        <div>
          <label className="sb-label">Timezone</label>
          <select {...register('timezone')} className="sb-input">
            {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
          </select>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="sb-btn-ghost">Cancel</button>
          <button type="submit" disabled={saving} className="sb-btn-primary flex items-center gap-2">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save changes
          </button>
        </div>
      </form>
    </Modal>
  );
}
