'use client';

import { useState, useEffect } from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Loader2, 
  Users, 
  Eye, 
  MousePointer2, 
  Globe, 
  Search, 
  Laptop, 
  Smartphone, 
  Tablet, 
  Chrome, 
  Compass, 
  ChevronDown, 
  ChevronUp, 
  Link2, 
  Calendar, 
  Activity, 
  MapPin 
} from 'lucide-react';

// Helper to translate country codes to flags and names
const getCountryNameAndFlag = (code) => {
  if (!code || code === 'Unknown') return { name: 'International / Proxy', flag: '🌐' };
  
  const countriesMap = {
    'BD': { name: 'Bangladesh', flag: '🇧🇩' },
    'US': { name: 'United States', flag: '🇺🇸' },
    'IN': { name: 'India', flag: '🇮🇳' },
    'GB': { name: 'United Kingdom', flag: '🇬🇧' },
    'CA': { name: 'Canada', flag: '🇨🇦' },
    'DE': { name: 'Germany', flag: '🇩🇪' },
    'FR': { name: 'France', flag: '🇫🇷' },
    'AU': { name: 'Australia', flag: '🇦🇺' },
    'SG': { name: 'Singapore', flag: '🇸🇬' },
    'JP': { name: 'Japan', flag: '🇯🇵' },
    'AE': { name: 'United Arab Emirates', flag: '🇦🇪' },
    'PK': { name: 'Pakistan', flag: '🇵🇰' },
    'MY': { name: 'Malaysia', flag: '🇲🇾' },
  };
  
  return countriesMap[code.toUpperCase()] || { name: code, flag: '📍' };
};

// Helper for Browser Icons & colors
const getBrowserIcon = (browserName) => {
  const name = browserName?.toLowerCase() || '';
  if (name.includes('chrome')) return { icon: Chrome, color: 'text-amber-400' };
  if (name.includes('safari')) return { icon: Compass, color: 'text-blue-400' };
  if (name.includes('firefox')) return { icon: Globe, color: 'text-orange-500' };
  if (name.includes('edge')) return { icon: Compass, color: 'text-teal-400' };
  if (name.includes('opera')) return { icon: Globe, color: 'text-red-500' };
  return { icon: Globe, color: 'text-zinc-400' };
};

// Helper for Referrer sources details
const getReferrerDetails = (referrerName) => {
  const name = referrerName?.toLowerCase() || '';
  if (name === 'direct') return { label: 'Direct Traffic', color: 'bg-zinc-500/10 text-zinc-300 border-zinc-500/25', icon: MousePointer2 };
  if (name.includes('github')) return { label: 'GitHub', color: 'bg-zinc-850 text-white border-zinc-700', icon: Globe };
  if (name.includes('linkedin')) return { label: 'LinkedIn', color: 'bg-blue-600/10 text-blue-400 border-blue-500/20', icon: Globe };
  if (name.includes('t.co') || name.includes('twitter') || name.includes('x.com')) return { label: 'X / Twitter', color: 'bg-sky-500/10 text-sky-400 border-sky-500/20', icon: Globe };
  if (name.includes('google')) return { label: 'Google Search', color: 'bg-green-500/10 text-green-400 border-green-500/20', icon: Search };
  if (name.includes('facebook') || name.includes('fb')) return { label: 'Facebook', color: 'bg-blue-600/10 text-blue-400 border-blue-500/20', icon: Globe };
  
  return { label: referrerName, color: 'bg-primary/10 text-primary border-primary/20', icon: Link2 };
};

// Helper for Device Types
const getDeviceDetails = (deviceType) => {
  const type = deviceType?.toLowerCase() || '';
  if (type === 'mobile') return { label: 'Mobile', icon: Smartphone, color: '#8b5cf6' };
  if (type === 'tablet') return { label: 'Tablet', icon: Tablet, color: '#a855f7' };
  return { label: 'Desktop', icon: Laptop, color: '#6366f1' };
};

