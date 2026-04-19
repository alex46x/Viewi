import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-6 pt-32 pb-20">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors mb-12 group">
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Back to Home
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-violet-500/10 rounded-2xl">
            <Shield className="w-8 h-8 text-violet-500" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
        </div>

        <div className="glass-card p-10 rounded-[2.5rem] border-white/5 space-y-8 text-muted-foreground leading-relaxed">
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us when you create an account, including your email address, 
              name, birth date, and any social links or profile information you choose to share publicly.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">2. Analytics and Tracking</h2>
            <p>
              When you visit a profile on Viewi, we collect anonymous data such as device type, browser, and general 
              geographic location (country level) to provide analytics to our users. We do not sell this data to third parties.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">3. Public Information</h2>
            <p>
              Please be aware that your Viewi profile is public by default. Any information you include on your profile 
              will be visible to anyone on the internet. You can toggle your profile visibility in your account settings.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">4. Cookies</h2>
            <p>
              We use essential cookies to maintain your session and ensure the security of your account. We do not use 
              tracking cookies for third-party advertising.
            </p>Section

          <section className="space-y-4 pt-8 border-t border-white/5">
            <p className="text-sm">
              Last updated: April 19, 2026. For any questions regarding this policy, please contact us.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
