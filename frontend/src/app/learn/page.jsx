'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, ArrowRight, UsersRound, Sparkles, SlidersHorizontal, BookOpen } from 'lucide-react';
import { skillsAPI } from '../../services/api';

const cats=['All','Technology','Design','Business','Languages','Music','Academic','Cooking','Cybersecurity'];

export default function LearnPage(){
 const [skills,setSkills]=useState([]); const [loading,setLoading]=useState(true); const [query,setQuery]=useState(''); const [category,setCategory]=useState('All');
 useEffect(()=>{skillsAPI.getAll({ type: 'teach' }).then(r=>setSkills(r.data.skills || r.data || [])).catch(()=>setSkills([])).finally(()=>setLoading(false));},[]);
 const filtered=useMemo(()=>skills.filter(s=>(category==='All'||s.category===category) && (!query||`${s.name} ${s.description||''} ${s.tags||''}`.toLowerCase().includes(query.toLowerCase()))),[skills,query,category]);
 return <div className="space-y-8">
  <section className="rounded-[28px] bg-white border border-slate-100 p-6 shadow-sm sm:p-8">
   <span className="eyebrow"><BookOpen size={14}/> LEARN</span>
   <h1 className="mt-2 text-3xl font-extrabold tracking-tight">What do you want to learn?</h1>
   <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Discover skills, find people who can teach them, and turn curiosity into practical learning.</p>
   <div className="relative mt-6 max-w-3xl"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} className="sb-input pl-11 pr-12" placeholder="Search Python, UI/UX, cybersecurity, music..."/><SlidersHorizontal className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={17}/></div>
  </section>
  <section><div className="flex flex-wrap gap-2">{cats.map(c=><button key={c} onClick={()=>setCategory(c)} className={`rounded-full px-4 py-2 text-xs font-bold transition ${category===c?'bg-blue-600 text-white':'border border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:text-blue-600'}`}>{c}</button>)}</div></section>
  <section>
   <div className="mb-4 flex items-end justify-between"><div><h2 className="text-xl font-extrabold">Skills you can learn</h2><p className="mt-1 text-sm text-slate-500">Learn with a person, not just a playlist.</p></div><Link href="/profile" className="hidden items-center gap-1 text-sm font-bold text-blue-600 sm:flex">Set learning goals <ArrowRight size={14}/></Link></div>
   {loading?<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3].map(x=><div key={x} className="h-56 animate-pulse rounded-2xl bg-white border border-slate-100"/>)}</div>:
   filtered.length?<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((s,i)=><SkillDiscoveryCard key={s._id||s.id||i} skill={s} i={i}/>)}</div>:
   <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center"><Search className="mx-auto text-slate-300"/><p className="mt-2 font-bold">No matching skills found</p><p className="mt-1 text-sm text-slate-500">Try another search or browse a different category.</p></div>}
  </section>
 </div>
}
function SkillDiscoveryCard({skill,i}){return <div className="course-card"><div className={`course-cover cover-${i%3}`}><span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold backdrop-blur">{skill.category||'Skill'}</span><Sparkles size={25}/></div><div className="p-5"><h3 className="font-bold">{skill.name}</h3><p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{skill.description||'Learn this skill through peer-to-peer exchange and practical sessions.'}</p><div className="mt-4 flex items-center gap-3 text-[11px] text-slate-400"><span className="inline-flex items-center gap-1"><UsersRound size={13}/> People teaching</span><span>{skill.proficiency||'All levels'}</span></div><Link href="/matching" className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-blue-600">Find a teacher <ArrowRight size={14}/></Link></div></div>}
