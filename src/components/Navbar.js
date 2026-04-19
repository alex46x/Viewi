'use client';

import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 glass">
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="Viewi Logo" className="w-10 h-10 object-contain" />
          <span className="text-2xl font-black tracking-tighter gradient-text">Viewi</span>
        </Link>
      </div>
      <div className="flex items-center gap-6 text-sm font-medium">
        <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">Login</Link>
        <Link href="/signup" className="btn-primary px-6">Get Started</Link>
      </div>
    </nav>
  );
}
