'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../shared/Modal';
import { skillsAPI } from '../../services/api';

const schema = z.object({
  name:        z.string().min(2, 'Skill name must be at least 2 characters').max(60, 'Too long'),
  description: z.string().max(300, 'Max 300 characters').optional().or(z.literal('')),
  category:    z.string().min(1, 'Pick a category'),
  type:        z.enum(['teach', 'learn'], { required_error: 'Choose teach or learn' }),
  proficiency: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
  format:      z.enum(['one-on-one', 'group', 'both']).default('one-on-one'),
  language:    z.string().default('English'),
});

// ← Hardcoded — no API call needed, categories never change at runtime
const CATEGORIES = [
  'Technology', 'Design', 'Business', 'Language', 'Music',
  'Arts & Crafts', 'Cooking', 'Fitness', 'Academic', 'Other',
];

const LANGUAGES = [
  'English', 'French', 'Spanish', 'Arabic', 'Mandarin',
  'Portuguese', 'Twi', 'Hausa', 'Swahili', 'Other',
];

export default function SkillFormModal({ open, onClose, onSaved, skill = null, defaultType = 'teach' }) {
  const isEditing = !!skill;
  const [saving,   setSaving]   = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [tags,     setTags]     = useState([]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '', description: '', category: '', type: 'teach',
      proficiency: 'beginner', format: 'one-on-one', language: 'English',
    },
  });

  useEffect(() => {
    if (skill) {
      reset({
        name:        skill.name,
        description: skill.description || '',
        category:    skill.category,
        type:        skill.type,
        proficiency: skill.proficiency || 'beginner',
        format:      skill.format || 'one-on-one',
        language:    skill.language || 'English',
      });
      setTags(skill.tags || []);
    } else {
      reset({
        name: '', description: '', category: '', type: defaultType,
        proficiency: 'beginner', format: 'one-on-one', language: 'English',
      });
      setTags([]);
    }
  }, [skill, reset, open, defaultType]);

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !tags.includes(t) && tags.length < 5) {
      setTags(prev => [...prev, t]);
      setTagInput('');
    }
  };

  const removeTag = (t) => setTags(prev => prev.filter(x => x !== t));

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const payload = { ...data, tags };
      if (isEditing) {
        await skillsAPI.update(skill._id, payload);
        toast.success('Skill updated!');
      } else {
        await skillsAPI.create(payload);
        toast.success('Skill added!');
      }
      // ← Call onSaved to update local state in parent — no full refetch
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save skill.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? 'Edit skill' : 'Add a skill'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        {/* Type toggle */}
        <div>
          <label className="sb-label">I want to…</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'teach', label: '🎓 Teach this skill', desc: 'Share your knowledge' },
              { value: 'learn', label: '📖 Learn this skill', desc: 'Find someone to teach me' },
            ].map(opt => (
              <label key={opt.value}
                className="relative flex flex-col gap-0.5 p-3 rounded-xl border-2 cursor-pointer transition-all has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50 border-slate-200">
                <input type="radio" value={opt.value} {...register('type')} className="sr-only" />
                <span className="font-semibold text-sm text-slate-800">{opt.label}</span>
                <span className="text-xs text-slate-500">{opt.desc}</span>
              </label>
            ))}
          </div>
          {errors.type && <p className="sb-error">{errors.type.message}</p>}
        </div>

        {/* Name */}
        <div>
          <label className="sb-label">Skill name</label>
          <input {...register('name')} className="sb-input"
            placeholder="e.g. Python Programming, Graphic Design…" />
          {errors.name && <p className="sb-error">{errors.name.message}</p>}
        </div>

        {/* Category */}
        <div>
          <label className="sb-label">Category</label>
          <select {...register('category')} className="sb-input">
            <option value="">Select a category…</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.category && <p className="sb-error">{errors.category.message}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="sb-label">
            Description <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <textarea {...register('description')} className="sb-input resize-none" rows={2}
            placeholder="What will you teach / what do you want to learn?" />
          {errors.description && <p className="sb-error">{errors.description.message}</p>}
        </div>

        {/* Proficiency + Format */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="sb-label">Your level</label>
            <select {...register('proficiency')} className="sb-input">
              {['beginner', 'intermediate', 'advanced', 'expert'].map(p => (
                <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="sb-label">Format</label>
            <select {...register('format')} className="sb-input">
              <option value="one-on-one">1-on-1</option>
              <option value="group">Group</option>
              <option value="both">Both</option>
            </select>
          </div>
        </div>

        {/* Language */}
        <div>
          <label className="sb-label">Preferred language</label>
          <select {...register('language')} className="sb-input">
            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        {/* Tags */}
        <div>
          <label className="sb-label">
            Tags <span className="text-slate-400 font-normal">(up to 5)</span>
          </label>
          <div className="flex gap-2">
            <input
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
              className="sb-input flex-1"
              placeholder="e.g. react, figma, cooking…"
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
                  <button type="button" onClick={() => removeTag(t)}><X size={10} /></button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="sb-btn-ghost">Cancel</button>
          <button type="submit" disabled={saving} className="sb-btn-primary flex items-center gap-2">
            {saving && <Loader2 size={14} className="animate-spin" />}
            {isEditing ? 'Save changes' : 'Add skill'}
          </button>
        </div>
      </form>
    </Modal>
  );
}