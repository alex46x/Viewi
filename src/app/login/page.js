'use client';

import AuthCard from '@/components/AuthCard';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#eceef2] relative overflow-hidden">
      {/* Soft warm glowing background blobs */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-amber-200/20 blur-[120px] pointer-events-none -z-10 animate-pulse" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-orange-100/30 blur-[120px] pointer-events-none -z-10" />

      <Link href="/" className="absolute top-10 left-10 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-gray-800 transition-all hover:-translate-x-1 group z-20">
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:scale-110" /> 
        Back to Home
      </Link>

      <AuthCard initialMode="signin" />

      {/* Footer Links */}
      <div className="mt-8 flex items-center gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 z-20">
        <Link href="/privacy" className="hover:text-gray-700 transition-colors">Privacy Policy</Link>
        <Link href="/terms" className="hover:text-gray-700 transition-colors">Terms of Service</Link>
      </div>
    </div>
  );
}
