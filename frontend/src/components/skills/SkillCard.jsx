'use client';
import { Edit2, Trash2, BookOpen, GraduationCap } from 'lucide-react';
import Badge from '../shared/Badge';

const PROFICIENCY_COLOR = {
  beginner:     'slate',
  intermediate: 'blue',
  advanced:     'amber',
  expert:       'green',
};

const FORMAT_LABEL = {
  'one-on-one': '1-on-1',
  group:        'Group',
  both:         '1-on-1 & Group',
};

export default function SkillCard({ skill, isOwner, onEdit, onDelete }) {
  const isTeach = skill.type === 'teach';

  return (
    <div className="sb-card p-4 flex flex-col gap-3 group hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
            isTeach ? 'bg-brand-50' : 'bg-learn-50'
          }`}>
            {isTeach
              ? <GraduationCap size={15} className="text-brand-600" />
              : <BookOpen size={15} className="text-learn-600" />}
          </div>
          <div>
            <p className="font-semibold text-slate-800 leading-tight">{skill.name}</p>
            <p className="text-xs text-slate-400 mt-0.5">{skill.category}</p>
          </div>
        </div>

        {isOwner && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button
              onClick={() => onEdit(skill)}
              aria-label={`Edit ${skill.name}`}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <Edit2 size={13} />
            </button>
            <button
              onClick={() => onDelete(skill._id)}
              aria-label={`Delete ${skill.name}`}
              className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
            >
              <Trash2 size={13} />
            </button>
          </div>
        )}
      </div>

      {/* Description */}
      {skill.description && (
        <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{skill.description}</p>
      )}

      {/* Meta badges */}
      <div className="flex flex-wrap gap-1.5 mt-auto">
        {skill.proficiency && (
          <Badge label={skill.proficiency} color={PROFICIENCY_COLOR[skill.proficiency] || 'slate'} />
        )}
        {skill.format && skill.format !== 'one-on-one' && (
          <Badge label={FORMAT_LABEL[skill.format]} color="slate" />
        )}
        {skill.language && skill.language !== 'English' && (
          <Badge label={skill.language} color="amber" />
        )}
        {skill.tags?.slice(0, 3).map(tag => (
          <Badge key={tag} label={`#${tag}`} color="slate" />
        ))}
      </div>
    </div>
  );
}