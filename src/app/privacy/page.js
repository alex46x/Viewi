import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-violet-500/30">
      <Navbar />
      
      {/* Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[10%] right-[-10%] w-[40%] h-[40%] bg-violet-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[10%] w-[40%] h-[40%] bg-fuchsia-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-32 pb-20 relative">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-white/40 hover:text-white transition-all mb-12 group">
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Back to Identity
        </Link>
        
        <div className="space-y-12 animate-entrance">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-8 bg-violet-500 rounded-full shadow-[0_0_15px_rgba(139,92,246,0.5)]" />
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">Privacy Policy</h1>
              </div>
              <p className="text-white/40 font-medium max-w-xl">
                Your privacy is our priority. We are committed to protecting your personal data and being transparent about how we use it.
              </p>
            </div>
            
            <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-white/40 uppercase tracking-widest whitespace-nowrap self-start md:self-auto">
              Ref: VI-2026-04
            </div>
          </div>

          <div className="glass-card p-10 md:p-12 rounded-[2.5rem] border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent space-y-12">
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
                  <span className="text-xs font-black text-violet-500">01</span>
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">Information We Collect</h2>
              </div>
              <p className="text-white/50 leading-relaxed font-medium">
                We collect information you provide directly to us when you create an account, including your email address, 
                name, birth date, and any social links or profile information you choose to share publicly.
              </p>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-fuchsia-500/10 flex items-center justify-center border border-fuchsia-500/20">
                  <span className="text-xs font-black text-fuchsia-500">02</span>
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">Analytics and Tracking</h2>
              </div>
              <p className="text-white/50 leading-relaxed font-medium">
                When you visit a profile on Viewi, we collect anonymous data such as device type, browser, and general 
                geographic location (country level) to provide analytics to our users. We do not sell this data to third parties.
              </p>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <span className="text-xs font-black text-blue-500">03</span>
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">Public Information</h2>
              </div>
              <p className="text-white/50 leading-relaxed font-medium">
                Please be aware that your Viewi profile is public by default. Any information you include on your profile 
                will be visible to anyone on the internet. You can toggle your profile visibility in your account settings.
              </p>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <span className="text-xs font-black text-emerald-500">04</span>
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">Cookies</h2>
              </div>
              <p className="text-white/50 leading-relaxed font-medium">
                We use essential cookies to maintain your session and ensure the security of your account. We do not use 
                tracking cookies for third-party advertising.
              </p>
            </section>

            <div className="pt-10 border-t border-white/[0.05]">
              <div className="flex items-center gap-3 text-white/20">
                <Shield className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Last updated: April 19, 2026</span>
              </div>
            </div>
          </div>
          
          <div className="text-center pt-8">
            <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest">
              &copy; 2026 Viewi Identity Platforms. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
