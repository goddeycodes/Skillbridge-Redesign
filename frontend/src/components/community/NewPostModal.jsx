'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../shared/Modal';
import { communityAPI } from '../../services/api';

const CATEGORIES = [
  'Technology', 'Design', 'Business', 'Language', 'Music',
  'Arts & Crafts', 'Cooking', 'Fitness', 'Academic', 'General',
];

const schema = z.object({
  title:    z.string().min(5, 'Title must be at least 5 characters').max(150, 'Too long'),
  content:  z.string().min(20, 'Content must be at least 20 characters').max(3000, 'Too long'),
  category: z.string().min(1, 'Pick a category'),
});

export default function NewPostModal({ open, onClose, onCreated }) {
  const [saving,    setSaving]    = useState(false);
  const [tagInput,  setTagInput]  = useState('');
  const [tags,      setTags]      = useState([]);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { title: '', content: '', category: '' },
  });

  const content = watch('content', '');

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !tags.includes(t) && tags.length < 5) {
      setTags(prev => [...prev, t]);
      setTagInput('');
    }
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const res = await communityAPI.createPost({ ...data, tags });
      toast.success('Post published!');
      onCreated(res.data.post);
      reset();
      setTags([]);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to publish post.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Start a discussion" maxWidth="max-w-xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="sb-label">Category</label>
          <select {...register('category')} className="sb-input">
            <option value="">Select a category…</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.category && <p className="sb-error">{errors.category.message}</p>}
        </div>

        <div>
          <label className="sb-label">Title</label>
          <input {...register('title')} className="sb-input"
            placeholder="What do you want to discuss?" />
          {errors.title && <p className="sb-error">{errors.title.message}</p>}
        </div>

        <div>
          <label className="sb-label">Content</label>
          <textarea {...register('content')} className="sb-input resize-none" rows={5}
            placeholder="Share your thoughts, tips, questions or resources…" />
          <div className="flex justify-between mt-0.5">
            {errors.content
              ? <p className="sb-error">{errors.content.message}</p>
              : <span />}
            <p className="text-xs text-slate-400">{content.length}/3000</p>
          </div>
        </div>

        <div>
          <label className="sb-label">Tags <span className="text-slate-400 font-normal">(up to 5)</span></label>
          <div className="flex gap-2">
            <input
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
              className="sb-input flex-1"
              placeholder="e.g. python, beginner, tips…"
            />
            <button type="button" onClick={addTag}
              className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors">
              <Plus size={15} />
            </button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tags.map(t => (
                <span key={t}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 bg-brand-50 text-brand-700 rounded-full border border-brand-100">
                  #{t}
                  <button type="button" onClick={() => setTags(prev => prev.filter(x => x !== t))}>
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="sb-btn-ghost">Cancel</button>
          <button type="submit" disabled={saving} className="sb-btn-primary flex items-center gap-2">
            {saving && <Loader2 size={14} className="animate-spin" />}
            Publish post
          </button>
        </div>
      </form>
    </Modal>
  );
}
