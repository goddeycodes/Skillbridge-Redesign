'use client';
import { Edit2, Trash2, ShieldCheck, ShieldAlert } from 'lucide-react';
import Badge from '../shared/Badge';
import SkillCoverImage from './SkillCoverImage';

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

export default function SkillCard({ skill, isOwner, onEdit, onDelete, onVerify }) {
  const isTeach = skill.type === 'teach';

  return (
    <div className="sb-card overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
      <SkillCoverImage skill={skill} className="h-32">
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-slate-700 backdrop-blur">
          {skill.category || 'Skill'}
        </span>
        {isTeach && skill.isVerified && (
          <span className="absolute left-3 bottom-3 flex items-center gap-1 rounded-full bg-emerald-500/90 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur">
            <ShieldCheck size={11} /> Verified
          </span>
        )}
        {isOwner && (
          <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
      </SkillCoverImage>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <p className="font-semibold text-slate-800 leading-tight">{skill.name}</p>
          {skill.description ? (
            <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 mt-1">{skill.description}</p>
          ) : (
            <p className="text-xs text-slate-400 mt-1 italic">Add a description so learners know what to expect.</p>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 mt-auto">
          {skill.proficiency && (
            <Badge label={skill.proficiency} color={PROFICIENCY_COLOR[skill.proficiency] || 'slate'} />
          )}
          {skill.format && (
            <Badge label={FORMAT_LABEL[skill.format] || skill.format} color="slate" />
          )}
          {skill.language && skill.language !== 'English' && (
            <Badge label={skill.language} color="amber" />
          )}
          {isTeach && (
            <Badge label="Teaching" color="blue" />
          )}
          {!isTeach && (
            <Badge label="Learning" color="violet" />
          )}
          {skill.tags?.slice(0, 2).map(tag => (
            <Badge key={tag} label={`#${tag}`} color="slate" />
          ))}
        </div>

        {isOwner && isTeach && !skill.isVerified && onVerify && (
          <button
            onClick={() => onVerify(skill)}
            className="mt-1 flex items-center justify-center gap-1.5 w-full px-3 py-2 text-xs font-semibold text-brand-700 bg-brand-50 border border-brand-100 rounded-lg hover:bg-brand-100 transition-colors"
          >
            <ShieldAlert size={13} /> Verify this skill
          </button>
        )}
      </div>
    </div>
  );
}
