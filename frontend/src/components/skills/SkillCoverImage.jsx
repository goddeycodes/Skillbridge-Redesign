'use client';
import { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import { getSkillImageCandidates } from '../../lib/skillImages';

/**
 * Skill cover that cycles through on-theme candidates if one fails to load.
 */
export default function SkillCoverImage({ skill, className = 'h-40', children, alt }) {
  const candidates = getSkillImageCandidates(skill);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [skill?._id, skill?.id, skill?.name, skill?.category]);

  const src = candidates[Math.min(index, candidates.length - 1)];

  const handleError = () => {
    setIndex(i => (i < candidates.length - 1 ? i + 1 : i));
  };

  return (
    <div className={`relative w-full overflow-hidden bg-slate-300 ${className}`}>
      <img
        src={src}
        alt={alt || skill?.name || 'Skill cover'}
        className="h-full w-full object-cover"
        loading="lazy"
        onError={handleError}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent pointer-events-none" />
      {children}
    </div>
  );
}

/** Gradient placeholder when no skill object is available */
export function SkillCoverPlaceholder({ category, className = 'h-40' }) {
  return (
    <div className={`relative w-full overflow-hidden bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center ${className}`}>
      <BookOpen size={32} className="text-white/40" />
      {category && (
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-slate-700">
          {category}
        </span>
      )}
    </div>
  );
}
