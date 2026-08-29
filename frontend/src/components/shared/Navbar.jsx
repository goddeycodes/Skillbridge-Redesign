'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, User, ChevronDown, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationPanel, { useUnreadCount } from '../notifications/NotificationPanel';

export default function Navbar() {
  const { user, logout }  = useAuth();
  const router            = useRouter();
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const menuRef = useRef(null);
  const { count: unreadCount, reset: resetCount } = useUnreadCount();

  // Close avatar dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const handleBellClick = () => {
    setNotifOpen(prev => !prev);
    if (!notifOpen) resetCount();
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto h-full px-4 flex items-center justify-between">

          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
                <path d="M4 11C4 7.13 7.13 4 11 4s7 3.13 7 7-3.13 7-7 7-7-3.13-7-7Z"
                  stroke="white" strokeWidth="1.5"/>
                <path d="M8 11h6M11 8v6" stroke="white"
                  strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-bold text-slate-800 text-lg tracking-tight">
              SkillBridge
            </span>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { href: '/dashboard', label: 'Dashboard'   },
              { href: '/matching',  label: 'Find Matches' },
              { href: '/sessions',  label: 'Sessions'     },
              { href: '/community', label: 'Community'    },
            ].map(({ href, label }) => (
              <Link key={href} href={href}
                className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
                {label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">

            {/* Credits */}
            <Link href="/credits"
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-amber-50 border border-amber-100 hover:bg-amber-100 transition-colors">
              <Zap size={13} className="text-amber-500" />
              <span className="text-xs font-semibold text-amber-700">
                {user?.credits ?? 0} credits
              </span>
            </Link>

            {/* Bell */}
            <button
              onClick={handleBellClick}
              className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors"
              aria-label="Open notifications"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-4 rounded-full bg-brand-500 text-white text-[10px] font-bold px-1 leading-none">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Avatar dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(o => !o)}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center overflow-hidden">
                  {user?.avatar
                    ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    : <User size={15} className="text-brand-600" />}
                </div>
                <span className="hidden sm:block text-sm font-medium text-slate-700 max-w-[100px] truncate">
                  {user?.name}
                </span>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl border border-slate-100 shadow-lg py-1 text-sm z-50">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="font-semibold text-slate-800 truncate">{user?.name}</p>
                    <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                  </div>
                  <Link href="/profile" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-50">
                    <User size={14} /> My Profile
                  </Link>
                  {user?.isAdmin && (
                    <Link href="/admin" onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-50">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      </svg>
                      Admin Panel
                    </Link>
                  )}
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-50">
                    <LogOut size={14} /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Notification panel renders outside the header */}
      <NotificationPanel
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
      />
    </>
  );
}