'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BookOpen, GraduationCap, Home, UsersRound, MessageCircle,
  CalendarDays, UserRound, LogOut, ChevronDown, Menu, X,
  Compass, Target, ShieldCheck, Wallet,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Logo from './Logo';
import NotificationsDropdown from './NotificationsDropdown';
import { usePushNotifications } from '../../hooks/usePushNotifications';
import Avatar from './Avatar';

const groups = [
  { label: 'LEARN', items: [
    { href: '/dashboard',         label: 'Home',              icon: Home         },
    { href: '/learn',             label: 'Discover Skills',   icon: Compass      },
    { href: '/sessions',          label: 'My Learning',       icon: BookOpen     },
  ]},
  { label: 'TEACH', items: [
    { href: '/teach',             label: 'My Skills',         icon: GraduationCap },
    { href: '/matching',          label: 'Skill Matches',     icon: UsersRound    },
    { href: '/sessions/teaching', label: 'Teaching Sessions', icon: CalendarDays  },
  ]},
  { label: 'CONNECT', items: [
    { href: '/community',         label: 'Learning Community',icon: MessageCircle },
    { href: '/messages',          label: 'Messages',          icon: MessageCircle },
  ]},
];

const EXACT_ONLY = ['/dashboard', '/sessions'];

// Mobile bottom nav. Deliberately 6 items, not the "iOS default" 5 — Teach
// was missing entirely on mobile before, which buried half of a platform
// whose whole pitch is "teach what you know, learn what you need." Correct
// coverage of the core loop matters more than hitting a round tab count.
const mobileTabs = [
  ['/dashboard', 'Home',    Home],
  ['/learn',     'Learn',   BookOpen],
  ['/teach',     'Teach',   GraduationCap],
  ['/matching',  'Matches', UsersRound],
  ['/messages',  'Messages',MessageCircle],
  ['/profile',   'Profile', UserRound],
];

function isActive(pathname, href) {
  return pathname === href ||
    (!EXACT_ONLY.includes(href) && pathname.startsWith(`${href}/`));
}

