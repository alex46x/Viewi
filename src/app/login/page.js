'use client';

import { useState, useEffect } from 'react';
import AuthCard from '@/components/AuthCard';
import Link from 'next/link';
import { ArrowLeft, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('viewi-auth-theme') || 'light';
    setTheme(savedTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('viewi-auth-theme', nextTheme);
  };

  return (
    <div className={cn(
      "min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-500 relative overflow-hidden",
      theme === 'dark' ? "bg-[#0b0c10]" : "bg-[#eceef2]"
    )}>
      {/* Soft glowing background blobs */}
      <div className={cn(
        "fixed top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none -z-10 transition-colors duration-500",
        theme === 'dark' ? "bg-violet-600/15" : "bg-amber-200/20 animate-pulse"
      )} />
      <div className={cn(
        "fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none -z-10 transition-colors duration-500",
        theme === 'dark' ? "bg-fuchsia-600/10" : "bg-orange-100/30"
      )} />

      {/* Floating Theme Toggle */}
      <button 
        onClick={toggleTheme}
        className={cn(
          "fixed top-8 right-8 z-30 p-2.5 rounded-full border transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm backdrop-blur-md cursor-pointer flex items-center justify-center",
          theme === 'dark' 
            ? "bg-[#13141a]/80 border-white/10 text-white/80 hover:bg-[#1c1d24] hover:text-white" 
            : "bg-white/80 border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
        )}
      >
        {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
      </button>

      <Link href="/" className={cn(
        "absolute top-10 left-10 flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all hover:-translate-x-1 group z-20",
        theme === 'dark' ? "text-white/30 hover:text-white" : "text-gray-400 hover:text-gray-800"
      )}>
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:scale-110" /> 
        Back to Home
      </Link>

      <AuthCard initialMode="signin" theme={theme} />

      {/* Footer Links */}
      <div className={cn(
        "mt-8 flex items-center gap-6 text-[10px] font-bold uppercase tracking-[0.2em] z-20 transition-colors duration-500",
        theme === 'dark' ? "text-white/30" : "text-gray-400"
      )}>
        <Link href="/privacy" className={cn("transition-colors", theme === 'dark' ? "hover:text-white/60" : "hover:text-gray-700")}>Privacy Policy</Link>
        <Link href="/terms" className={cn("transition-colors", theme === 'dark' ? "hover:text-white/60" : "hover:text-gray-700")}>Terms of Service</Link>
      </div>
    </div>
  );
}
