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
  ExternalLink,
  Cake,
  ArrowRight,
  Send
} from 'lucide-react';
import Link from 'next/link';
import { UAParser } from 'ua-parser-js';
// geoip-lite removed to use Vercel geolocation headers

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
    <div className="min-h-screen bg-[#09090b] text-white selection:bg-blue-500/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-[#09090b] to-[#09090b]" />

      <main className="max-w-xl mx-auto px-6 pt-24 pb-20 flex flex-col items-center">
        {/* Profile Header */}
        <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-violet-500 to-fuchsia-500 mb-6 shadow-2xl shadow-violet-500/20 overflow-hidden">
          <div className="w-full h-full rounded-full bg-[#09090b] flex items-center justify-center text-4xl font-bold overflow-hidden">
            {user.image ? (
              <img 
                src={`${user.image}?t=${new Date().getTime()}`} 
                alt={user.name} 
                className="w-full h-full object-cover" 
              />
            ) : (
              user.name ? user.name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()
            )}
          </div>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight mb-2">
          {user.name || `@${user.username}`}
        </h1>
        
        {user.bio && (
          <p className="text-muted-foreground text-center mb-6 leading-relaxed">
            {user.bio}
          </p>
        )}

        {user.showDob && user.dob && (
          <div className="flex items-center gap-2 text-sm text-violet-400 bg-violet-500/10 px-4 py-1.5 rounded-full border border-violet-500/20 mb-8">
            <Cake className="w-4 h-4" />
            {new Date(user.dob).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        )}

        {/* Social Links List */}
        <div className="w-full space-y-4">
          {(user.socialLinks || []).map((link, index) => {
            const Icon = SOCIAL_ICONS[link.platform] || SOCIAL_ICONS.website;
            return (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center justify-between w-full p-4 glass rounded-2xl border border-white/5 hover:border-blue-500/50 hover:bg-white/5 transition-all duration-300 transform hover:-translate-y-1 active:scale-[0.98]"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-white/5 group-hover:bg-violet-500/10 transition-colors">
                    <Icon className="w-6 h-6 group-hover:text-violet-400 transition-colors" />
                  </div>
                  <span className="font-semibold text-lg capitalize">{link.platform === 'website' ? 'My Website' : link.platform}</span>
                </div>
                <ExternalLink className="w-5 h-5 opacity-0 group-hover:opacity-40 transition-opacity" />
              </a>
            );
          })}
          
          {(user.socialLinks || []).length === 0 && (
            <p className="text-center text-muted-foreground text-sm font-medium">No links added yet.</p>
          )}
        </div>

        {/* Get Your Own CTA */}
        <div className="w-full mt-12 animate-entrance" style={{ animationDelay: '400ms' }}>
          <Link href="/signup" className="block p-1 rounded-[2rem] bg-gradient-to-r from-violet-500/20 via-fuchsia-500/20 to-violet-500/20 hover:scale-[1.02] transition-all duration-500 group">
            <div className="glass-liquid rounded-[1.8rem] p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-violet-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <h3 className="text-xl font-black text-white mb-2 tracking-tight group-hover:translate-y-[-2px] transition-transform duration-500">
                  Get Your Own Profile
                </h3>
                <p className="text-sm text-white/60 mb-6 group-hover:text-white/80 transition-colors duration-500">
                  Join Viewi and showcase your identity with a premium link-in-bio page like this.
                </p>
                
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-bold text-sm hover:bg-violet-50 transition-all active:scale-95 shadow-xl shadow-white/10">
                  Create Your Link <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-violet-600/20 blur-3xl rounded-full" />
              <div className="absolute -top-10 -left-10 w-32 h-32 bg-fuchsia-600/10 blur-3xl rounded-full" />
            </div>
          </Link>
        </div>

        <footer className="mt-16 pt-10 border-t border-white/5 w-full text-center space-y-6">
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-white transition-colors group/footer">
            <span className="text-xs uppercase tracking-[0.2em] font-bold">Built with</span>
            <span className="font-black flex items-center gap-1.5 text-lg">
              <div className="w-6 h-6 bg-violet-600 rounded-lg flex items-center justify-center text-white text-[10px] shadow-lg shadow-violet-600/20 group-hover/footer:rotate-12 transition-transform">V</div>
              Viewi
            </span>
          </Link>
          
          <div className="flex items-center justify-center gap-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <span>&copy; 2026</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
