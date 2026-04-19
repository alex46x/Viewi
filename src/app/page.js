import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { ArrowRight, BarChart3, QrCode, Share2 } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-20">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-violet-600 rounded-full blur-[128px]" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-fuchsia-600 rounded-full blur-[128px]" />
        </div>

        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 text-xs font-semibold mb-6 border border-violet-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
            </span>
            Now in Private Beta
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
            Your Digital Identity, <br />
            <span className="gradient-text">Beautifully Shared.</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Create a professional digital profile in seconds. Share it with a link or QR code, 
            and track every visit with deep, real-time analytics.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="btn-primary w-full sm:w-auto h-12 px-8 text-lg">
              Create Your Viewi <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link href="/login" className="w-full sm:w-auto h-12 px-8 text-lg inline-flex items-center justify-center rounded-md border border-border hover:bg-accent transition-colors">
              Sign In
            </Link>
          </div>
          
          <div className="mt-16 relative">
            <div className="max-w-4xl mx-auto rounded-xl border border-white/10 glass shadow-2xl overflow-hidden aspect-video mockup-shadow">
              <div className="bg-white/5 h-8 flex items-center px-4 gap-2 border-b border-white/5">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
                <div className="ml-4 h-4 w-64 bg-white/5 rounded" />
              </div>
              <div className="p-8 flex items-center justify-center h-full">
                <div className="text-center opacity-50 space-y-4">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-violet-500 to-fuchsia-500 mx-auto" />
                  <div className="h-6 w-48 bg-white/10 rounded mx-auto" />
                  <div className="h-4 w-32 bg-white/5 rounded mx-auto" />
                  <div className="flex gap-4 justify-center mt-8">
                    <div className="w-10 h-10 rounded-lg bg-white/5" />
                    <div className="w-10 h-10 rounded-lg bg-white/5" />
                    <div className="w-10 h-10 rounded-lg bg-white/5" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating Features */}
            <div className="absolute -top-10 -right-4 p-4 glass rounded-xl border border-white/10 hidden md:block animate-bounce-slow">
              <QrCode className="w-8 h-8 text-violet-400" />
            </div>
            <div className="absolute -bottom-10 -left-4 p-4 glass rounded-xl border border-white/10 hidden md:block animate-bounce-slow" style={{ animationDelay: '1s' }}>
              <BarChart3 className="w-8 h-8 text-fuchsia-400" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-8 glass-card rounded-2xl space-y-4 hover:border-blue-500/50 transition-colors">
            <div className="p-3 bg-violet-500/10 rounded-xl w-fit">
              <Share2 className="text-violet-500" />
            </div>
            <h3 className="text-xl font-bold">One Link for All</h3>
            <p className="text-muted-foreground leading-relaxed">
              Consolidate your social media, portfolio, and website into one stunning landing page.
            </p>
          </div>
          
          <div className="p-8 glass-card rounded-2xl space-y-4 hover:border-indigo-500/50 transition-colors">
            <div className="p-3 bg-fuchsia-500/10 rounded-xl w-fit">
              <BarChart3 className="text-fuchsia-500" />
            </div>
            <h3 className="text-xl font-bold">Deep Analytics</h3>
            <p className="text-muted-foreground leading-relaxed">
              Understand your audience with real-time data on devices, locations, and referrers.
            </p>
          </div>
          
          <div className="p-8 glass-card rounded-2xl space-y-4 hover:border-blue-500/50 transition-colors">
            <div className="p-3 bg-violet-500/10 rounded-xl w-fit">
              <QrCode className="text-violet-500" />
            </div>
            <h3 className="text-xl font-bold">Smart QR Codes</h3>
            <p className="text-muted-foreground leading-relaxed">
              Every profile gets a unique QR code. Print it, share it, and watch the visits grow.
            </p>
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-white/5 bg-white/[0.01]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-muted-foreground">&copy; 2026 Viewi. All rights reserved.</p>
          <div className="flex items-center gap-8 text-sm">
            <Link href="/privacy" className="text-muted-foreground hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-muted-foreground hover:text-white transition-colors">Terms of Service</Link>
            <a href="mailto:support@viewi.link" className="text-muted-foreground hover:text-white transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
