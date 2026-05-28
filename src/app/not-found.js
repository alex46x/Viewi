'use client';

import Link from 'next/link';
import { Fingerprint, ArrowUpRight, ArrowUp } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col font-sans overflow-hidden relative">
      {/* Very subtle dot pattern at the top */}
      <div className="absolute top-0 left-0 right-0 h-[400px] pointer-events-none" style={{
        backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
        backgroundSize: '16px 16px',
        maskImage: 'linear-gradient(to bottom, black, transparent)'
      }} />

      {/* Massive Glowing Sphere Curve Effect */}
      <div className="absolute top-[40%] left-1/2 -translate-x-1/2 w-[200vw] h-[200vw] sm:w-[120vw] sm:h-[120vw] rounded-[100%] pointer-events-none"
           style={{
             boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.15), inset 0 20px 100px -20px rgba(255, 255, 255, 0.08)',
             background: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.02) 0%, transparent 40%)'
           }}
      />

      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6 sm:px-16 sm:py-10 relative z-10 w-full max-w-[1920px] mx-auto">
        <Link href="/" className="group flex items-center justify-center transition-opacity hover:opacity-70">
          {/* Logo representation from the image */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L12 22M12 12C12 12 18 12 20 8C22 4 12 12 12 12ZM12 12C12 12 6 12 4 16C2 20 12 12 12 12Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
        
        <div className="flex items-center gap-8 text-[13px] font-medium tracking-wide">
          <Link href="/signup" className="flex items-center gap-1 hover:text-white/70 transition-colors">
            Let's Create <ArrowUpRight className="w-3 h-3 ml-1" />
          </Link>
          <div className="flex items-center gap-3 hover:text-white/70 transition-colors cursor-pointer">
            Menu <div className="w-2 h-2 bg-white rounded-full" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 mt-8 sm:mt-12">
        <h1 className="text-[10rem] sm:text-[14rem] md:text-[18rem] leading-none font-medium tracking-tight text-white m-0">
          404
        </h1>
        
        <p className="text-[17px] text-white/90 font-medium mt-2 tracking-tight">
          It seems you got a little bit lost
        </p>

        <Link 
          href="/" 
          className="mt-32 flex flex-col items-center gap-4 group"
        >
          <div className="relative">
            <Fingerprint className="w-7 h-7 text-white/80 group-hover:text-white transition-colors duration-300" strokeWidth={1} />
          </div>
          <span className="text-[12px] font-medium text-white/50 group-hover:text-white/90 transition-colors duration-300">
            Go back to homepage
          </span>
        </Link>
      </main>

      {/* Footer */}
      <footer className="w-full px-8 py-8 sm:px-16 sm:py-12 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-4 relative z-10 max-w-[1920px] mx-auto mt-auto">
        <div className="md:col-span-5 flex flex-col justify-between">
          <div>
            <span className="uppercase tracking-widest text-[9px] text-white/40 font-bold block mb-4">Hey, drop us a line</span>
            <a href="mailto:info@inity.agency" className="text-white hover:text-white/70 transition-colors text-2xl sm:text-[28px] font-medium tracking-tight">
              info@inity.agency
            </a>
          </div>
          <p className="mt-12 text-[10px] text-white/40">© 2023 - Inity Agency. All rights reserved.</p>
        </div>

        <div className="md:col-span-3 flex flex-col justify-between">
          <div>
            <span className="uppercase tracking-widest text-[9px] text-white/40 font-bold block mb-4">Where we are located?</span>
            <div className="flex flex-col gap-3 text-[12px] font-medium">
              <span className="text-white hover:text-white/70 transition-colors cursor-pointer border-b border-white/30 w-fit pb-1">Dubrovnik, Croatia</span>
              <span className="text-white hover:text-white/70 transition-colors cursor-pointer border-b border-white/30 w-fit pb-1">Niš, Serbia</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-4 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row justify-between gap-10 sm:gap-4">
            <div>
              <span className="uppercase tracking-widest text-[9px] text-white/40 font-bold block mb-4">Stay in the loop</span>
              <div className="flex flex-col gap-3 text-[12px] font-medium">
                <div className="flex items-center gap-2">
                  <a href="#" className="text-white hover:text-white/70 transition-colors border-b border-white/30 pb-1">LinkedIn</a>
                  <span className="text-white/30 pb-1">,</span>
                  <a href="#" className="text-white hover:text-white/70 transition-colors border-b border-white/30 pb-1">Instagram</a>
                  <span className="text-white/30 pb-1">,</span>
                </div>
                <div className="flex items-center gap-2">
                  <a href="#" className="text-white hover:text-white/70 transition-colors border-b border-white/30 pb-1">Dribbble</a>
                  <span className="text-white/30 pb-1">,</span>
                  <a href="#" className="text-white hover:text-white/70 transition-colors border-b border-white/30 pb-1">Behance</a>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start sm:items-end justify-between h-full">
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="flex items-center gap-2 text-[12px] font-medium text-white hover:text-white/70 transition-colors group"
              >
                <ArrowUp className="w-3.5 h-3.5 group-hover:-translate-y-1 transition-transform" strokeWidth={1.5} /> Back to top
              </button>
              
              <div className="flex items-center gap-4 mt-12 text-[10px] text-white/40">
                <Link href="/privacy" className="hover:text-white transition-colors">Legal info</Link>
                <Link href="/terms" className="hover:text-white transition-colors">Privacy Policy</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
