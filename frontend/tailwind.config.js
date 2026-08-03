module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary brand — warm teal. Replaces the old single-hue blue scale.
        // brand-600 is the "base" used most often (nav active states, links, icons).
        brand: {
          50:  '#EAF4F2',
          100: '#D1E6E3',
          200: '#A4CDC7',
          300: '#74B0A8',
          400: '#4C948C',
          500: '#2C7A72',
          600: '#1C6E6A',
          700: '#175D59',
          800: '#0F4C4A',   // "teal-deep" — hero backgrounds, sidebar dark contexts
          900: '#0A3634',
        },
        // Action accent — coral. Reserved for the single primary CTA per screen
        // (sb-btn-primary, "Book session", "Create account"). Never used for
        // brand identity or nav — that's what keeps it meaningful.
        accent: {
          50:  '#FFEFEA',
          100: '#FFDBD0',
          400: '#FF8B6E',
          500: '#FF6B4A',
          600: '#E85535',
          700: '#C43F22',
        },
        // Reward / commit-moment — gold. Credits, XP, streaks, "earned" states.
        gold: {
          50:  '#FEF6E7',
          100: '#FCE8C2',
          400: '#F5BE6C',
          500: '#F2A93B',
          600: '#C7861F',
          700: '#9C6714',
        },
        // Learning / creative content — purple. Replaces ad-hoc `violet-*`
        // usage on teach/learn split cards, "learn" badges, second gradient stop.
        learn: {
          50:  '#F1EEF9',
          100: '#E1DAF2',
          400: '#A896D6',
          500: '#8E7CC3',
          600: '#7462AC',
          700: '#5B4B8C',
        },
        // Success / completed / confirmed. Replaces ad-hoc `emerald-*`.
        success: {
          50:  '#E9F5EE',
          100: '#CBEBDA',
          400: '#6FBB8C',
          500: '#4F9D6E',
          600: '#3D7D57',
          700: '#2F6244',
        },
      },
      fontFamily: {
        // Body / UI — was Inter. Plus Jakarta Sans reads friendlier at small
        // sizes without losing structure. Update the next/font import in the
        // root layout.jsx alongside this (see layout.jsx.patch.txt).
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        // Headlines, numbers, stat callouts, buttons.
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        // Reserved for taglines, testimonial quotes, empty-state copy —
        // used sparingly, in italic, as the one warm voice in the system.
        serif: ['Fraunces', 'serif'],
      },
    },
  },
  plugins: [],
};