// Helper for relative time formatting
const getRelativeTime = (timestamp) => {
  if (!timestamp) return 'Just now';
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  
  if (diffMins < 1) return 'Just now';
  if (diffMins === 1) return '1 min ago';
  if (diffMins < 60) return `${diffMins} mins ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours === 1) return '1 hour ago';
  if (diffHours < 24) return `${diffHours} hours ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return '1 day ago';
  return `${diffDays} days ago`;
};

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d'); // '7d' | '30d' | 'all'
  const [showLogs, setShowLogs] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAnalytics(period);
  }, [period]);

  const fetchAnalytics = async (selectedPeriod) => {
    try {
      const res = await fetch(`/api/analytics?period=${selectedPeriod}`);
      const json = await res.json();
      if (res.ok) {
        setData(json);
      }
    } catch (err) {
      console.error('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  // Custom Tooltip component for Recharts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 rounded-xl border border-white/10 shadow-2xl backdrop-blur-md bg-zinc-950/90 relative z-50">
          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-primary" />
            {new Date(label).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
          <div className="flex items-center gap-1.5 text-xs">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
            <span className="font-semibold text-white/80">Views:</span>
            <span className="font-black text-primary tabular-nums">
              {payload[0].value.toLocaleString()}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading && !data) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  // Filter recent activity logs based on search query
  const filteredLogs = data?.recentLogs?.filter(log => {
    const query = searchQuery.toLowerCase();
    const country = getCountryNameAndFlag(log.country).name.toLowerCase();
    const browser = log.browser.toLowerCase();
    const referrer = log.referrer.toLowerCase();
    const ip = log.ip.toLowerCase();
    const device = getDeviceDetails(log.deviceType).label.toLowerCase();
    
    return country.includes(query) || 
           browser.includes(query) || 
           referrer.includes(query) || 
           ip.includes(query) ||
           device.includes(query);
  }) || [];

  return (
    <div className="space-y-6 animate-entrance">
      
      {/* Sleek Smart Header - Wrap neatly on small screens */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Traffic Insights</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Live tracking synchronized
            </span>
          </div>
        </div>

        {/* Capsule Segmented Period Picker */}
        <div className="flex bg-white/[0.03] border border-white/5 rounded-full p-0.5 self-start sm:self-auto shadow-inner shadow-black/40">
          {[
            { id: '7d', label: '7 Days' },
            { id: '30d', label: '30 Days' },
            { id: 'all', label: 'All Time' }
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setPeriod(opt.id)}
              className={`px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-black tracking-wide transition-all duration-300 ${
                period === opt.id 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' 
                  : 'text-muted-foreground hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Slim & Premium Horizontal Metrics Grid - Optimized Padding for Mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Metric 1: Lifetime Views */}
        <div className="glass-card p-3 sm:p-4 rounded-2xl flex items-center justify-between border-white/5 premium-glow relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
          <div className="relative z-10 min-w-0">
            <p className="text-[8px] sm:text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-0.5 truncate">Lifetime Views</p>
            <h3 className="text-xl sm:text-2xl font-black text-white tabular-nums tracking-tight truncate">{data?.totalViews?.toLocaleString() || '0'}</h3>
          </div>
          <div className="p-2 sm:p-2.5 bg-primary/10 rounded-xl border border-primary/25 relative z-10 shrink-0 ml-1.5">
            <Eye className="w-4 h-4 sm:w-5 h-5 text-primary" />
          </div>
          <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
        </div>

        {/* Metric 2: Lifetime Uniques */}
        <div className="glass-card p-3 sm:p-4 rounded-2xl flex items-center justify-between border-white/5 premium-glow relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
          <div className="relative z-10 min-w-0">
            <p className="text-[8px] sm:text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-0.5 truncate">Lifetime Users</p>
            <h3 className="text-xl sm:text-2xl font-black text-white tabular-nums tracking-tight truncate">{data?.uniqueVisitors?.toLocaleString() || '0'}</h3>
          </div>
          <div className="p-2 sm:p-2.5 bg-accent/10 rounded-xl border border-accent/25 relative z-10 shrink-0 ml-1.5">
            <Users className="w-4 h-4 sm:w-5 h-5 text-accent" />
          </div>
          <div className="absolute top-0 right-0 w-20 h-20 bg-accent/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
        </div>

        {/* Metric 3: Active Period Views */}
        <div className="glass-card p-3 sm:p-4 rounded-2xl flex items-center justify-between border-white/5 premium-glow relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
          <div className="relative z-10 min-w-0">
            <p className="text-[8px] sm:text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-0.5 truncate">Period Sessions</p>
            <h3 className="text-xl sm:text-2xl font-black text-white tabular-nums tracking-tight truncate">{data?.periodViews?.toLocaleString() || '0'}</h3>
          </div>
          <div className="p-2 sm:p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/25 relative z-10 shrink-0 ml-1.5">
            <Activity className="w-4 h-4 sm:w-5 h-5 text-indigo-400" />
          </div>
          <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
        </div>

        {/* Metric 4: Period Engagement Ratio */}
        <div className="glass-card p-3 sm:p-4 rounded-2xl flex items-center justify-between border-white/5 premium-glow relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
          <div className="relative z-10 min-w-0">
            <p className="text-[8px] sm:text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-0.5 truncate">Engagement Rate</p>
            <h3 className="text-xl sm:text-2xl font-black text-white tabular-nums tracking-tight truncate">
              {data?.periodViews > 0 ? ((data.periodUniqueVisitors / data.periodViews) * 100).toFixed(1) : 0}%
            </h3>
          </div>
          <div className="p-2 sm:p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/25 relative z-10 shrink-0 ml-1.5">
            <MousePointer2 className="w-4 h-4 sm:w-5 h-5 text-emerald-400" />
          </div>
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
        </div>
      </div>

      {/* Main Trends Chart Card */}
      <div className="glass-card p-4 sm:p-6 rounded-[2rem] border-white/5 shadow-2xl relative">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight">Visitor Trends</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">Daily profile traffic activity overview</p>
          </div>
          
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.02] border border-white/5">
             <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
             <span className="text-[8px] sm:text-[9px] font-black tracking-widest uppercase text-muted-foreground">
               {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : 'Full Range'}
             </span>
          </div>
        </div>

        {/* Glow-enhanced Line Chart Area */}
        <div className="h-[240px] sm:h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.dailyVisits || []} margin={{ top: 10, right: 5, left: -30, bottom: 0 }}>
              <defs>
                <filter id="glow-purple" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#8b5cf6" floodOpacity="0.4" />
                </filter>
                <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.025)" />
              <XAxis 
                dataKey="date" 
                stroke="rgba(255,255,255,0.25)" 
                fontSize={8} 
                fontWeight={800}
                tickLine={false} 
                axisLine={false}
                dy={10}
                minTickGap={40} // Prevent overlapping date strings on smaller viewports
                tickFormatter={(str) => {
                  if (!str) return '';
                  const date = new Date(str);
                  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
                }}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.25)" 
                fontSize={8} 
                fontWeight={800}
                tickLine={false} 
                axisLine={false}
                allowDecimals={false}
                dx={-5}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(139, 92, 246, 0.15)', strokeWidth: 1 }} />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="#8b5cf6" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorVisits)" 
                filter="url(#glow-purple)"
                animationDuration={1000}
                dot={{ r: 2.5, fill: '#8b5cf6', strokeWidth: 1, stroke: '#09090b' }}
                activeDot={{ r: 4.5, fill: '#fff', stroke: '#8b5cf6', strokeWidth: 1.5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid of 4 compact widgets - 1 Column on mobile/tablet, 2 columns on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Widget 1: Geographic Reach */}
        <div className="glass-card p-5 sm:p-6 rounded-[2rem] border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-black text-white tracking-tight">Geographic Reach</h3>
                <p className="text-[11px] text-muted-foreground font-medium mt-0.5">Top audience source locations</p>
              </div>
              <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                <Globe className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
            
            <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
              {data?.countries?.slice(0, 5)?.map((country, index) => {
                const geo = getCountryNameAndFlag(country.name);
                const percentage = data?.periodViews > 0 ? (country.value / data.periodViews) * 100 : 0;
                
                return (
                  <div key={country.name} className="space-y-1.5 group">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white/80 group-hover:text-white transition-colors flex items-center gap-2 min-w-0">
                        <span className="text-base leading-none select-none shrink-0">{geo.flag}</span>
                        <span className="truncate max-w-[140px] sm:max-w-none">{geo.name}</span>
                      </span>
                      <span className="font-black text-muted-foreground tabular-nums flex items-center gap-1.5 shrink-0">
                        <span>{country.value}</span>
                        <span className="text-[10px] opacity-40 font-normal">({percentage.toFixed(0)}%)</span>
                      </span>
                    </div>
                    <div className="w-full bg-white/[0.02] rounded-full h-2 overflow-hidden border border-white/[0.03]">
                      <div 
                        className="bg-gradient-to-r from-primary/60 to-primary h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_8px_rgba(139,92,246,0.15)]" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {(!data?.countries || data?.countries?.length === 0) && (
                <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                  <p className="text-xs text-muted-foreground font-medium">Awaiting global traffic signals...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Widget 2: Referral Channels */}
        <div className="glass-card p-5 sm:p-6 rounded-[2rem] border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-black text-white tracking-tight">Referral Channels</h3>
                <p className="text-[11px] text-muted-foreground font-medium mt-0.5">Top external link traffic sources</p>
              </div>
              <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                <Link2 className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
            
            <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
              {data?.referrers?.slice(0, 5)?.map((referrer, index) => {
                const refDetails = getReferrerDetails(referrer.name);
                const RefIcon = refDetails.icon;
                const percentage = data?.periodViews > 0 ? (referrer.value / data.periodViews) * 100 : 0;
                
                return (
                  <div key={referrer.name} className="space-y-1.5 group">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white/80 group-hover:text-white transition-colors flex items-center gap-2 min-w-0">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${refDetails.color} flex items-center gap-1 min-w-0`}>
                          <RefIcon className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate max-w-[100px] sm:max-w-[160px]">{refDetails.label}</span>
                        </span>
                      </span>
                      <span className="font-black text-muted-foreground tabular-nums flex items-center gap-1.5 shrink-0">
                        <span>{referrer.value}</span>
                        <span className="text-[10px] opacity-40 font-normal">({percentage.toFixed(0)}%)</span>
                      </span>
                    </div>
                    <div className="w-full bg-white/[0.02] rounded-full h-2 overflow-hidden border border-white/[0.03]">
                      <div 
                        className="bg-gradient-to-r from-accent/60 to-accent h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_8px_rgba(245,158,11,0.15)]" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {(!data?.referrers || data?.referrers?.length === 0) && (
                <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                  <p className="text-xs text-muted-foreground font-medium">Direct URL traffic logs only...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Widget 3: Browser breakdown */}
        <div className="glass-card p-5 sm:p-6 rounded-[2rem] border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-black text-white tracking-tight">Browser Distribution</h3>
                <p className="text-[11px] text-muted-foreground font-medium mt-0.5">Most common client engines</p>
              </div>
              <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                <Chrome className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
            
            <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
              {data?.browsers?.slice(0, 5)?.map((browser, index) => {
                const bDetails = getBrowserIcon(browser.name);
                const BrowserIcon = bDetails.icon;
                const percentage = data?.periodViews > 0 ? (browser.value / data.periodViews) * 100 : 0;
                
                return (
                  <div key={browser.name} className="space-y-1.5 group">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white/80 group-hover:text-white transition-colors flex items-center gap-2 min-w-0">
                        <BrowserIcon className={`w-3.5 h-3.5 ${bDetails.color} shrink-0`} />
                        <span className="truncate max-w-[140px] sm:max-w-none">{browser.name}</span>
                      </span>
                      <span className="font-black text-muted-foreground tabular-nums flex items-center gap-1.5 shrink-0">
                        <span>{browser.value}</span>
                        <span className="text-[10px] opacity-40 font-normal">({percentage.toFixed(0)}%)</span>
                      </span>
                    </div>
                    <div className="w-full bg-white/[0.02] rounded-full h-2 overflow-hidden border border-white/[0.03]">
                      <div 
                        className="bg-gradient-to-r from-violet-500/60 to-violet-500 h-full rounded-full transition-all duration-700 ease-out" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {(!data?.browsers || data?.browsers?.length === 0) && (
                <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                  <p className="text-xs text-muted-foreground font-medium">Awaiting visitor agent signals...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Widget 4: System Ecosystem (Devices) */}
        <div className="glass-card p-5 sm:p-6 rounded-[2rem] border-white/5">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-base font-black text-white tracking-tight">System Ecosystem</h3>
              <p className="text-[11px] text-muted-foreground font-medium mt-0.5">Device type distribution breakdown</p>
            </div>
          </div>
          
          <div className="h-[180px] w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.devices || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                  animationDuration={800}
                  stroke="none"
                >
                  {data?.devices?.map((entry, index) => {
                    const dev = getDeviceDetails(entry.name);
                    return (
                      <Cell key={`cell-${index}`} fill={dev.color} />
                    );
                  })}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 15, 18, 0.95)', 
                    border: '1px solid rgba(255, 255, 255, 0.1)', 
                    borderRadius: '16px',
                    backdropFilter: 'blur(10px)'
                  }}
                  itemStyle={{ fontWeight: 700, fontSize: '11px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Elegant Center total badge */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-0.5">Total</span>
              <span className="text-2xl font-black text-white leading-none tabular-nums">{data?.periodViews || 0}</span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 pt-4 border-t border-white/[0.03]">
            {data?.devices?.map((device, index) => {
              const dev = getDeviceDetails(device.name);
              const DevIcon = dev.icon;
              return (
                <div key={device.name} className="flex items-center gap-1.5 group cursor-default">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dev.color }} />
                  <DevIcon className="w-3.5 h-3.5 text-muted-foreground group-hover:text-white transition-colors" />
                  <span className="text-[9px] uppercase font-black tracking-wider text-muted-foreground group-hover:text-white transition-colors">
                    {dev.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Expandable Activity Log Table */}
      <div className="glass-card rounded-[2rem] border-white/5 overflow-hidden transition-all duration-300">
        <button 
          onClick={() => setShowLogs(!showLogs)}
          className="w-full p-5 sm:p-6 flex items-center justify-between text-left focus:outline-none hover:bg-white/[0.01] transition-colors"
        >
          <div>
            <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2">
              <span>Detailed Activity Log</span>
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-black">
                {data?.recentLogs?.length || 0} recent
              </span>
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">Anonymized breakdown of active traffic sequences</p>
          </div>
          <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-muted-foreground hover:text-white transition-all duration-300">
            {showLogs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showLogs && (
          <div className="border-t border-white/[0.05] p-4 sm:p-6 space-y-4 animate-slideDown">
            {/* Log Search Filter */}
            <div className="relative max-w-sm">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search logs by IP, Country, Browser, Referrer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-zinc-950/60 border border-white/5 focus:border-primary/50 text-white placeholder-muted-foreground focus:outline-none transition-colors backdrop-blur-md"
              />
            </div>

            {/* Desktop Table Layout - Hidden on mobile, shown on tablet/desktop */}
            <div className="hidden md:block overflow-x-auto rounded-xl border border-white/5 bg-zinc-950/30">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/5 text-[9px] uppercase tracking-wider font-black text-muted-foreground">
                    <th className="py-3 px-4">Time</th>
                    <th className="py-3 px-4">Anonymized IP</th>
                    <th className="py-3 px-4">Country</th>
                    <th className="py-3 px-4">Referrer Source</th>
                    <th className="py-3 px-4">Environment</th>
                    <th className="py-3 px-4 text-right">Activity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {filteredLogs.map((log, index) => {
                    const geo = getCountryNameAndFlag(log.country);
                    const ref = getReferrerDetails(log.referrer);
                    const RefIcon = ref.icon;
                    const bDetails = getBrowserIcon(log.browser);
                    const BrowserIcon = bDetails.icon;
                    const dev = getDeviceDetails(log.deviceType);
                    const DevIcon = dev.icon;

                    return (
                      <tr key={index} className="hover:bg-white/[0.01] transition-colors group">
                        {/* Time */}
                        <td className="py-3.5 px-4 font-semibold text-white/80 tabular-nums">
                          {getRelativeTime(log.timestamp)}
                        </td>
                        {/* Masked IP */}
                        <td className="py-3.5 px-4 font-mono font-medium text-muted-foreground tracking-wide select-all tabular-nums">
                          {log.ip}
                        </td>
                        {/* Country */}
                        <td className="py-3.5 px-4">
                          <span className="flex items-center gap-1.5">
                            <span className="text-base select-none leading-none">{geo.flag}</span>
                            <span className="font-bold text-white/70">{geo.name}</span>
                          </span>
                        </td>
                        {/* Referrer */}
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold ${ref.color} max-w-[150px]`}>
                            <RefIcon className="w-3 h-3 shrink-0" />
                            <span className="truncate">{ref.label}</span>
                          </span>
                        </td>
                        {/* Environment */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1 text-muted-foreground group-hover:text-white transition-colors" title={`Browser: ${log.browser}`}>
                              <BrowserIcon className={`w-3.5 h-3.5 ${bDetails.color}`} />
                              <span className="text-[10px] font-bold">{log.browser.split(' ')[0]}</span>
                            </span>
                            <span className="flex items-center gap-1 text-muted-foreground group-hover:text-white transition-colors" title={`Device: ${dev.label}`}>
                              <DevIcon className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-bold">{dev.label}</span>
                            </span>
                          </div>
                        </td>
                        {/* Status/Activity */}
                        <td className="py-3.5 px-4 text-right">
                          <span className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                            Visits Page
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-muted-foreground font-medium bg-white/[0.01]">
                        No matching activity logs found. Try tweaking your query!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Card Feed Layout - Shown on mobile, hidden on tablet/desktop */}
            <div className="block md:hidden space-y-3">
              {filteredLogs.map((log, index) => {
                const geo = getCountryNameAndFlag(log.country);
                const ref = getReferrerDetails(log.referrer);
                const RefIcon = ref.icon;
                const bDetails = getBrowserIcon(log.browser);
                const BrowserIcon = bDetails.icon;
                const dev = getDeviceDetails(log.deviceType);
                const DevIcon = dev.icon;

                return (
                  <div key={index} className="glass-card p-4 rounded-xl border border-white/5 space-y-3 bg-zinc-950/20">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-muted-foreground tabular-nums">
                        {getRelativeTime(log.timestamp)}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                        Visits Page
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-white/90 tracking-wide select-all tabular-nums">
                        {log.ip}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="text-base select-none leading-none">{geo.flag}</span>
                        <span className="font-bold text-white/80">{geo.name}</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/[0.03] text-[10px]">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded ${ref.color} max-w-[130px]`}>
                        <RefIcon className="w-3 h-3 shrink-0" />
                        <span className="truncate">{ref.label}</span>
                      </span>

                      <div className="flex items-center gap-3 text-muted-foreground shrink-0">
                        <span className="flex items-center gap-1" title={`Browser: ${log.browser}`}>
                          <BrowserIcon className={`w-3 h-3 ${bDetails.color}`} />
                          <span>{log.browser.split(' ')[0]}</span>
                        </span>
                        <span className="flex items-center gap-1" title={`Device: ${dev.label}`}>
                          <DevIcon className="w-3 h-3" />
                          <span>{dev.label}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {filteredLogs.length === 0 && (
                <div className="py-8 text-center text-muted-foreground font-medium bg-white/[0.01] rounded-xl border border-dashed border-white/5">
                  No matching activity logs found.
                </div>
              )}
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
