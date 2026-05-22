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
  TrendingUp,
  Sparkles
} from 'lucide-react';

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

const getBrowserIcon = (browserName) => {
  const name = browserName?.toLowerCase() || '';
  if (name.includes('chrome')) return { icon: Chrome, color: 'text-amber-400' };
  if (name.includes('safari')) return { icon: Compass, color: 'text-blue-400' };
  if (name.includes('firefox')) return { icon: Globe, color: 'text-orange-500' };
  if (name.includes('edge')) return { icon: Compass, color: 'text-teal-400' };
  if (name.includes('opera')) return { icon: Globe, color: 'text-red-500' };
  return { icon: Globe, color: 'text-zinc-400' };
};

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

const getDeviceDetails = (deviceType) => {
  const type = deviceType?.toLowerCase() || '';
  if (type === 'mobile') return { label: 'Mobile', icon: Smartphone, color: '#8b5cf6' };
  if (type === 'tablet') return { label: 'Tablet', icon: Tablet, color: '#a855f7' };
  return { label: 'Desktop', icon: Laptop, color: '#6366f1' };
};

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

const PERIOD_OPTIONS = [
  { id: '7d', label: '7 Days' },
  { id: '30d', label: '30 Days' },
  { id: 'all', label: 'All Time' },
];

const METRIC_ACCENTS = [
  { icon: Eye, iconBg: 'bg-primary/15 border-primary/30', iconColor: 'text-primary', glow: 'bg-primary/10', featured: true },
  { icon: Users, iconBg: 'bg-sky-500/15 border-sky-500/30', iconColor: 'text-sky-400', glow: 'bg-sky-500/10' },
  { icon: Activity, iconBg: 'bg-indigo-500/15 border-indigo-500/30', iconColor: 'text-indigo-400', glow: 'bg-indigo-500/10' },
  { icon: TrendingUp, iconBg: 'bg-emerald-500/15 border-emerald-500/30', iconColor: 'text-emerald-400', glow: 'bg-emerald-500/10' },
];

function MetricCard({ label, value, accent, featured }) {
  const Icon = accent.icon;
  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-4 sm:p-5 transition-all duration-300 group ${
        featured
          ? 'analytics-hero-card border'
          : 'analytics-metric-card glass-card border-white/5 hover:border-white/10'
      }`}
    >
      <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-60 ${accent.glow}`} />
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[9px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] mb-1">
            {label}
          </p>
          <h3 className={`font-black text-white tabular-nums tracking-tight truncate ${
            featured ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'
          }`}>
            {value}
          </h3>
        </div>
        <div className={`p-2.5 sm:p-3 rounded-xl border shrink-0 ${accent.iconBg}`}>
          <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${accent.iconColor}`} />
        </div>
      </div>
      {featured && (
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      )}
    </div>
  );
}

function RankedBarRow({ rank, label, value, percentage, barClass, leading }) {
  return (
    <div className="group rounded-xl p-2.5 -mx-2.5 hover:bg-white/[0.03] transition-colors duration-200">
      <div className="flex items-center gap-3 mb-2">
        <span className={`analytics-rank-badge ${
          rank === 1
            ? 'bg-primary/20 text-primary border border-primary/30'
            : 'bg-white/5 text-muted-foreground border border-white/10'
        }`}>
          {rank}
        </span>
        <div className="flex-1 min-w-0 flex items-center gap-2">
          {leading}
          <span className="font-bold text-white/90 group-hover:text-white transition-colors truncate text-xs sm:text-sm">
            {label}
          </span>
        </div>
        <div className="text-right shrink-0">
          <span className="font-black text-white tabular-nums text-sm">{value}</span>
          <span className="text-[10px] text-muted-foreground/70 ml-1.5 font-medium">
            {percentage.toFixed(0)}%
          </span>
        </div>
      </div>
      <div className="w-full bg-white/[0.03] rounded-full h-2 overflow-hidden border border-white/[0.04] ml-8">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${barClass} ${
            rank === 1 ? 'analytics-bar-glow' : ''
          }`}
          style={{ width: `${Math.max(percentage, 4)}%` }}
        />
      </div>
    </div>
  );
}

