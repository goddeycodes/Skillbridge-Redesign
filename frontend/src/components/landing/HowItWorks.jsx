import { UserPlus, Sparkles, Calendar, Star } from 'lucide-react';

const STEPS = [
  {
    number: '01',
    icon: UserPlus,
    lightColor: 'bg-brand-50',
    textColor: 'text-brand-600',
    title: 'Create your profile',
    description:
      'Sign up in seconds and list the skills you can teach — Python, Design, Music, French, anything. Then add what you want to learn. You start with 10 free credits.',
  },
  {
    number: '02',
    icon: Sparkles,
    lightColor: 'bg-learn-50',
    textColor: 'text-learn-600',
    title: 'Get AI-matched',
    description:
      'Our matching engine analyses skill compatibility, proficiency levels, and language preferences to rank your best exchange partners — no endless browsing required.',
  },
  {
    number: '03',
    icon: Calendar,
    lightColor: 'bg-success-50',
    textColor: 'text-success-600',
    title: 'Book a session',
    description:
      'Schedule a live 1-on-1 session with your match. Chat beforehand to align on goals. Join via any video tool — Zoom, Google Meet, whatever works for both of you.',
  },
  {
    number: '04',
    icon: Star,
    lightColor: 'bg-gold-50',
    textColor: 'text-gold-600',
    title: 'Earn & grow',
    description:
      'Complete a session as a teacher and earn a credit. Spend credits to learn from others. Rate each session to build your reputation and unlock verified skill badges.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-semibold text-brand-600 uppercase tracking-widest mb-3">
            How it works
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-800 leading-tight">
            Learn by teaching.<br />Teach by learning.
          </h2>
          <p className="mt-4 text-slate-500 text-lg max-w-xl mx-auto leading-relaxed">
            SkillBridge turns every person into both a student and a teacher.
            Four simple steps from signup to your first skill exchange.
          </p>
        </div>

        {/* Steps */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="relative bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                {/* Connector line */}
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-10 -right-3 w-6 h-px bg-slate-200 z-10" />
                )}

                {/* Number */}
                <p className="font-display text-5xl font-black text-slate-100 group-hover:text-brand-50 transition-colors leading-none mb-4 select-none">
                  {step.number}
                </p>

                {/* Icon */}
                <div className={`w-11 h-11 rounded-xl ${step.lightColor} flex items-center justify-center mb-4`}>
                  <Icon size={20} className={step.textColor} />
                </div>

                <h3 className="font-bold text-slate-800 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{step.description}</p>
              </div>
            );
          })}
        </div>

        {/* Credit explainer */}
        <div className="mt-12 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8">
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            <div>
              <p className="font-display text-3xl font-black text-brand-600">10</p>
              <p className="text-sm font-semibold text-slate-700 mt-1">Free credits on signup</p>
              <p className="text-xs text-slate-400 mt-0.5">Start learning immediately</p>
            </div>
            <div className="sm:border-x border-slate-100">
              <p className="font-display text-3xl font-black text-success-600">+1</p>
              <p className="text-sm font-semibold text-slate-700 mt-1">Credit per session taught</p>
              <p className="text-xs text-slate-400 mt-0.5">Teaching earns you learning</p>
            </div>
            <div>
              <p className="font-display text-3xl font-black text-learn-600">-1</p>
              <p className="text-sm font-semibold text-slate-700 mt-1">Credit per session booked</p>
              <p className="text-xs text-slate-400 mt-0.5">No money, ever</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}