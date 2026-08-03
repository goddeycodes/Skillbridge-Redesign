import {
  Sparkles, ShieldCheck, MessageCircle, Star,
  Users, BookOpen, Zap, GraduationCap,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Sparkles,
    color: 'text-brand-600',
    bg: 'bg-brand-50',
    title: 'AI-Powered Matching',
    description:
      'Our engine scores every potential exchange partner using TF-IDF semantic analysis, proficiency compatibility, and language preference — surfacing your best matches instantly.',
  },
  {
    icon: ShieldCheck,
    color: 'text-success-600',
    bg: 'bg-success-50',
    title: 'Verified Skills',
    description:
      'Skills go through a 3-step verification — AI quiz, portfolio evidence, and peer endorsements — before they can be used in teaching sessions. No false claims.',
  },
  {
    icon: MessageCircle,
    color: 'text-learn-600',
    bg: 'bg-learn-50',
    title: 'Real-Time Chat',
    description:
      'Message your session partner directly in the platform. Persistent chat history, typing indicators, and instant delivery — all secured with JWT authentication.',
  },
  {
    icon: Star,
    color: 'text-gold-600',
    bg: 'bg-gold-50',
    title: 'Reputation System',
    description:
      'Post-session mutual ratings build community trust over time. Reputation scores are visible on every profile and match card to help you make informed choices.',
  },
  {
    icon: Zap,
    color: 'text-accent-600',
    bg: 'bg-accent-50',
    title: 'Credit Economy',
    description:
      'A fair, money-free exchange system. Teach a session, earn a credit. Spend a credit to learn. Every transaction is logged in a transparent credit ledger.',
  },
  {
    icon: Users,
    color: 'text-brand-600',
    bg: 'bg-brand-50',
    title: 'Community Hub',
    description:
      'Discussion forums organised by skill domain, with upvoting, threaded replies, and full-text search. Share resources, ask questions, and learn from the crowd.',
  },
  {
    icon: GraduationCap,
    color: 'text-gold-600',
    bg: 'bg-gold-50',
    title: 'Skill Portfolio',
    description:
      'Every user builds a shareable portfolio of skills taught and learned, with verified badges that reflect real expertise — not just self-reported proficiency.',
  },
  {
    icon: BookOpen,
    color: 'text-brand-700',
    bg: 'bg-brand-50',
    title: 'Session Management',
    description:
      'Book, schedule, join, complete, and rate sessions all in one place. Cancel with a full credit refund. Every step of the session lifecycle is handled for you.',
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-semibold text-brand-600 uppercase tracking-widest mb-3">
            Platform features
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-800">
            Everything you need to exchange skills
          </h2>
          <p className="mt-4 text-slate-500 text-lg max-w-xl mx-auto">
            SkillBridge combines intelligent matching, trust tools, and real-time
            communication into a single cohesive platform.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map(({ icon: Icon, color, bg, title, description }, i) => (
            <div key={i}
              className="group p-5 rounded-2xl border border-slate-100 hover:border-brand-200 hover:shadow-md transition-all hover:-translate-y-0.5 cursor-default">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                <Icon size={18} className={color} />
              </div>
              <h3 className="font-bold text-slate-800 mb-2 text-sm">{title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>

        {/* Highlighted differentiator */}
        <div className="mt-16 rounded-3xl bg-gradient-to-br from-brand-800 to-learn-700 p-8 sm:p-10 text-white relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
          <div className="relative grid sm:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-xs font-semibold text-brand-200 uppercase tracking-widest mb-3">
                Why SkillBridge is different
              </p>
              <h3 className="font-display text-2xl sm:text-3xl font-bold leading-snug">
                The only platform where teaching makes you a better learner
              </h3>
            </div>
            <div className="space-y-4">
              {[
                ['Traditional platforms', 'Pay to watch. Passive. One-directional.'],
                ['SkillBridge',          'Teach what you know. Learn what you need. Earn while you grow.'],
              ].map(([label, desc]) => (
                <div key={label} className="flex items-start gap-3">
                  <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${label === 'SkillBridge' ? 'bg-success-400' : 'bg-white/30'}`} />
                  <div>
                    <p className={`text-sm font-semibold ${label === 'SkillBridge' ? 'text-white' : 'text-white/50'}`}>{label}</p>
                    <p className={`text-xs mt-0.5 ${label === 'SkillBridge' ? 'text-white/80' : 'text-white/40'}`}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}