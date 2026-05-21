import { adminDb } from '@/lib/firebaseAdmin';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { 
  Globe, 
  Youtube, 
  Linkedin, 
  Twitter, 
  Github, 
  Instagram, 
  Facebook, 
  Music2, 
  MessageSquare,
  ChevronRight,
  Cake,
  ArrowRight,
  Send
} from 'lucide-react';
import Link from 'next/link';
import { UAParser } from 'ua-parser-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }) {
  const { username } = await params;
  
  const snapshot = await adminDb.collection('users')
    .where('username', '==', username.toLowerCase())
    .limit(1)
    .get();

  if (snapshot.empty) return {};

  const user = snapshot.docs[0].data();

  return {
    title: `${user.name || `@${user.username}`} | Viewi`,
    description: user.bio || `Check out ${user.name || `@${username}`}'s profile on Viewi.`,
    openGraph: {
      title: `${user.name || `@${user.username}`} | Viewi`,
      description: user.bio || `Check out ${user.name || `@${username}`}'s profile on Viewi.`,
      images: [
        {
          url: user.image || "/logo.png",
          width: 800,
          height: 800,
          alt: user.name || username,
        },
      ],
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: `${user.name || `@${user.username}`} | Viewi`,
      description: user.bio || `Check out ${user.name || `@${username}`}'s profile on Viewi.`,
      images: [user.image || "/logo.png"],
    },
  };
}

const SOCIAL_ICONS = {
  website: Globe,
  youtube: Youtube,
  linkedin: Linkedin,
  twitter: Twitter,
  github: Github,
  instagram: Instagram,
  facebook: Facebook,
  tiktok: Music2,
  discord: MessageSquare,
  telegram: Send,
};

const BRAND_STYLES = {
  facebook: {
    hoverBorder: 'hover:border-blue-600/40',
    hoverBg: 'hover:bg-blue-600/5',
    iconColor: 'text-blue-500',
    bgGlow: 'hover:shadow-[0_0_20px_rgba(37,99,235,0.08)]',
  },
  instagram: {
    hoverBorder: 'hover:border-pink-500/40',
    hoverBg: 'hover:bg-pink-500/5',
    iconColor: 'text-pink-500',
    bgGlow: 'hover:shadow-[0_0_20px_rgba(236,72,153,0.08)]',
  },
  youtube: {
    hoverBorder: 'hover:border-red-600/40',
    hoverBg: 'hover:bg-red-600/5',
    iconColor: 'text-red-500',
    bgGlow: 'hover:shadow-[0_0_20px_rgba(220,38,38,0.08)]',
  },
  linkedin: {
    hoverBorder: 'hover:border-blue-500/40',
    hoverBg: 'hover:bg-blue-500/5',
    iconColor: 'text-blue-400',
    bgGlow: 'hover:shadow-[0_0_20px_rgba(59,130,246,0.08)]',
  },
  twitter: {
    hoverBorder: 'hover:border-sky-400/40',
    hoverBg: 'hover:bg-sky-400/5',
    iconColor: 'text-sky-400',
    bgGlow: 'hover:shadow-[0_0_20px_rgba(56,189,248,0.08)]',
  },
  github: {
    hoverBorder: 'hover:border-white/20',
    hoverBg: 'hover:bg-white/5',
    iconColor: 'text-white',
    bgGlow: 'hover:shadow-[0_0_20px_rgba(255,255,255,0.06)]',
  },
  tiktok: {
    hoverBorder: 'hover:border-teal-400/40',
    hoverBg: 'hover:bg-teal-400/5',
    iconColor: 'text-teal-400',
    bgGlow: 'hover:shadow-[0_0_20px_rgba(45,212,191,0.08)]',
  },
  discord: {
    hoverBorder: 'hover:border-indigo-500/40',
    hoverBg: 'hover:bg-indigo-500/5',
    iconColor: 'text-indigo-400',
    bgGlow: 'hover:shadow-[0_0_20px_rgba(99,102,241,0.08)]',
  },
  telegram: {
    hoverBorder: 'hover:border-sky-500/40',
    hoverBg: 'hover:bg-sky-500/5',
    iconColor: 'text-sky-400',
    bgGlow: 'hover:shadow-[0_0_20px_rgba(56,189,248,0.08)]',
  },
  website: {
    hoverBorder: 'hover:border-violet-500/40',
    hoverBg: 'hover:bg-violet-500/5',
    iconColor: 'text-violet-400',
    bgGlow: 'hover:shadow-[0_0_20px_rgba(139,92,246,0.08)]',
  }
};

