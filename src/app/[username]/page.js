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
  Cake
} from 'lucide-react';
import { UAParser } from 'ua-parser-js';
// geoip-lite removed to use Vercel geolocation headers

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
};

async function trackVisit(userId, reqHeaders) {
  // Fire and forget logic
  try {
    const ip = reqHeaders.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
    const uaString = reqHeaders.get('user-agent');
    const referrer = reqHeaders.get('referrer') || reqHeaders.get('referer') || 'Direct';

    // 30s Debounce check
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);
    const existingVisits = await adminDb.collection('analytics')
      .where('profileId', '==', userId)
      .where('ip', '==', ip)
      .where('timestamp', '>=', thirtySecondsAgo.toISOString()) // Basic string compare if iso
      .limit(1)
      .get();

    if (!existingVisits.empty) return;

    const parser = new UAParser(uaString);
    const browser = parser.getBrowser().name || 'Unknown';
    const deviceType = parser.getDevice().type || (uaString?.includes('Mobi') ? 'mobile' : 'desktop');
    
    // GeoIP - Use Vercel headers if available
    const country = reqHeaders.get('x-vercel-ip-country') || 'Unknown';

    await adminDb.collection('analytics').add({
      profileId: userId,
      country,
      deviceType,
      browser,
      referrer,
      ip,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Analytics tracking error:', error);
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
          {user.socialLinks.map((link, index) => {
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
          
          {user.socialLinks.length === 0 && (
            <p className="text-center text-muted-foreground">No links added yet.</p>
          )}
        </div>

        <footer className="mt-20 pt-10 border-t border-white/5 w-full text-center">
          <div className="inline-flex items-center gap-2 text-muted-foreground hover:text-white transition-colors">
            <span className="text-sm">Built with</span>
            <span className="font-bold flex items-center gap-1">
              <span className="w-5 h-5 bg-violet-600 rounded flex items-center justify-center text-white text-[10px]">V</span>
              Viewi
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
}
