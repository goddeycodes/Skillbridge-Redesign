'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  ArrowRight, BookOpen, CalendarDays, ChevronRight,
  Clock3, Compass, GraduationCap, Sparkles, Target, UsersRound
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { skillsAPI, matchAPI, sessionsAPI } from '../../services/api';

const categories = [
  ['Technology','💻'], ['Design','🎨'], ['Business','📊'], ['Languages','🗣️'],
  ['Music','🎵'], ['Academic','📚'], ['Cooking','🍳'], ['Cybersecurity','🔐']
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [teach, setTeach] = useState([]);
  const [learn, setLearn] = useState([]);
  const [matches, setMatches] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      skillsAPI.getMySkills(),
      matchAPI.getMatches(),
      sessionsAPI.getAll({ status: 'upcoming' }),
    ]).then(([skills, matchesRes, sessionsRes]) => {
      if (skills.status === 'fulfilled') {
        setTeach(skills.value.data.teach || []);
        setLearn(skills.value.data.learn || []);
      }
      if (matchesRes.status === 'fulfilled') setMatches(matchesRes.value.data.matches || []);
      if (sessionsRes.status === 'fulfilled') setSessions(sessionsRes.value.data.sessions || []);
    }).finally(() => setLoading(false));
  }, []);

  const firstName = user?.name?.split(' ')[0] || 'Learner';
  const hasGoal = learn.length > 0;
  const nextSession = sessions[0];

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[28px] bg-brand-900 px-6 py-8 text-white shadow-sm sm:px-8 lg:px-10 lg:py-10">
        <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-learn-500/15 blur-3xl" />
        <div className="relative max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-brand-100">
            <Sparkles size={14}/> Your learning journey
          </div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Good {getGreeting()}, {firstName} 👋</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
            Learn from people, teach what you know, and build meaningful skills together.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/learn" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-900 hover:bg-slate-100">
              Discover skills <ArrowRight size={16}/>
            </Link>
            <Link href="/teach" className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10">
              Share what you know
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="learning-goal-card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="eyebrow"><Target size={14}/> CURRENT LEARNING GOAL</div>
              <h2 className="mt-2 text-xl font-bold text-slate-900">{hasGoal ? learn[0].name : 'Choose your first learning goal'}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {hasGoal ? 'Turn your interest into a structured learning journey.' : 'Tell SkillBridge what you want to learn so we can find the right people.'}
              </p>
            </div>
            <div className="rounded-2xl bg-brand-50 p-3 text-brand-600"><Target size={21}/></div>
          </div>
          <div className="mt-6">
            <div className="mb-2 flex justify-between text-xs font-semibold"><span className="text-slate-500">Journey progress</span><span className="text-brand-700">{hasGoal ? '20%' : '0%'}</span></div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full w-[20%] rounded-full bg-brand-600"/></div>
          </div>
          <div className="mt-5 flex items-center justify-between">
            <span className="text-xs text-slate-500">{hasGoal ? `Next: Find a mentor for ${learn[0].name}` : 'Start by adding a skill you want to learn'}</span>
            <Link href={hasGoal ? '/matching' : '/profile'} className="inline-flex items-center gap-1 text-sm font-bold text-brand-600 hover:text-brand-700">
              {hasGoal ? 'Find a match' : 'Set goal'} <ChevronRight size={15}/>
            </Link>
          </div>
        </div>

        <div className="sb-card p-6">
          <div className="flex items-center justify-between">
            <div><p className="eyebrow">YOUR EXCHANGE</p><h2 className="mt-2 text-lg font-bold">Learn ↔ Teach</h2></div>
            <div className="rounded-2xl bg-brand-50 p-3 text-brand-600"><GraduationCap size={21}/></div>
          </div>
          <div className="mt-5 space-y-3">
            <MiniSkill label="Learning" value={learn.length ? learn[0].name : 'Add a skill to learn'} icon="📚" />
            <div className="mx-auto h-4 w-px border-l border-dashed border-slate-300" />
            <MiniSkill label="Teaching" value={teach.length ? teach[0].name : 'Add a skill to teach'} icon="🎓" />
          </div>
        </div>
      </section>

      <section>
        <SectionHeading title="Continue learning" subtitle="Pick up where your learning journey left off." href="/learn" action="See all"/>
        {loading ? <SkeletonRow/> : hasGoal ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {learn.slice(0,3).map((skill,i) => <LearningCard key={skill._id || i} skill={skill} index={i}/>)}
          </div>
        ) : <EmptyLearning/>}
      </section>

      <section>
        <SectionHeading title="Discover popular skills" subtitle="Explore something new and find people who can help you learn." href="/learn" action="Explore"/>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {categories.map(([name,emoji]) => <Link href={`/learn?category=${encodeURIComponent(name)}`} key={name} className="skill-category">
            <span className="text-2xl">{emoji}</span><span className="mt-3 text-sm font-bold text-slate-800">{name}</span><span className="mt-1 text-xs text-slate-400">Explore skills</span>
          </Link>)}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="sb-card p-6">
          <SectionHeading title="Best skill matches" subtitle="People whose skills complement yours." href="/matching" action="View all"/>
          {/* Was checking matches.length regardless of loading — flashed a false
              "no matches yet" empty state on every load before data arrived. */}
          {loading ? (
            <div className="mt-4 space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-16 rounded-2xl bg-slate-100 animate-pulse" />)}
            </div>
          ) : matches.length ? (
            <div className="mt-4 space-y-3">{matches.slice(0,3).map((m,i)=><MatchPreview key={m.candidateId || i} match={m}/>)}</div>
          ) : (
            <div className="mt-4 rounded-2xl bg-slate-50 p-5 text-center"><UsersRound className="mx-auto text-slate-300" size={26}/><p className="mt-2 text-sm font-semibold">Your best matches will appear here</p><Link href="/profile" className="mt-2 inline-block text-xs font-bold text-brand-600">Add learning + teaching skills</Link></div>
          )}
        </div>

        <div className="sb-card p-6">
          <SectionHeading title="Upcoming learning" subtitle="Your next lessons and teaching sessions." href="/sessions" action="See schedule"/>
          {/* Same fix — was checking nextSession without waiting for loading. */}
          {loading ? (
            <div className="mt-4 h-32 rounded-2xl bg-slate-100 animate-pulse" />
          ) : nextSession ? (
            <div className="mt-4 rounded-2xl border border-brand-100 bg-brand-50/50 p-4">
              <div className="flex items-start justify-between"><div><span className="badge-blue">Learning session</span><h3 className="mt-3 font-bold">{nextSession.title || 'Skill exchange session'}</h3></div><CalendarDays className="text-brand-600" size={20}/></div>
              <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500"><span className="inline-flex items-center gap-1"><Clock3 size={14}/>{formatDate(nextSession.scheduledAt)}</span><span>{nextSession.duration || 60} min</span></div>
              <Link href="/sessions" className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-brand-700">Open session <ArrowRight size={14}/></Link>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl bg-slate-50 p-5 text-center"><CalendarDays className="mx-auto text-slate-300" size={26}/><p className="mt-2 text-sm font-semibold">No upcoming sessions</p><Link href="/matching" className="mt-2 inline-block text-xs font-bold text-brand-600">Find a learning partner</Link></div>
          )}
        </div>
      </section>

      <section className="rounded-[24px] border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div><div className="eyebrow"><Sparkles size={14}/> KEEP GROWING</div><h2 className="mt-2 text-xl font-bold">Your learning identity is taking shape.</h2><p className="mt-1 max-w-xl text-sm text-slate-500">Complete your profile, help another learner, and build a reputation around what you know.</p></div>
          <Link href="/profile" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800">View my profile <ArrowRight size={15}/></Link>
        </div>
      </section>
    </div>
  );
}

