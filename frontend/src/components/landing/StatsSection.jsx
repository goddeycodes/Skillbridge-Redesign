import { Star } from 'lucide-react';

const STATS = [
  { value: '10+',    label: 'Skill categories',      sub: 'Tech, Design, Music & more' },
  { value: '100%',   label: 'Free to use',            sub: 'No subscriptions ever'       },
  { value: '3-step', label: 'Skill verification',     sub: 'Quiz + Evidence + Endorsement'},
  { value: 'AI',     label: 'Powered matching',       sub: 'TF-IDF semantic engine'      },
];

const TESTIMONIALS = [
  {
    quote:
      "I taught Python for two sessions and used the credits to finally learn Graphic Design. It's the most efficient way I've found to level up.",
    name: 'Kwame Asante',
    role: 'Software Developer',
    initials: 'KA',
    color: 'from-brand-400 to-brand-600',
    rating: 5,
  },
  {
    quote:
      "The AI matching is surprisingly good. It connected me with someone whose design skills complemented exactly what I was teaching in French.",
    name: 'Ama Mensah',
    role: 'Language Tutor',
    initials: 'AM',
    color: 'from-violet-400 to-violet-600',
    rating: 5,
  },
  {
    quote:
      "I was sceptical about peer learning but the verified skill badges gave me the confidence to book my first session. Absolutely worth it.",
    name: 'Elinam Badu',
    role: 'UX Designer',
    initials: 'EB',
    color: 'from-emerald-400 to-emerald-600',
    rating: 5,
  },
];

export default function StatsSection() {
  return (
    <>
      {/* Stats */}
      <section id="stats" className="py-16 bg-slate-50 border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map(({ value, label, sub }, i) => (
              <div key={i} className="text-center">
                <p className="text-4xl sm:text-5xl font-black text-brand-600">{value}</p>
                <p className="mt-1 text-sm font-semibold text-slate-700">{label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-semibold text-brand-600 uppercase tracking-widest mb-3">
              Community voices
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800">
              What our members say
            </h2>
            <p className="mt-3 text-slate-500 text-lg max-w-md mx-auto">
              Real feedback from people who've exchanged skills on SkillBridge.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ quote, name, role, initials, color, rating }, i) => (
              <div key={i}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col">
                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: rating }).map((_, j) => (
                    <Star key={j} size={13} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-sm text-slate-600 leading-relaxed flex-1">
                  &ldquo;{quote}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 mt-5 pt-5 border-t border-slate-100">
                  <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{name}</p>
                    <p className="text-xs text-slate-400">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Skill categories showcase */}
          <div className="mt-16 text-center">
            <p className="text-sm font-semibold text-slate-500 mb-5">Skills being exchanged right now</p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                'Python Programming', 'Graphic Design', 'French Language', 'Guitar',
                'Excel & Data', 'Public Speaking', 'UI/UX Design', 'Photography',
                'Content Writing', 'Video Editing', 'Machine Learning', 'Cooking',
                'Fitness Training', 'Business Strategy', 'Arabic', 'Mobile Dev',
              ].map((skill) => (
                <span key={skill}
                  className="px-3 py-1.5 text-sm text-slate-600 bg-slate-50 border border-slate-100 rounded-full hover:bg-brand-50 hover:text-brand-700 hover:border-brand-100 transition-colors cursor-default">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
