'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import Logo from '../shared/Logo';

export default function LandingNav() {
  const [scrolled,   setScrolled]   = useState(false);
  const [menuOpen,   setMenuOpen]   = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { href: '#how-it-works', label: 'How it works' },
    { href: '#features',     label: 'Features'     },
    { href: '#stats',        label: 'Community'    },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm border-b border-slate-100' : 'bg-transparent'
    }`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        <Logo variant={scrolled ? 'color' : 'white'} size={26} />

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label }) => (
            <a key={href} href={href}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                scrolled
                  ? 'text-slate-600 hover:text-brand-600 hover:bg-brand-50'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}>
              {label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/auth/login"
            className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
              scrolled
                ? 'text-slate-600 hover:text-brand-600'
                : 'text-white/90 hover:text-white'
            }`}>
            Sign in
          </Link>
          <Link href="/auth/register"
            className="text-sm font-semibold px-4 py-2 rounded-lg bg-accent-500 text-white hover:bg-accent-600 transition-colors shadow-sm">
            Get started free
          </Link>
        </div>

        {/* Mobile menu button */}
        <button onClick={() => setMenuOpen(o => !o)}
          className={`md:hidden p-2 rounded-lg transition-colors ${
            scrolled ? 'text-slate-600 hover:bg-slate-100' : 'text-white hover:bg-white/10'
          }`}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-1 shadow-lg">
          {navLinks.map(({ href, label }) => (
            <a key={href} href={href} onClick={() => setMenuOpen(false)}
              className="block px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
              {label}
            </a>
          ))}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Link href="/auth/login" onClick={() => setMenuOpen(false)}
              className="block text-center px-4 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              Sign in
            </Link>
            <Link href="/auth/register" onClick={() => setMenuOpen(false)}
              className="block text-center px-4 py-2.5 text-sm font-semibold text-white bg-accent-500 rounded-lg hover:bg-accent-600 transition-colors">
              Get started free
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}