function SectionHeading({title,subtitle,href,action}) {
  return <div className="mb-4 flex items-end justify-between gap-4"><div><h2 className="font-display text-xl font-extrabold tracking-tight text-slate-900">{title}</h2><p className="mt-1 text-sm text-slate-500">{subtitle}</p></div>{href && <Link href={href} className="hidden shrink-0 items-center gap-1 text-sm font-bold text-brand-600 sm:flex">{action}<ArrowRight size={14}/></Link>}</div>;
}
function MiniSkill({label,value,icon}) { return <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3"><span className="text-lg">{icon}</span><div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="truncate text-sm font-bold text-slate-700">{value}</p></div></div>; }
function LearningCard({skill,index}) { const progress=[70,45,25][index%3]; return <div className="course-card"><div className={`course-cover cover-${index%3}`}><span>{['Learning path','Skill practice','Peer learning'][index%3]}</span><BookOpen size={30}/></div><div className="p-4"><div className="flex items-center justify-between gap-2"><h3 className="truncate font-bold text-slate-800">{skill.name}</h3><span className="text-[10px] font-bold text-slate-400">{skill.proficiency || 'Beginner'}</span></div><p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{skill.description || 'Build practical knowledge through a peer learning exchange.'}</p><div className="mt-4"><div className="mb-1 flex justify-between text-[10px] font-semibold text-slate-400"><span>Progress</span><span>{progress}%</span></div><div className="h-1.5 rounded-full bg-slate-100"><div className="h-full rounded-full bg-brand-600" style={{width:`${progress}%`}}/></div></div><Link href="/matching" className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-brand-600">Continue <ArrowRight size={13}/></Link></div></div>; }
function MatchPreview({match}) { return <div className="flex items-center gap-3 rounded-2xl border border-slate-100 p-3 hover:border-brand-100 hover:bg-brand-50/30"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-learn-100 text-xs font-bold text-learn-700">{(match.name || match.candidateName || 'SB').split(' ').map(x=>x[0]).slice(0,2).join('')}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{match.name || match.candidateName || 'SkillBridge member'}</p><p className="truncate text-xs text-slate-500">{match.teachSkill || match.skillToTeach || 'Skill exchange partner'}</p></div><span className="rounded-full bg-success-50 px-2 py-1 text-[10px] font-bold text-success-700">{Math.round(match.score || match.compatibility || 0)}% match</span></div>; }
function EmptyLearning(){return <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center"><BookOpen className="mx-auto text-slate-300" size={28}/><p className="mt-2 font-bold">Your learning shelf is empty</p><p className="mt-1 text-sm text-slate-500">Add a skill you want to learn to start building your journey.</p><Link href="/profile" className="mt-4 inline-flex items-center gap-1 rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white">Add learning goals <ArrowRight size={14}/></Link></div>}
function SkeletonRow(){return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3].map(i=><div key={i} className="h-64 animate-pulse rounded-2xl bg-white border border-slate-100"/>)}</div>}
function formatDate(value){if(!value)return 'Time to be scheduled'; try{return new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',hour:'numeric',minute:'2-digit'}).format(new Date(value));}catch{return 'Scheduled session';}}
function getGreeting(){const h=new Date().getHours(); return h<12?'morning':h<18?'afternoon':'evening';}