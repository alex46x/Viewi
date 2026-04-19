'use client';

import { useState, useEffect } from 'react';
import { 
  Eye, 
  Users, 
  ArrowUpRight, 
  Loader2,
  ExternalLink,
  Share2
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import QRCodeDisplay from '@/components/QRCodeDisplay';

export default function DashboardHome() {
  const [data, setData] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [profileUrl, setProfileUrl] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/analytics').then(res => res.json()),
      fetch('/api/profile').then(res => res.json())
    ]).then(([analytics, profile]) => {
      setData(analytics);
      setUser(profile);
      setProfileUrl(`${window.location.origin}/${profile.username}`);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="space-y-10">
      {/* Welcome Card */}
      <div className="glass-card p-10 rounded-[2.5rem] relative overflow-hidden mesh-gradient border-white/10 group">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-6 group-hover:bg-primary/20 transition-colors">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground/80">Active Session</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-white leading-tight">
            Welcome back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent drop-shadow-sm">{user.name || user.username}</span>!
          </h2>
          
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-lg">
            Your identity platform is <span className={cn("px-2 py-0.5 rounded-md font-bold", user.isPublic ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400")}>
            {user?.isPublic ? 'Public' : 'Private'}
            </span>. You've reached <span className="text-white font-bold">{data?.totalViews || 0}</span> total views.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link href="/dashboard/profile" className="btn-premium">
              Customize Profile
            </Link>
            <a 
              href={profileUrl} 
              target="_blank" 
              className="px-8 h-12 inline-flex items-center justify-center rounded-xl border border-white/10 hover:bg-white/5 text-sm font-bold transition-all gap-2 group/btn"
            >
              Live Preview <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
            </a>
          </div>
        </div>
        
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-[100px] opacity-40 group-hover:opacity-60 transition-opacity translate-x-1/4 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-[80px] opacity-30 -translate-x-1/4 translate-y-1/4" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Stats */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-8 rounded-3xl flex flex-col justify-between group premium-glow">
            <div className="flex justify-between items-start mb-10">
              <div className="p-4 bg-primary/10 rounded-2xl group-hover:bg-primary/20 transition-all group-hover:scale-110 border border-primary/20">
                <Eye className="w-7 h-7 text-primary" />
              </div>
              <Link href="/dashboard/analytics" className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                <ArrowUpRight className="w-5 h-5 text-muted-foreground" />
              </Link>
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">Total Views</p>
              <h3 className="text-5xl font-black mt-2 text-white tabular-nums">{data?.totalViews?.toLocaleString() || '0'}</h3>
            </div>
          </div>

          <div className="glass-card p-8 rounded-3xl flex flex-col justify-between group premium-glow">
            <div className="flex justify-between items-start mb-10">
              <div className="p-4 bg-accent/10 rounded-2xl group-hover:bg-accent/20 transition-all group-hover:scale-110 border border-accent/20">
                <Users className="w-7 h-7 text-accent" />
              </div>
              <Link href="/dashboard/analytics" className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                <ArrowUpRight className="w-5 h-5 text-muted-foreground" />
              </Link>
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">Unique Visitors</p>
              <h3 className="text-5xl font-black mt-2 text-white tabular-nums">{data?.uniqueVisitors?.toLocaleString() || '0'}</h3>
            </div>
          </div>

          {/* Device Breakdown List */}
          <div className="md:col-span-2 glass-card p-8 rounded-3xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold tracking-tight">Access by Device</h3>
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-white/5 border border-white/10 rounded-md text-muted-foreground">Live Data</span>
            </div>
            <div className="space-y-6">
              {data?.devices?.map((device) => {
                const percentage = Math.round((device.value / (data?.totalViews || 1)) * 100) || 0;
                return (
                  <div key={device.name} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          device.name === 'desktop' ? 'bg-primary' : 'bg-accent'
                        )} />
                        <span className="text-sm font-bold capitalize text-white/80 group-hover:text-white transition-colors">{device.name}</span>
                      </div>
                      <span className="text-xs font-bold text-muted-foreground tabular-nums">{percentage}%</span>
                    </div>
                    <div className="w-full bg-white/[0.03] h-2 rounded-full overflow-hidden border border-white/[0.05]">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-1000 ease-out",
                          device.name === 'desktop' ? 'bg-primary' : 'bg-accent'
                        )} 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {(!data?.devices || data?.devices?.length === 0) && (
                <div className="text-center py-10 border border-dashed border-white/10 rounded-2xl">
                  <p className="text-muted-foreground text-sm">No device traffic recorded yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Share Card */}
        <div className="lg:col-span-1">
          <div className="glass-card p-8 rounded-[2.5rem] sticky top-28 border-primary/20 shadow-2xl shadow-primary/5 group">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 group-hover:scale-110 transition-transform">
                <Share2 className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-bold tracking-tight">Quick Share</h3>
            </div>
            
            <div className="relative group-hover:scale-[1.02] transition-transform duration-500">
              <QRCodeDisplay url={profileUrl} />
            </div>
            
            <p className="mt-8 text-xs text-center text-muted-foreground leading-relaxed">
              Scan this code to instantly access your public profile identity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