export default function AppShell({ children }) {
  const pathname     = usePathname();
  const router       = useRouter();
  const { user, logout } = useAuth();
  usePushNotifications(!!user);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setProfileOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  useEffect(() => setMobileOpen(false), [pathname]);

  const signOut = () => { logout(); router.push('/auth/login'); };

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-slate-800">

      {/* ── Desktop sidebar ──────────────────────────────────────────────── */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 border-r border-slate-200/80 bg-white lg:flex lg:flex-col">
        <div className="flex h-20 items-center px-6">
          <Logo href="/dashboard" size={24} />
        </div>

        {/* Journey card */}
        <div className="px-4 pb-5">
          <div className="rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100 p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-700">
              <Target size={14} /> Your learning journey
            </div>
            <p className="text-sm font-semibold text-slate-800">Learn. Teach. Grow together.</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Build skills through real people and real conversations.
            </p>
          </div>
        </div>

        {/* Nav groups */}
        <nav className="flex-1 overflow-y-auto px-3">
          {groups.map((group) => (
            <div key={group.label} className="mb-6">
              <p className="px-3 pb-2 text-[10px] font-bold tracking-[0.16em] text-slate-400">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={`${group.label}-${label}`}
                    href={href}
                    className={`sidebar-link ${isActive(pathname, href) ? 'sidebar-link-active' : ''}`}
                  >
                    <Icon size={18} /><span>{label}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}

          <div className="mb-6">
            <p className="px-3 pb-2 text-[10px] font-bold tracking-[0.16em] text-slate-400">GROW</p>
            <Link href="/profile"
              className={`sidebar-link ${isActive(pathname, '/profile') ? 'sidebar-link-active' : ''}`}>
              <UserRound size={18} /><span>My Profile</span>
            </Link>
            {/* Was "Achievements & XP" with a Trophy icon — but /credits is a
                transaction ledger, not an achievements/XP system. Label and
                icon now match what the page actually shows. */}
            <Link href="/credits"
              className={`sidebar-link ${isActive(pathname, '/credits') ? 'sidebar-link-active' : ''}`}>
              <Wallet size={18} /><span>Credits</span>
            </Link>
            {user?.isAdmin && (
              <Link href="/admin"
                className={`sidebar-link ${isActive(pathname, '/admin') ? 'sidebar-link-active' : ''}`}>
                <ShieldCheck size={18} /><span>Admin Panel</span>
              </Link>
            )}
          </div>
        </nav>

        {/* User row */}
        <div className="border-t border-slate-100 p-4">
          <div className="flex items-center gap-3">
            <Avatar user={user} size={36} ring />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{user?.name || 'Learner'}</p>
              <p className="truncate text-xs text-slate-400">{user?.email || ''}</p>
            </div>
            <button onClick={signOut} title="Sign out" aria-label="Sign out"
              className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div className="lg:pl-64">

        {/* Top bar */}
        <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">

            {/* Mobile hamburger */}
            <button onClick={() => setMobileOpen(true)} aria-label="Open menu"
              className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden">
              <Menu size={21} />
            </button>

            {/* Page subtitle */}
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-slate-500">
                {pathname === '/dashboard' ? 'Your learning home' : 'Keep building your skills'}
              </p>
            </div>

            {/* Right — credits + bell + avatar */}
            <div className="ml-auto flex items-center gap-2">

              {/* Credits */}
              <div className="hidden items-center gap-2 rounded-full border border-gold-100 bg-gold-50 px-3 py-1.5 sm:flex">
                <span className="text-xs font-bold text-gold-700">{user?.credits ?? 0} credits</span>
              </div>

              {/* Bell — wired to the real NotificationsDropdown */}
              <NotificationsDropdown />

              {/* Avatar + dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen(v => !v)}
                  aria-label="Account menu"
                  aria-expanded={profileOpen}
                  className="flex items-center gap-2 rounded-xl border border-transparent p-1.5 hover:border-slate-200 hover:bg-slate-100"
                >
                  <Avatar user={user} size={36} />
                  <ChevronDown size={14} className={`hidden text-slate-400 sm:block transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white py-1 shadow-xl z-50">
                    <div className="border-b border-slate-100 px-4 py-3">
                      <p className="truncate text-sm font-bold">{user?.name}</p>
                      <p className="truncate text-xs text-slate-400">{user?.email}</p>
                    </div>
                    <Link href="/profile" onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-slate-50">
                      <UserRound size={15} /> My learning profile
                    </Link>
                    {user?.isAdmin && (
                      <Link href="/admin" onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm text-brand-700 hover:bg-brand-50">
                        <ShieldCheck size={15} /> Admin Panel
                      </Link>
                    )}
                    <button onClick={signOut}
                      className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-red-500 hover:bg-red-50">
                      <LogOut size={15} /> Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:py-8 lg:pb-10">
          {children}
        </main>
      </div>

      {/* ── Mobile bottom nav ─────────────────────────────────────────────── */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        <nav className="mx-auto flex max-w-lg items-center justify-around">
          {mobileTabs.map(([href, label, Icon]) => (
            <Link key={href} href={href}
              className={`mobile-tab ${isActive(pathname, href) ? 'mobile-tab-active' : ''}`}>
              <Icon size={18} /><span>{label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* ── Mobile sidebar drawer ────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button className="absolute inset-0 bg-slate-950/30"
            onClick={() => setMobileOpen(false)} aria-label="Close menu" />
          <aside className="relative flex h-full w-[82%] max-w-sm flex-col bg-white shadow-2xl">
            <div className="flex h-20 items-center justify-between border-b border-slate-100 px-5">
              <Logo href="/dashboard" size={24} />
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu"
                className="rounded-xl p-2 hover:bg-slate-100">
                <X size={19} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-4 py-5">
              {groups.map(group => (
                <div key={group.label} className="mb-6">
                  <p className="px-2 pb-2 text-[10px] font-bold tracking-[0.16em] text-slate-400">
                    {group.label}
                  </p>
                  {group.items.map(({ href, label, icon: Icon }) => (
                    <Link key={label} href={href}
                      className={`sidebar-link ${isActive(pathname, href) ? 'sidebar-link-active' : ''}`}>
                      <Icon size={18} /><span>{label}</span>
                    </Link>
                  ))}
                </div>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </div>
  );
}
