import Link from 'next/link';
import { ArrowRight, Zap } from 'lucide-react';

export default function CTASection() {
  return (
    <>
      {/* CTA Banner */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="bg-gradient-to-br from-brand-900 via-brand-800 to-violet-900 rounded-3xl p-10 sm:p-16 relative overflow-hidden">
            {/* Background dots */}
            <div className="absolute inset-0 pointer-events-none opacity-10"
              style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
            {/* Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-brand-500/20 rounded-full blur-3xl" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/70 text-xs font-medium mb-6">
                <Zap size={12} className="text-amber-400" />
                Join free — get 10 credits instantly
              </div>

              <h2 className="text-3xl sm:text-5xl font-bold text-white leading-tight">
                Ready to start<br />exchanging skills?
              </h2>

              <p className="mt-5 text-white/60 text-lg max-w-xl mx-auto leading-relaxed">
                Join SkillBridge today. List your first skill, get matched by AI,
                and have your first session — all for free.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/auth/register"
                  className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-brand-700 font-bold text-sm hover:bg-brand-50 transition-all shadow-lg shadow-brand-900/20 hover:-translate-y-0.5">
                  Create your free account
                  <ArrowRight size={16} />
                </Link>
                <Link href="/auth/login"
                  className="flex items-center justify-center px-8 py-4 rounded-xl bg-white/10 border border-white/20 text-white font-medium text-sm hover:bg-white/15 transition-all">
                  Already have an account
                </Link>
              </div>

              <p className="mt-5 text-white/30 text-xs">
                No credit card required · No subscription · Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">

            {/* Brand */}
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
                <svg width="15" height="15" viewBox="0 0 22 22" fill="none">
                  <path d="M4 11C4 7.13 7.13 4 11 4s7 3.13 7 7-3.13 7-7 7-7-3.13-7-7Z"
                    stroke="white" strokeWidth="1.5"/>
                  <path d="M8 11h6M11 8v6" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="font-bold text-slate-800">SkillBridge</span>
              <span className="text-slate-300 text-sm ml-2">
                &copy; {new Date().getFullYear()} SkillBridge
              </span>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <a href="#how-it-works" className="hover:text-slate-600 transition-colors">How it works</a>
              <a href="#features"     className="hover:text-slate-600 transition-colors">Features</a>
              <a href="#stats"        className="hover:text-slate-600 transition-colors">Community</a>
              <Link href="/auth/register" className="text-brand-600 font-medium hover:text-brand-700 transition-colors">
                Get started
              </Link>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-50 text-center">
            <p className="text-xs text-slate-300">
              Built as a peer-to-peer Skills & Knowledge Exchange Platform ·
              Bridging the gap between what people know and what people need.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
