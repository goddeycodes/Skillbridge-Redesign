'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, GraduationCap, UsersRound, ArrowRight, Pencil, Sparkles } from 'lucide-react';
import { skillsAPI } from '../../services/api';
import SkillFormModal from '../../components/skills/SkillFormModal';
import SkillCoverImage from '../../components/skills/SkillCoverImage';

export default function TeachPage() {
  const [skills, setSkills] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () =>
    skillsAPI.getMySkills()
      .then(r => setSkills(r.data.teach || []))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-8">
      <section className="rounded-[28px] bg-gradient-to-br from-brand-700 to-brand-900 p-6 text-white shadow-sm sm:p-8">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-extrabold tracking-[0.15em]">
          <GraduationCap size={14} /> TEACH
        </span>
        <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight">Share what you know.</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-brand-100">
              Your knowledge can become someone else&apos;s breakthrough. Add the skills you can teach and let SkillBridge find learners.
            </p>
          </div>
          <button
            onClick={() => { setEditing(null); setOpen(true); }}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-brand-700"
          >
            <Plus size={16} /> Add a skill
          </button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Stat icon={GraduationCap} value={skills.length} label="Skills you teach" />
        <Stat icon={UsersRound} value="—" label="Learners helped" />
        <Stat icon={Sparkles} value="Build" label="Your mentor reputation" />
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-xl font-extrabold">My teaching skills</h2>
          <p className="mt-1 text-sm text-slate-500">Make your teaching profile clear enough for the right learner to find you.</p>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => <div key={i} className="h-64 animate-pulse rounded-2xl bg-white border border-slate-100" />)}
          </div>
        ) : skills.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {skills.map(skill => (
              <div key={skill._id || skill.id} className="course-card overflow-hidden">
                <SkillCoverImage skill={skill} className="h-36">
                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-slate-700 backdrop-blur">
                    {skill.category || 'Skill'}
                  </span>
                  <button
                    onClick={() => { setEditing(skill); setOpen(true); }}
                    className="absolute right-2 top-2 rounded-lg bg-white/90 p-2 text-slate-500 hover:text-slate-700 shadow-sm"
                  >
                    <Pencil size={15} />
                  </button>
                </SkillCoverImage>
                <div className="p-5">
                  <h3 className="font-bold text-slate-800">{skill.name}</h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                    {skill.description || 'Add a description so learners understand what they can expect.'}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-[11px]">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 font-bold text-slate-600 capitalize">
                      {skill.proficiency || 'All levels'}
                    </span>
                    <span className="text-slate-400 capitalize">{skill.format?.replace('-', ' ') || 'One-on-one'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
            <GraduationCap className="mx-auto text-slate-300" size={28} />
            <p className="mt-2 font-bold">You haven&apos;t added a teaching skill yet</p>
            <p className="mt-1 text-sm text-slate-500">Start with one thing you can confidently teach.</p>
            <button onClick={() => setOpen(true)} className="mt-4 sb-btn-primary">
              <Plus size={15} /> Add teaching skill
            </button>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-brand-100 bg-brand-50 p-5">
        <div className="flex gap-3">
          <Sparkles className="mt-0.5 text-brand-600" size={18} />
          <div>
            <p className="font-bold text-slate-800">Teaching is part of your learning journey</p>
            <p className="mt-1 text-sm text-slate-600">
              Complete your teaching skills, then visit Skill Matches to discover people whose learning goals complement your knowledge.
            </p>
            <Link href="/matching" className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-brand-700">
              Explore matches <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <SkillFormModal
        open={open}
        onClose={() => setOpen(false)}
        skill={editing}
        defaultType="teach"
        onSaved={() => { setOpen(false); load(); }}
      />
    </div>
  );
}

function Stat({ icon: Icon, value, label }) {
  return (
    <div className="sb-card flex items-center gap-4 p-5">
      <div className="rounded-xl bg-slate-100 p-3 text-slate-600"><Icon size={20} /></div>
      <div>
        <p className="text-xl font-extrabold">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  );
}
