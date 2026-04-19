'use client';

import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 glass">
      <div className="text-2xl font-bold tracking-tighter">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center text-white text-xl">V</span>
          <span className="gradient-text">Viewi</span>
        </Link>
      </div>
      <div className="flex items-center gap-6 text-sm font-medium">
        <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">Login</Link>
        <Link href="/signup" className="btn-primary px-6">Get Started</Link>
      </div>
    </nav>
  );
}
