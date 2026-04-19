import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-6 pt-32 pb-20">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors mb-12 group">
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Back to Home
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-fuchsia-500/10 rounded-2xl">
            <FileText className="w-8 h-8 text-fuchsia-500" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">Terms of Service</h1>
        </div>

        <div className="glass-card p-10 rounded-[2.5rem] border-white/5 space-y-8 text-muted-foreground leading-relaxed">
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Viewi, you agree to be bound by these Terms of Service. If you do not agree to all 
              the terms and conditions, you may not use our services.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">2. User Accounts</h2>
            <p>
              You are responsible for maintaining the security of your account and for all activities that occur under the 
              account. You must notify us immediately of any unauthorized uses of your account or any other breaches of security.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">3. User Conduct</h2>
            <p>
              You may not use Viewi for any illegal or unauthorized purpose. You agree to comply with all laws, rules, 
              and regulations applicable to your use of the service. Prohibited activities include spamming, 
              misrepresentation, and violating third-party intellectual property rights.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">4. Content Ownership</h2>
            <p>
              You retain all rights to the content you post on Viewi. By posting content, you grant us a non-exclusive, 
              royalty-free worldwide license to display that content on your public profile.
            </p>
          </section>

          <section className="space-y-4 pt-8 border-t border-white/5">
            <p className="text-sm">
              Last updated: April 19, 2026. These terms govern your use of the Viewi platform.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
