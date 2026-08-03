'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Bell, User, ChevronDown, Zap } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Logo from '../shared/Logo';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-100 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto h-full px-4 flex items-center justify-between">

        <Logo href="/dashboard" size={26} />

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {[
            { href: '/dashboard',   label: 'Dashboard' },
            { href: '/matching',    label: 'Find Matches' },
            { href: '/sessions',    label: 'Sessions'    },
            { href: '/community',   label: 'Community'   },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Credits badge */}
          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-gold-50 border border-gold-100">
            <Zap size={13} className="text-gold-500" />
            <span className="text-xs font-semibold text-gold-700">{user?.credits ?? 0} credits</span>
          </div>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-500" />
          </button>

          {/* Avatar dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setOpen(o => !o)}
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
              <ChevronDown size={14} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl border border-slate-100 shadow-lg py-1 text-sm">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="font-semibold text-slate-800 truncate">{user?.name}</p>
                  <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                </div>
                <Link href="/profile" onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-50">
                  <User size={14} /> My Profile
                </Link>
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
  );
}