function WidgetHeader({ title, subtitle, icon: Icon }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h3 className="text-base sm:text-lg font-black text-white tracking-tight">{title}</h3>
        <p className="text-[11px] text-muted-foreground mt-1 font-medium">{subtitle}</p>
      </div>
      <div className="p-2.5 rounded-xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/10 shadow-inner">
        <Icon className="w-4 h-4 text-primary/80" />
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [periodLoading, setPeriodLoading] = useState(false);
  const [period, setPeriod] = useState('7d');
  const [showLogs, setShowLogs] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAnalytics(period, !data);
  }, [period]);

  const fetchAnalytics = async (selectedPeriod, isInitial = false) => {
    if (!isInitial) setPeriodLoading(true);
    try {
      const res = await fetch(`/api/analytics?period=${selectedPeriod}`);
      const json = await res.json();
      if (res.ok) setData(json);
    } catch (err) {
      console.error('Failed to fetch analytics');
    } finally {
      setLoading(false);
      setPeriodLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-2xl border border-primary/25 bg-zinc-950/95 p-4 shadow-2xl shadow-primary/10 backdrop-blur-xl">
          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <Calendar className="w-3 h-3 text-primary" />
            {new Date(label).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white tabular-nums">
              {payload[0].value.toLocaleString()}
            </span>
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">views</span>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[420px] gap-4">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
          <Loader2 className="w-10 h-10 animate-spin text-primary relative" />
        </div>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Loading insights...</p>
      </div>
    );
  }

  const engagementRate = data?.periodViews > 0
    ? ((data.periodUniqueVisitors / data.periodViews) * 100).toFixed(1)
    : '0';

  const metrics = [
    { label: 'Lifetime Views', value: data?.totalViews?.toLocaleString() || '0' },
    { label: 'Lifetime Users', value: data?.uniqueVisitors?.toLocaleString() || '0' },
    { label: 'Period Sessions', value: data?.periodViews?.toLocaleString() || '0' },
    { label: 'Engagement Rate', value: `${engagementRate}%` },
  ];

  const periodLabel = period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : 'All Time';

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
    <div className="space-y-8 animate-entrance pb-4">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-widest text-primary">
            <Sparkles className="w-3 h-3" />
            Analytics
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Traffic Insights
          </h2>
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
            </span>
            <span className="text-[10px] font-bold text-emerald-400/90 uppercase tracking-[0.2em]">
              Live tracking synchronized
            </span>
          </div>
        </div>

        <div className="flex bg-zinc-950/60 border border-white/[0.08] rounded-2xl p-1 self-start shadow-lg shadow-black/30 backdrop-blur-md">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setPeriod(opt.id)}
              disabled={periodLoading}
              className={`px-4 py-2 rounded-xl text-[10px] sm:text-xs font-black tracking-wide transition-all duration-300 ${
                period === opt.id
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-primary/25'
                  : 'text-muted-foreground hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Grid */}
      <div className={`grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 transition-opacity duration-300 ${periodLoading ? 'opacity-60 pointer-events-none' : ''}`}>
        {metrics.map((m, i) => (
          <MetricCard
            key={m.label}
            label={m.label}
            value={m.value}
            accent={METRIC_ACCENTS[i]}
            featured={i === 0}
          />
        ))}
      </div>

      {/* Chart */}
      <div className={`glass-card rounded-[1.75rem] sm:rounded-[2rem] border-white/5 overflow-hidden transition-opacity duration-300 ${periodLoading ? 'opacity-60' : ''}`}>
        <div className="p-5 sm:p-7 border-b border-white/[0.04]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">Visitor Trends</h3>
              <p className="text-[11px] text-muted-foreground mt-1 font-medium">
                Daily profile traffic activity overview
              </p>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 self-start">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_6px_rgba(139,92,246,0.8)]" />
              <span className="text-[9px] font-black tracking-widest uppercase text-primary">
                {periodLabel}
              </span>
            </div>
          </div>
        </div>

        <div className="analytics-chart-surface px-4 sm:px-6 pb-6 sm:pb-8 pt-2">
          <div className="h-[260px] sm:h-[300px] w-full relative">
            {(!data?.dailyVisits || data.dailyVisits.length === 0) ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                <Activity className="w-10 h-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm font-bold text-white/60">No traffic data yet</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  Share your profile link to start collecting visitor trends.
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.dailyVisits} margin={{ top: 12, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.45}/>
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="strokeVisits" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#a78bfa" />
                      <stop offset="50%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(255,255,255,0.04)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="rgba(255,255,255,0.2)" 
                    fontSize={9} 
                    fontWeight={700}
                    tickLine={false} 
                    axisLine={false}
                    dy={12}
                    minTickGap={32}
                    tickFormatter={(str) => {
                      if (!str) return '';
                      const date = new Date(str);
                      return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
                    }}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.2)" 
                    fontSize={9} 
                    fontWeight={700}
                    tickLine={false} 
                    axisLine={false}
                    allowDecimals={false}
                    dx={-4}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ stroke: 'rgba(139, 92, 246, 0.25)', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="url(#strokeVisits)"
                    strokeWidth={2.5}
                    fillOpacity={1} 
                    fill="url(#colorVisits)" 
                    animationDuration={800}
                    dot={false}
                    activeDot={{ r: 5, fill: '#fff', stroke: '#8b5cf6', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Widgets grid */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 transition-opacity duration-300 ${periodLoading ? 'opacity-60' : ''}`}>
        
        {/* Geographic */}
        <div className="glass-card p-5 sm:p-7 rounded-[1.75rem] sm:rounded-[2rem] border-white/5">
          <WidgetHeader
            title="Geographic Reach"
            subtitle="Top audience source locations"
            icon={Globe}
          />
          <div className="space-y-1 max-h-[240px] overflow-y-auto pr-1 custom-scrollbar">
            {data?.countries?.slice(0, 5)?.map((country, index) => {
              const geo = getCountryNameAndFlag(country.name);
              const percentage = data?.periodViews > 0 ? (country.value / data.periodViews) * 100 : 0;
              return (
                <RankedBarRow
                  key={country.name}
                  rank={index + 1}
                  label={geo.name}
                  value={country.value}
                  percentage={percentage}
                  barClass="bg-gradient-to-r from-violet-500/80 via-primary to-indigo-500/80"
                  leading={<span className="text-lg leading-none select-none shrink-0">{geo.flag}</span>}
                />
              );
            })}
            {(!data?.countries || data.countries.length === 0) && (
              <div className="text-center py-14 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                <Globe className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground font-medium">Awaiting global traffic signals...</p>
              </div>
            )}
          </div>
        </div>

        {/* Referrers */}
        <div className="glass-card p-5 sm:p-7 rounded-[1.75rem] sm:rounded-[2rem] border-white/5">
          <WidgetHeader
            title="Referral Channels"
            subtitle="Top external link traffic sources"
            icon={Link2}
          />
          <div className="space-y-1 max-h-[240px] overflow-y-auto pr-1 custom-scrollbar">
            {data?.referrers?.slice(0, 5)?.map((referrer, index) => {
              const refDetails = getReferrerDetails(referrer.name);
              const RefIcon = refDetails.icon;
              const percentage = data?.periodViews > 0 ? (referrer.value / data.periodViews) * 100 : 0;
              return (
                <RankedBarRow
                  key={`${referrer.name}-${index}`}
                  rank={index + 1}
                  label={refDetails.label}
                  value={referrer.value}
                  percentage={percentage}
                  barClass="bg-gradient-to-r from-sky-500/70 via-accent to-indigo-400/80"
                  leading={
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${refDetails.color}`}>
                      <RefIcon className="w-2.5 h-2.5 shrink-0" />
                    </span>
                  }
                />
              );
            })}
            {(!data?.referrers || data.referrers.length === 0) && (
              <div className="text-center py-14 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                <Link2 className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground font-medium">Direct URL traffic logs only...</p>
              </div>
            )}
          </div>
        </div>

        {/* Browsers */}
        <div className="glass-card p-5 sm:p-7 rounded-[1.75rem] sm:rounded-[2rem] border-white/5">
          <WidgetHeader
            title="Browser Distribution"
            subtitle="Most common client engines"
            icon={Chrome}
          />
          <div className="space-y-1 max-h-[240px] overflow-y-auto pr-1 custom-scrollbar">
            {data?.browsers?.slice(0, 5)?.map((browser, index) => {
              const bDetails = getBrowserIcon(browser.name);
              const BrowserIcon = bDetails.icon;
              const percentage = data?.periodViews > 0 ? (browser.value / data.periodViews) * 100 : 0;
              return (
                <RankedBarRow
                  key={browser.name}
                  rank={index + 1}
                  label={browser.name}
                  value={browser.value}
                  percentage={percentage}
                  barClass="bg-gradient-to-r from-violet-400/70 to-violet-600"
                  leading={<BrowserIcon className={`w-4 h-4 ${bDetails.color} shrink-0`} />}
                />
              );
            })}
            {(!data?.browsers || data.browsers.length === 0) && (
              <div className="text-center py-14 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                <Chrome className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground font-medium">Awaiting visitor agent signals...</p>
              </div>
            )}
          </div>
        </div>

        {/* Devices pie */}
        <div className="glass-card p-5 sm:p-7 rounded-[1.75rem] sm:rounded-[2rem] border-white/5">
          <WidgetHeader
            title="System Ecosystem"
            subtitle="Device type distribution breakdown"
            icon={Laptop}
          />
          
          <div className="h-[200px] w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.devices || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={82}
                  paddingAngle={4}
                  dataKey="value"
                  animationDuration={800}
                  stroke="none"
                  cornerRadius={4}
                >
                  {data?.devices?.map((entry, index) => {
                    const dev = getDeviceDetails(entry.name);
                    return <Cell key={`cell-${index}`} fill={dev.color} />;
                  })}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(9, 9, 11, 0.95)', 
                    border: '1px solid rgba(139, 92, 246, 0.25)', 
                    borderRadius: '14px',
                    backdropFilter: 'blur(12px)',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="absolute flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.25em] mb-0.5">Sessions</span>
              <span className="text-3xl font-black text-white leading-none tabular-nums bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">
                {data?.periodViews || 0}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 pt-5 mt-2 border-t border-white/[0.04]">
            {data?.devices?.map((device) => {
              const dev = getDeviceDetails(device.name);
              const DevIcon = dev.icon;
              const pct = data?.periodViews > 0 ? ((device.value / data.periodViews) * 100).toFixed(0) : 0;
              return (
                <div key={device.name} className="flex items-center gap-2 group">
                  <div className="w-2.5 h-2.5 rounded-full ring-2 ring-white/10" style={{ backgroundColor: dev.color }} />
                  <DevIcon className="w-3.5 h-3.5 text-muted-foreground group-hover:text-white transition-colors" />
                  <span className="text-[10px] uppercase font-black tracking-wider text-muted-foreground group-hover:text-white transition-colors">
                    {dev.label}
                  </span>
                  <span className="text-[10px] font-bold text-white/40 tabular-nums">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Activity log */}
      <div className="glass-card rounded-[1.75rem] sm:rounded-[2rem] border-white/5 overflow-hidden">
        <button 
          onClick={() => setShowLogs(!showLogs)}
          className="w-full p-5 sm:p-7 flex items-center justify-between text-left focus:outline-none hover:bg-white/[0.02] transition-colors group"
        >
          <div>
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2.5">
              Detailed Activity Log
              <span className="px-2.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25 text-[10px] font-black tabular-nums">
                {data?.recentLogs?.length || 0}
              </span>
            </h3>
            <p className="text-[11px] text-muted-foreground mt-1 font-medium">
              Anonymized breakdown of active traffic sequences
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-muted-foreground group-hover:text-white group-hover:border-primary/30 transition-all duration-300">
            {showLogs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showLogs && (
          <div className="border-t border-white/[0.05] p-5 sm:p-7 space-y-4 animate-slideDown">
            <div className="relative max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search by IP, country, browser, referrer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-zinc-950/80 border border-white/[0.08] focus:border-primary/40 text-white placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            <div className="hidden md:block overflow-x-auto rounded-2xl border border-white/[0.06] bg-zinc-950/40">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-white/[0.03] border-b border-white/[0.06] text-[9px] uppercase tracking-wider font-black text-muted-foreground">
                    <th className="py-3.5 px-5">Time</th>
                    <th className="py-3.5 px-5">Anonymized IP</th>
                    <th className="py-3.5 px-5">Country</th>
                    <th className="py-3.5 px-5">Referrer Source</th>
                    <th className="py-3.5 px-5">Environment</th>
                    <th className="py-3.5 px-5 text-right">Activity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredLogs.map((log, index) => {
                    const geo = getCountryNameAndFlag(log.country);
                    const ref = getReferrerDetails(log.referrer);
                    const RefIcon = ref.icon;
                    const bDetails = getBrowserIcon(log.browser);
                    const BrowserIcon = bDetails.icon;
                    const dev = getDeviceDetails(log.deviceType);
                    const DevIcon = dev.icon;

                    return (
                      <tr key={index} className="hover:bg-primary/[0.03] transition-colors group">
                        <td className="py-4 px-5 font-semibold text-white/80 tabular-nums">
                          {getRelativeTime(log.timestamp)}
                        </td>
                        <td className="py-4 px-5 font-mono text-[11px] text-muted-foreground tracking-wide select-all">
                          {log.ip}
                        </td>
                        <td className="py-4 px-5">
                          <span className="flex items-center gap-2">
                            <span className="text-base leading-none">{geo.flag}</span>
                            <span className="font-bold text-white/80">{geo.name}</span>
                          </span>
                        </td>
                        <td className="py-4 px-5">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${ref.color}`}>
                            <RefIcon className="w-3 h-3 shrink-0" />
                            <span className="truncate max-w-[140px]">{ref.label}</span>
                          </span>
                        </td>
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1.5 text-muted-foreground group-hover:text-white transition-colors">
                              <BrowserIcon className={`w-3.5 h-3.5 ${bDetails.color}`} />
                              <span className="text-[10px] font-bold">{log.browser.split(' ')[0]}</span>
                            </span>
                            <span className="flex items-center gap-1.5 text-muted-foreground group-hover:text-white transition-colors">
                              <DevIcon className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-bold">{dev.label}</span>
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-5 text-right">
                          <span className="inline-flex items-center gap-1.5 text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/25">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Visits Page
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-muted-foreground font-medium">
                        No matching activity logs found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

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
                  <div key={index} className="rounded-xl border border-white/[0.06] p-4 space-y-3 bg-zinc-950/30 hover:border-white/10 transition-colors">
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
                      <span className="font-mono font-bold text-white/90 tabular-nums">{log.ip}</span>
                      <span className="flex items-center gap-1.5">
                        <span className="text-base">{geo.flag}</span>
                        <span className="font-bold text-white/80">{geo.name}</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-white/[0.04] text-[10px]">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border ${ref.color}`}>
                        <RefIcon className="w-3 h-3 shrink-0" />
                        <span className="truncate max-w-[120px]">{ref.label}</span>
                      </span>
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <BrowserIcon className={`w-3 h-3 ${bDetails.color}`} />
                          {log.browser.split(' ')[0]}
                        </span>
                        <span className="flex items-center gap-1">
                          <DevIcon className="w-3 h-3" />
                          {dev.label}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {filteredLogs.length === 0 && (
                <div className="py-10 text-center text-muted-foreground text-sm rounded-xl border border-dashed border-white/[0.08]">
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
