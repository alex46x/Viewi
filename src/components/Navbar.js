'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import ThemeToggle from '@/components/ThemeToggle';
import { useTheme } from '@/components/ThemeProvider';

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Estimator', href: '#estimations' },
  { label: 'Creators', href: '#testimonials' },
];

export default function Navbar() {
  const { theme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isLight = theme === 'light';
  const useDarkNavText = scrolled || isLight;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleNavClick = () => setMobileOpen(false);

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'py-3 backdrop-blur-xl border-b border-border shadow-lg bg-[var(--nav-scrolled-bg)]'
            : isLight
              ? 'py-4 bg-white/70 backdrop-blur-lg'
              : 'py-4 bg-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2.5 shrink-0 group"
              onClick={handleNavClick}
            >
              <img
                src="/logo.png"
                alt="Viewi"
                className="w-9 h-9 sm:w-10 sm:h-10 object-contain transition-transform group-hover:scale-105"
              />
              <span
                className={cn(
                  'text-xl sm:text-2xl font-black tracking-tighter transition-colors',
                  useDarkNavText ? 'text-foreground' : 'text-white drop-shadow-sm'
                )}
              >
                Viewi
              </span>
            </Link>

            {/* Desktop nav — center */}
            <div className="hidden md:flex items-center justify-center flex-1">
              <div
                className={cn(
                  'inline-flex items-center gap-1 px-1.5 py-1.5 rounded-full border transition-all duration-300',
                  useDarkNavText
                    ? 'bg-foreground/[0.04] border-border'
                    : 'bg-white/10 border-white/20 backdrop-blur-md'
                )}
              >
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200',
                      useDarkNavText
                        ? 'text-muted-foreground hover:text-foreground hover:bg-foreground/[0.06]'
                        : 'text-white/90 hover:text-white hover:bg-white/15'
                    )}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Desktop actions */}
            <div className="hidden md:flex items-center gap-2 shrink-0">
              <ThemeToggle variant="compact" />
              <Link
                href="/login"
                className={cn(
                  'px-4 py-2 text-sm font-semibold rounded-xl transition-colors',
                  useDarkNavText
                    ? 'text-muted-foreground hover:text-foreground'
                    : 'text-white/80 hover:text-white'
                )}
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-1.5 h-10 px-5 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 border border-primary/30 transition-all active:scale-[0.98]"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              className={cn(
                'md:hidden flex items-center justify-center w-10 h-10 rounded-xl border transition-colors',
                useDarkNavText
                  ? 'border-border bg-foreground/[0.04] text-foreground'
                  : 'border-white/20 bg-white/10 text-white backdrop-blur-md'
              )}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        className={cn(
          'fixed inset-0 z-[49] md:hidden transition-opacity duration-300',
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      >
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={cn(
            'absolute top-[72px] left-4 right-4 rounded-2xl border border-border bg-background/95 backdrop-blur-xl shadow-2xl p-4 transition-all duration-300',
            mobileOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
          )}
        >
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={handleNavClick}
                className="px-4 py-3 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-foreground/[0.06] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border flex flex-col gap-2">
            <div className="flex items-center justify-between px-1 pb-1">
              <span className="text-xs font-semibold text-muted-foreground">Appearance</span>
              <ThemeToggle variant="compact" />
            </div>
            <Link
              href="/login"
              onClick={handleNavClick}
              className="w-full h-11 flex items-center justify-center rounded-xl text-sm font-semibold text-muted-foreground border border-border hover:bg-foreground/[0.04] transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              onClick={handleNavClick}
              className="w-full h-11 flex items-center justify-center gap-2 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary/90 transition-colors"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
