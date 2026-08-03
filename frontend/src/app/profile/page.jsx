'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { BookOpen, GraduationCap, Trophy, Flame, UsersRound, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { skillsAPI } from '../../services/api';
import SkillsSection from '../../components/skills/SkillsSection';
import { Loader2 } from 'lucide-react';

export default function ProfilePage(){
 const {user}=useAuth(); const [teach,setTeach]=useState([]); const [learn,setLearn]=useState([]); const [loading,setLoading]=useState(true);
 const load=useCallback(async()=>{try{const r=await skillsAPI.getMySkills();setTeach(r.data.teach||[]);setLearn(r.data.learn||[])}finally{setLoading(false)}},[]);
 useEffect(()=>{load()},[load]);
 if(loading)return <div className="flex justify-center py-24"><Loader2 className="animate-spin text-brand-600"/></div>;
 return <div className="space-y-6">
  <section className="overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-sm">
   <div className="h-28 bg-gradient-to-r from-brand-700 via-brand-800 to-learn-700 sm:h-36"/>
   <div className="px-5 pb-6 sm:px-8"><div className="-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border-4 border-white bg-brand-100 text-2xl font-extrabold text-brand-700 shadow-sm">{user?.avatar?<img src={user.avatar} className="h-full w-full object-cover" alt=""/>:(user?.name||'SB').split(' ').map(x=>x[0]).slice(0,2).join('').toUpperCase()}</div><h1 className="mt-4 text-2xl font-extrabold">{user?.name}</h1><p className="mt-1 text-sm font-medium text-slate-500">Learner • Teacher • Skill Explorer</p><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">{user?.bio||'Build your learning identity by showing what you are learning, what you can teach, and how you help others grow.'}</p></div><Link href="/matching" className="sb-btn-primary">Find my next learning partner <ArrowRight size={15}/></Link></div>
   <div className="mt-6 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5 sm:grid-cols-4"><Stat icon={BookOpen} value={learn.length} label="Learning goals"/><Stat icon={GraduationCap} value={teach.length} label="Teaching skills"/><Stat icon={Trophy} value={user?.reputation?.toFixed?.(1)||'0.0'} label="Reputation"/><Stat icon={UsersRound} value="—" label="Learners helped"/></div>
  </div></section>
  <section className="grid gap-5 lg:grid-cols-2">
   <div className="sb-card p-6"><div className="flex items-center justify-between"><div><span className="eyebrow"><BookOpen size={13}/> LEARNING</span><h2 className="mt-2 text-lg font-extrabold">Currently learning</h2></div><span className="rounded-xl bg-learn-50 p-2.5 text-learn-600"><BookOpen size={18}/></span></div><div className="mt-4 space-y-2">{learn.length?learn.map(s=><div key={s._id||s.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3"><div><p className="text-sm font-bold">{s.name}</p><p className="text-xs text-slate-400">{s.proficiency||'Beginner'} • {s.category||'Skill'}</p></div><span className="h-2 w-20 overflow-hidden rounded-full bg-slate-200"><span className="block h-full w-1/3 rounded-full bg-learn-600"/></span></div>):<p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No learning goals yet. Add skills you want to learn.</p>}</div></div>
   <div className="sb-card p-6"><div className="flex items-center justify-between"><div><span className="eyebrow"><GraduationCap size={13}/> TEACHING</span><h2 className="mt-2 text-lg font-extrabold">I can teach</h2></div><span className="rounded-xl bg-brand-50 p-2.5 text-brand-600"><GraduationCap size={18}/></span></div><div className="mt-4 space-y-2">{teach.length?teach.map(s=><div key={s._id||s.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3"><div><p className="text-sm font-bold">{s.name}</p><p className="text-xs text-slate-400">{s.proficiency||'Beginner'} • {s.category||'Skill'}</p></div><span className="rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-bold text-brand-700">Teach</span></div>):<p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Add a skill you can teach to help another learner.</p>}</div></div>
  </section>
  <section className="rounded-2xl border border-gold-100 bg-gold-50 p-6"><div className="flex items-start gap-4"><div className="rounded-xl bg-white p-3 text-gold-600"><Flame size={20}/></div><div><h2 className="font-extrabold">Build your learning reputation</h2><p className="mt-1 text-sm leading-6 text-slate-600">Complete sessions, help learners, and contribute useful answers to grow your reputation.</p></div></div></section>
  <SkillsSection teachSkills={teach} learnSkills={learn} isOwner={true} onRefresh={load}/>
 </div>
}
function Stat({icon:Icon,value,label}){return <div className="rounded-xl bg-slate-50 p-3"><Icon size={15} className="text-slate-400"/><p className="mt-2 text-lg font-extrabold">{value}</p><p className="text-[11px] text-slate-500">{label}</p></div>}