async function trackVisit(userId, reqHeaders) {
  // Fire and forget logic
  try {
    const ip = reqHeaders.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
    const uaString = reqHeaders.get('user-agent');
    const referrer = reqHeaders.get('referrer') || reqHeaders.get('referer') || 'Direct';

    console.log(`[Analytics] Tracking visit for ${userId} from ${ip}`);

    // Debounce check: Get last visits from this IP
    // Simplified query to avoid composite index requirement (profileId + ip + timestamp)
    const existingVisits = await adminDb.collection('analytics')
      .where('profileId', '==', userId)
      .where('ip', '==', ip)
      .limit(5) // Get last few to check in memory
      .get();

    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000).toISOString();
    const hasRecentVisit = existingVisits.docs.some(doc => {
      const data = doc.data();
      return data.timestamp >= thirtySecondsAgo;
    });

    if (hasRecentVisit) {
      console.log(`[Analytics] Debouncing visit from ${ip} (last 30s)`);
      return;
    }

    const parser = new UAParser(uaString);
    const browser = parser.getBrowser().name || 'Unknown';
    const deviceType = parser.getDevice().type || (uaString?.includes('Mobi') ? 'mobile' : 'desktop');
    
    // GeoIP - Use Vercel headers if available
    const country = reqHeaders.get('x-vercel-ip-country') || 'Unknown';

    const analyticsData = {
      profileId: userId,
      country,
      deviceType,
      browser,
      referrer,
      ip,
      timestamp: new Date().toISOString()
    };

    await adminDb.collection('analytics').add(analyticsData);
    console.log('[Analytics] Visit recorded successfully');
  } catch (error) {
    console.error('[Analytics] Tracking error:', error);
  }
}

