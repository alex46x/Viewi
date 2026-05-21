'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
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
import { Loader2, Users, Eye, MousePointer2, Globe } from 'lucide-react';

const COLORS = ['#8b5cf6', '#a855f7', '#6366f1', '#4f46e5', '#d946ef', '#ec4899'];

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics');
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

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="space-y-10 animate-entrance">
      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 sm:p-8 rounded-[2rem] flex items-center justify-between premium-glow overflow-hidden relative group">
          <div className="relative z-10">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Lifetime Views</p>
            <h3 className="text-4xl font-black text-white tabular-nums drop-shadow-sm">{data?.totalViews?.toLocaleString() || '0'}</h3>
          </div>
          <div className="p-4 bg-primary/10 rounded-2xl group-hover:scale-110 transition-transform border border-primary/20 relative z-10">
            <Eye className="w-7 h-7 text-primary" />
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
        </div>
        
        <div className="glass-card p-6 sm:p-8 rounded-[2rem] flex items-center justify-between premium-glow overflow-hidden relative group">
          <div className="relative z-10">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Unique Users</p>
            <h3 className="text-4xl font-black text-white tabular-nums drop-shadow-sm">{data?.uniqueVisitors?.toLocaleString() || '0'}</h3>
          </div>
          <div className="p-4 bg-accent/10 rounded-2xl group-hover:scale-110 transition-transform border border-accent/20 relative z-10">
            <Users className="w-7 h-7 text-accent" />
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
        </div>

        <div className="glass-card p-6 sm:p-8 rounded-[2rem] flex items-center justify-between premium-glow overflow-hidden relative group">
          <div className="relative z-10">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Engagement</p>
            <h3 className="text-4xl font-black text-white tabular-nums drop-shadow-sm">
              {data?.totalViews > 0 ? ((data.uniqueVisitors / data.totalViews) * 100).toFixed(1) : 0}%
            </h3>
          </div>
          <div className="p-4 bg-primary/10 rounded-2xl group-hover:scale-110 transition-transform border border-primary/20 relative z-10">
            <MousePointer2 className="w-7 h-7 text-primary" />
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
        </div>
      </div>

      {/* Main Trends Chart */}
      <div className="glass-card p-6 sm:p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border-white/5 shadow-2xl shadow-black/20">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="text-2xl font-black text-white tracking-tight">Visitor Trends</h3>
            <p className="text-sm text-muted-foreground mt-1 font-medium">Platform activity over the last 7 days</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
             <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
             <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Rolling Data</span>
          </div>
        </div>
        
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.dailyVisits || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="date" 
                stroke="rgba(255,255,255,0.3)" 
                fontSize={10} 
                fontWeight={700}
                tickLine={false} 
                axisLine={false}
                dy={15}
                tickFormatter={(str) => {
                  const date = new Date(str);
                  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
                }}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.3)" 
                fontSize={10} 
                fontWeight={700}
                tickLine={false} 
                axisLine={false}
                allowDecimals={false}
                dx={-10}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(15, 15, 18, 0.95)', 
                  border: '1px solid rgba(255, 255, 255, 0.1)', 
                  borderRadius: '16px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                  backdropFilter: 'blur(10px)'
                }}
                itemStyle={{ color: '#8b5cf6', fontWeight: 700 }}
                labelStyle={{ marginBottom: '4px', opacity: 0.6, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
              />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="#8b5cf6" 
                strokeWidth={4}
                fillOpacity={1} 
                fill="url(#colorVisits)" 
                animationDuration={1500}
                dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#09090b' }}
                activeDot={{ r: 6, fill: '#fff', stroke: '#8b5cf6', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Geographic Breakdown */}
        <div className="glass-card p-6 sm:p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border-white/5">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">Geographic Reach</h3>
              <p className="text-xs text-muted-foreground font-medium mt-1">Top audience locations</p>
            </div>
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
              <Globe className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
          
          <div className="space-y-6">
            {data?.countries?.slice(0, 6)?.map((country, index) => {
              const width = (country.value / (data?.totalViews || 1)) * 100;
              return (
                <div key={country.name} className="space-y-2 group">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white/80 group-hover:text-white transition-colors">
                      {country.name === 'Unknown' ? 'International / Proxy' : country.name}
                    </span>
                    <span className="text-xs font-black text-muted-foreground tabular-nums">{country.value} views</span>
                  </div>
                  <div className="w-full bg-white/[0.03] rounded-full h-2.5 overflow-hidden border border-white/[0.03]">
                    <div 
                      className="bg-gradient-to-r from-primary/50 to-primary h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(139,92,246,0.2)]" 
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {(!data?.countries || data?.countries?.length === 0) && (
              <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl bg-white/[0.01]">
                <p className="text-sm text-muted-foreground font-medium">Awaiting global traffic signals...</p>
              </div>
            )}
          </div>
        </div>

        {/* Device Ecosystem */}
        <div className="glass-card p-6 sm:p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border-white/5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">System Ecosystem</h3>
              <p className="text-xs text-muted-foreground font-medium mt-1">Device distribution</p>
            </div>
          </div>
          
          <div className="h-[280px] w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.devices || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={85}
                  outerRadius={110}
                  paddingAngle={8}
                  dataKey="value"
                  animationDuration={1500}
                  stroke="none"
                >
                  {data?.devices?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 15, 18, 0.95)', 
                    border: '1px solid rgba(255, 255, 255, 0.1)', 
                    borderRadius: '16px',
                    backdropFilter: 'blur(10px)'
                  }}
                  itemStyle={{ fontWeight: 700, fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Text for Pie */}
            <div className="absolute flex flex-col items-center">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Total</p>
              <p className="text-3xl font-black text-white">{data?.totalViews || 0}</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-6 pt-6 border-t border-white/[0.05]">
            {data?.devices?.map((device, index) => (
              <div key={device.name} className="flex items-center gap-2 group cursor-default">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground group-hover:text-white transition-colors">{device.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
