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
    <div className="space-y-5">
      {/* Welcome Card */}
      <div className="glass-card p-4 sm:p-5 md:p-6 rounded-[1.5rem] sm:rounded-[2rem] relative overflow-hidden mesh-gradient border-white/10 group">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 mb-3 group-hover:bg-primary/20 transition-colors">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest text-primary-foreground/80">Active Session</span>
          </div>
          
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight mb-1.5 text-white leading-tight">
            Welcome back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent drop-shadow-sm">{user.name || user.username}</span>!
          </h2>
          
          <p className="text-xs sm:text-sm text-white/70 mb-5 leading-relaxed max-w-md">
            Your identity platform is <span className={cn("px-1.5 py-0.5 rounded font-bold text-[10px] sm:text-xs", user.isPublic ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400")}>
            {user?.isPublic ? 'Public' : 'Private'}
            </span>. You've reached <span className="text-white font-bold">{data?.totalViews || 0}</span> total views.
          </p>

          <div className="flex flex-wrap gap-2.5">
            <Link href="/dashboard/profile" className="btn-premium !h-9 !px-4 !rounded-lg !text-xs">
              Customize Profile
            </Link>
            <a 
              href={profileUrl} 
              target="_blank" 
              className="px-4 h-9 inline-flex items-center justify-center rounded-lg border border-white/10 hover:bg-white/5 text-xs font-bold transition-all gap-1.5 group/btn text-white"
            >
              Live Preview <ExternalLink className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform text-white/60 group-hover/btn:text-white" />
            </a>
          </div>
        </div>
        
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] opacity-40 group-hover:opacity-60 transition-opacity translate-x-1/4 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full blur-[60px] opacity-30 -translate-x-1/4 translate-y-1/4" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Columns (Stats + Device Breakdown) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Quick Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Total Views Stats Card */}
            <div className="glass-card p-4 sm:p-5 rounded-[1.5rem] flex items-center justify-between group premium-glow hover:translate-y-[-2px] transition-all duration-300 relative overflow-hidden bg-white/[0.01] border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-all group-hover:scale-105 border border-primary/20 flex items-center justify-center shrink-0">
                  <Eye className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Total Views</p>
                  <h3 className="text-2xl font-black mt-0.5 text-white tabular-nums">{data?.totalViews?.toLocaleString() || '0'}</h3>
                </div>
              </div>
              <Link href="/dashboard/analytics" className="p-2 rounded-lg hover:bg-white/10 transition-colors shrink-0">
                <ArrowUpRight className="w-4 h-4 text-white/30 hover:text-white transition-colors" />
              </Link>
            </div>

            {/* Unique Visitors Stats Card */}
            <div className="glass-card p-4 sm:p-5 rounded-[1.5rem] flex items-center justify-between group premium-glow hover:translate-y-[-2px] transition-all duration-300 relative overflow-hidden bg-white/[0.01] border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-accent/10 rounded-xl group-hover:bg-accent/20 transition-all group-hover:scale-105 border border-accent/20 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Unique Visitors</p>
                  <h3 className="text-2xl font-black mt-0.5 text-white tabular-nums">{data?.uniqueVisitors?.toLocaleString() || '0'}</h3>
                </div>
              </div>
              <Link href="/dashboard/analytics" className="p-2 rounded-lg hover:bg-white/10 transition-colors shrink-0">
                <ArrowUpRight className="w-4 h-4 text-white/30 hover:text-white transition-colors" />
              </Link>
            </div>

          </div>

          {/* Device Breakdown List */}
          <div className="glass-card p-4 sm:p-5 rounded-[1.5rem] bg-white/[0.01] border-white/5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold tracking-tight text-white">Access by Device</h3>
              <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-muted-foreground">Live Data</span>
            </div>
            <div className="space-y-4">
              {data?.devices?.map((device) => {
                const percentage = Math.round((device.value / (data?.totalViews || 1)) * 100) || 0;
                return (
                  <div key={device.name} className="group">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          device.name === 'desktop' ? 'bg-primary' : 'bg-accent'
                        )} />
                        <span className="text-xs font-bold capitalize text-white/80 group-hover:text-white transition-colors">{device.name}</span>
                      </div>
                      <span className="text-[11px] font-bold text-muted-foreground tabular-nums">{percentage}%</span>
                    </div>
                    <div className="w-full bg-white/[0.02] h-1.5 rounded-full overflow-hidden border border-white/[0.05]">
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
                <div className="text-center py-6 border border-dashed border-white/10 rounded-xl">
                  <p className="text-muted-foreground text-xs">No device traffic recorded yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (Quick Share) */}
        <div className="lg:col-span-1">
          <div className="glass-card p-4 sm:p-5 rounded-[1.5rem] sticky top-24 border-white/5 bg-white/[0.01] shadow-2xl group">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="p-2 bg-primary/10 border border-primary/20 rounded-lg group-hover:scale-105 transition-transform flex items-center justify-center shrink-0">
                <Share2 className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-sm font-bold tracking-tight text-white">Quick Share</h3>
            </div>
            
            <div className="relative group-hover:scale-[1.01] transition-transform duration-500 max-w-[240px] mx-auto">
              <QRCodeDisplay url={profileUrl} avatarUrl={user?.image} />
            </div>
            
            <p className="mt-5 text-[10px] text-center text-muted-foreground leading-relaxed">
              Scan this code to instantly access your public profile identity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
