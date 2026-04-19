'use client';

import AuthCard from '@/components/AuthCard';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#030303] relative overflow-hidden">
      {/* Cinematic Background Elements */}
      <div className="curved-bg" />
      <div className="curved-line" />
      
      {/* Subtle Glowing Blobs */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none -z-10 animate-pulse" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none -z-10" />

      <Link href="/" className="absolute top-10 left-10 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/30 hover:text-white transition-all hover:-translate-x-1 group z-20">
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:scale-110" /> 
        Back to Home
      </Link>

      <AuthCard initialMode="signin" />
    </div>
  );
}