export default async function ProfilePage({ params }) {
  const { username } = await params;
  
  const snapshot = await adminDb.collection('users')
    .where('username', '==', username.toLowerCase())
    .limit(1)
    .get();

  if (snapshot.empty) {
    notFound();
  }

  const userDoc = snapshot.docs[0];
  const user = userDoc.data();

  if (!user.isPublic) {
    notFound();
  }

  // Tracking (Non-blocking)
  trackVisit(userDoc.id, await headers());

  return (
    <div className="min-h-screen bg-[#060608] text-white selection:bg-violet-500/30 flex flex-col items-center justify-center p-4 relative overflow-x-hidden">
      {/* Layered Ambient Mesh Glows */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Top center/left purple blob */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[50%] rounded-full bg-violet-600/10 blur-[130px] opacity-70 animate-pulse duration-[8s]" />
        {/* Bottom right blue blob */}
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[50%] rounded-full bg-cyan-600/10 blur-[130px] opacity-60 animate-pulse duration-[12s]" />
        {/* Middle pink/fuchsia blob */}
        <div className="absolute top-[30%] right-[-20%] w-[40%] h-[40%] rounded-full bg-fuchsia-600/5 blur-[100px] opacity-40" />
        {/* Subtle grid pattern for texture */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      <main className="w-full max-w-[440px] sm:max-w-[680px] px-2 py-8 sm:py-12 flex flex-col items-center animate-entrance">
        {/* Floating Glass Profile Card */}
        <div className="w-full bg-[#0d0d12]/40 border border-white/5 backdrop-blur-3xl rounded-[2.5rem] p-6 sm:p-8 flex flex-col items-center shadow-[0_32px_64px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.05)] relative overflow-hidden">
          {/* Card light sweep at the top */}
          <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          {/* Avatar with luxury border glow */}
          <div className="relative w-28 h-28 rounded-full p-[2px] bg-gradient-to-tr from-violet-500 via-fuchsia-500 to-cyan-500 mb-5 group shadow-xl">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-violet-500 via-fuchsia-500 to-cyan-500 blur-md opacity-40 group-hover:opacity-75 transition-opacity duration-500" />
            <div className="relative w-full h-full rounded-full bg-[#0d0d12] flex items-center justify-center text-3xl font-extrabold overflow-hidden border border-white/10">
              {user.image ? (
                <img 
                  src={`${user.image}?t=${new Date().getTime()}`} 
                  alt={user.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
              ) : (
                <span className="bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent">
                  {user.name ? user.name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </div>

          {/* Name & Username */}
          <h1 className="text-2xl font-black tracking-tight text-white mb-1 text-center bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
            {user.name || `@${user.username}`}
          </h1>
          <span className="text-[11px] font-bold tracking-[0.2em] text-violet-400/80 uppercase bg-violet-400/5 border border-violet-400/10 px-3 py-0.5 rounded-full mb-4">
            @{user.username}
          </span>

          {/* Bio */}
          {user.bio && (
            <p className="text-white/60 text-sm text-center mb-6 leading-relaxed max-w-xs font-medium">
              {user.bio}
            </p>
          )}

          {/* Birthday Tag */}
          {user.showDob && user.dob && (
            <div className="flex items-center gap-2 text-xs font-semibold text-white/75 bg-white/[0.03] hover:bg-white/[0.06] px-3.5 py-1.5 rounded-full border border-white/5 shadow-inner transition-colors mb-6 select-none">
              <Cake className="w-3.5 h-3.5 text-rose-400" />
              <span>{new Date(user.dob).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
          )}

          {/* Social Links List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            {(user.socialLinks || []).map((link, index) => {
              const Icon = SOCIAL_ICONS[link.platform] || SOCIAL_ICONS.website;
              const brand = BRAND_STYLES[link.platform] || BRAND_STYLES.website;
              const isLastAndOdd = index === (user.socialLinks || []).length - 1 && (user.socialLinks || []).length % 2 !== 0;
              return (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group relative flex items-center justify-between w-full p-3.5 bg-white/[0.01] border border-white/5 rounded-2xl transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.99] ${brand.hoverBorder} ${brand.hoverBg} ${brand.bgGlow} ${isLastAndOdd ? 'sm:col-span-2' : ''}`}
                >
                  <div className="flex items-center gap-3.5 relative z-10">
                    <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5 group-hover:bg-white/[0.05] group-hover:scale-105 transition-all duration-300">
                      <Icon className={`w-5 h-5 transition-colors duration-300 ${brand.iconColor}`} />
                    </div>
                    <span className="font-semibold text-sm tracking-wide text-white/80 group-hover:text-white transition-colors capitalize">
                      {link.platform === 'website' ? 'My Website' : link.platform}
                    </span>
                  </div>
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/[0.02] border border-white/5 opacity-0 group-hover:opacity-100 group-hover:bg-white/[0.05] transition-all duration-300 relative z-10">
                    <ChevronRight className="w-4 h-4 text-white/60 group-hover:translate-x-0.5 transition-transform duration-300" />
                  </div>
                </a>
              );
            })}
            
            {(user.socialLinks || []).length === 0 && (
              <p className="text-center text-white/40 text-xs font-semibold py-8 border border-dashed border-white/5 rounded-2xl w-full sm:col-span-2">
                No links added yet.
              </p>
            )}
          </div>

          {/* Get Your Own CTA */}
          <div className="w-full mt-8">
            <Link href="/signup" className="block relative p-[1px] rounded-3xl bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-cyan-500/10 hover:from-violet-500/20 hover:via-fuchsia-500/20 hover:to-cyan-500/20 transition-all duration-500 group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600/25 via-fuchsia-600/25 to-cyan-600/25 blur-[15px] opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
              
              <div className="relative rounded-[23px] bg-white/[0.02] hover:bg-white/[0.03] backdrop-blur-2xl p-6 text-center overflow-hidden border border-white/5 transition-colors duration-300">
                <div className="relative z-10 flex flex-col items-center">
                  {/* Glowing custom V badge */}
                  <div className="w-10 h-10 rounded-full p-[1.5px] bg-gradient-to-tr from-violet-500 via-fuchsia-500 to-cyan-500 mb-3 shadow-lg shadow-violet-500/10 group-hover:scale-105 transition-transform duration-500">
                    <div className="w-full h-full rounded-full bg-[#0d0d12] flex items-center justify-center text-white text-[10px] font-black">
                      V
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-white mb-1.5 tracking-tight">
                    Create Your Link-in-Bio
                  </h3>
                  <p className="text-[11px] text-white/40 mb-4 max-w-[220px] mx-auto leading-relaxed">
                    Join Viewi to build a gorgeous, high-converting social hub page like this.
                  </p>

                  <div className="inline-flex items-center gap-1.5 px-5 py-2 bg-white text-black rounded-full font-extrabold text-[10px] uppercase tracking-wider hover:bg-white/95 active:scale-95 shadow-lg shadow-white/5 transition-all duration-300">
                    Claim Your Page <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Fading Gradient Divider Line */}
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent my-6" />

          {/* Powered by & Links Footer */}
          <footer className="w-full text-center space-y-3">
            <Link href="/" className="inline-flex items-center gap-2 text-white/35 hover:text-white transition-colors group/footer">
              <span className="text-[9px] uppercase tracking-[0.25em] font-extrabold">Powered by</span>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-gradient-to-tr from-violet-600 to-fuchsia-600 rounded flex items-center justify-center text-white text-[8px] font-black group-hover/footer:rotate-6 transition-transform shadow-md shadow-violet-500/10">
                  V
                </div>
                <span className="font-black text-xs text-white/70 tracking-tight group-hover/footer:text-white transition-colors">Viewi</span>
              </div>
            </Link>
            
            <div className="flex items-center justify-center gap-3.5 text-[8.5px] font-bold uppercase tracking-widest text-white/20">
              <Link href="/privacy" className="hover:text-white/50 transition-colors">Privacy</Link>
              <span className="text-white/10">•</span>
              <Link href="/terms" className="hover:text-white/50 transition-colors">Terms</Link>
              <span className="text-white/10">•</span>
              <span>&copy; {new Date().getFullYear()}</span>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
