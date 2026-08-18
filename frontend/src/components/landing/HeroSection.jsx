'use client';
import Link from 'next/link';
import { ArrowRight, Zap, Users, Star } from 'lucide-react';

function FloatingCard({ className, children }) {
  return (
    <div className={`absolute bg-white rounded-2xl shadow-xl border border-slate-100 p-3.5 ${className}`}>
      {children}
    </div>
  );
}

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-learn-700">

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-learn-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-500/5 rounded-full blur-3xl" />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-16 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left — copy */}
          <div className="text-center lg:text-left">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-success-400 animate-pulse" />
              Free to join — no subscription required
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
              Trade skills.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-learn-400">
                Learn anything.
              </span><br />
              Grow together.
            </h1>

            <p className="mt-6 text-lg text-white/70 leading-relaxed max-w-xl mx-auto lg:mx-0">
              SkillBridge is a peer-to-peer skill exchange platform. Teach what you know,
              learn what you need — matched by AI, powered by community.
              No fees. No subscriptions. Just knowledge.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link href="/auth/register"
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-accent-500 text-white font-semibold text-sm hover:bg-accent-600 transition-all shadow-lg shadow-accent-900/20 hover:shadow-xl hover:-translate-y-0.5">
                Start exchanging skills
                <ArrowRight size={16} />
              </Link>
              <a href="#how-it-works"
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white font-medium text-sm hover:bg-white/15 transition-all">
                See how it works
              </a>
            </div>

            {/* Social proof strip */}
            <div className="mt-10 flex items-center gap-6 justify-center lg:justify-start">
              <div className="flex items-center gap-1.5 text-white/60 text-sm">
                <Zap size={14} className="text-gold-400" />
                10 free credits on signup
              </div>
              <div className="w-px h-4 bg-white/20" />
              <div className="flex items-center gap-1.5 text-white/60 text-sm">
                <Users size={14} className="text-success-400" />
                AI-powered matching
              </div>
              <div className="w-px h-4 bg-white/20" />
              <div className="flex items-center gap-1.5 text-white/60 text-sm">
                <Star size={14} className="text-learn-400" />
                Verified skills
              </div>
            </div>
          </div>

          {/* Right — visual mockup with floating cards */}
          <div className="relative hidden lg:flex items-center justify-center h-[480px]">

            {/* Central card — match result */}
            <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-5 w-72">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Your best match</p>
                <span className="text-xs font-bold text-success-600 bg-success-50 px-2 py-0.5 rounded-full">92% match</span>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-400 to-learn-500 flex items-center justify-center text-white font-bold text-sm">AK</div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">Ama Kofi</p>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <Star size={10} className="text-gold-400 fill-gold-400" /> 4.9 · Accra, Ghana
                  </p>
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-2">
                <div className="flex items-center gap-2 text-slate-600">
                  <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-[10px] font-bold shrink-0">You</span>
                  teach <span className="font-semibold text-slate-800 ml-1">Python Programming</span>
                </div>
                <div className="border-t border-slate-100 pt-2 flex items-center gap-2 text-slate-600">
                  <span className="w-5 h-5 rounded-full bg-learn-100 text-learn-600 flex items-center justify-center text-[10px] font-bold shrink-0">AK</span>
                  teaches <span className="font-semibold text-slate-800 ml-1">Graphic Design</span>
                </div>
              </div>
              <button className="mt-3 w-full py-2.5 rounded-xl bg-accent-500 text-white text-xs font-semibold hover:bg-accent-600 transition-colors">
                Book a session
              </button>
            </div>

            {/* Floating cards */}
            <FloatingCard className="-top-4 -left-8 w-52">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-success-100 flex items-center justify-center">
                  <Zap size={14} className="text-success-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800">Credit earned!</p>
                  <p className="text-[11px] text-slate-400">Session completed +1</p>
                </div>
              </div>
            </FloatingCard>

            <FloatingCard className="-bottom-4 -left-12 w-56">
              <p className="text-[11px] text-slate-400 mb-2">Skills available now</p>
              <div className="flex flex-wrap gap-1.5">
                {['Python', 'UI Design', 'French', 'Excel', 'Guitar'].map(s => (
                  <span key={s} className="text-[11px] px-2 py-0.5 bg-brand-50 text-brand-700 rounded-full font-medium">{s}</span>
                ))}
              </div>
            </FloatingCard>

            <FloatingCard className="-top-8 -right-4 w-48">
              <div className="flex items-center gap-2 mb-1.5">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} size={11} className="text-gold-400 fill-gold-400" />
                ))}
              </div>
              <p className="text-xs font-semibold text-slate-800">&ldquo;Best learning experience!&rdquo;</p>
              <p className="text-[11px] text-slate-400 mt-0.5">— Kwame A., Designer</p>
            </FloatingCard>

            <FloatingCard className="-bottom-2 -right-8 w-44">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-learn-100 flex items-center justify-center">
                  <Users size={12} className="text-learn-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800">New match!</p>
                  <p className="text-[11px] text-slate-400">Elinam B. — 88%</p>
                </div>
              </div>
            </FloatingCard>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 80L1440 80L1440 40C1440 40 1080 0 720 0C360 0 0 40 0 40L0 80Z" fill="#f8fafc"/>
        </svg>
      </div>
    </section>
  );
}