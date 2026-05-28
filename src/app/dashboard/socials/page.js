'use client';

import { useState, useEffect } from 'react';
import {
  Save,
  Loader2,
  Link as LinkIcon,
  Globe,
  Youtube,
  Linkedin,
  Twitter,
  Github,
  Instagram,
  Send,
  Facebook,
  Music2,
  MessageSquare,
  Activity,
  Radio,
  Check,
  RefreshCw,
  X,
  ArrowUpRight,
  Clock,
  ExternalLink,
  Copy,
  TrendingUp,
  ShieldCheck,
  Zap,
  Edit3,
  AlertCircle,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const SOCIAL_ICONS = {
  youtube: Youtube,
  linkedin: Linkedin,
  twitter: Twitter,
  github: Github,
  instagram: Instagram,
  website: Globe,
  telegram: Send,
  facebook: Facebook,
  tiktok: Music2,
  discord: MessageSquare,
  default: LinkIcon,
};

const BRAND_COLORS = {
  youtube: '#ef4444',
  linkedin: '#60a5fa',
  twitter: '#38bdf8',
  github: '#e2e8f0',
  instagram: '#ec4899',
  website: '#a855f7',
  telegram: '#0ea5e9',
  facebook: '#3b82f6',
  tiktok: '#2dd4bf',
  discord: '#6366f1',
  default: '#a855f7',
};

const PLATFORMS_CONFIG = [
  { id: 'website', name: 'Personal Website' },
  { id: 'linkedin', name: 'LinkedIn' },
  { id: 'youtube', name: 'YouTube' },
  { id: 'twitter', name: 'X (Twitter)' },
  { id: 'github', name: 'GitHub' },
  { id: 'instagram', name: 'Instagram' },
  { id: 'tiktok', name: 'TikTok' },
  { id: 'facebook', name: 'Facebook' },
  { id: 'discord', name: 'Discord' },
  { id: 'telegram', name: 'Telegram' },
];

// Only these platforms support REAL automated syncing via public API
const REAL_AUTO_SYNC_PLATFORMS = ['github', 'youtube'];

const SPARKLINE_PATHS = [
  'M 0 22 Q 15 5 30 18 T 60 8 T 90 15 L 100 5',
  'M 0 15 Q 20 28 40 10 T 80 20 T 100 12',
  'M 0 25 Q 25 12 50 25 T 85 8 T 100 5',
  'M 0 10 Q 15 22 30 8 T 70 20 T 100 12',
  'M 0 18 Q 30 5 60 22 T 90 10 T 100 8',
];

export default function SocialsPage() {
  notFound();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [syncingIdx, setSyncingIdx] = useState(null);
  const [activePlatformIdx, setActivePlatformIdx] = useState(0);
  const [copySuccess, setCopySuccess] = useState(false);
  const [editingCount, setEditingCount] = useState(false);
  const [manualCountInput, setManualCountInput] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile', { cache: 'no-store' });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        const firstIdx = data.socialLinks?.findIndex(l => l.platform !== 'website');
        if (firstIdx !== -1 && firstIdx !== undefined) {
          setActivePlatformIdx(firstIdx);
        }
      } else {
        setError('Failed to load profile details');
      }
    } catch (err) {
      setError('Failed to connect to profile server');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ socialLinks: user.socialLinks }),
      });
      if (res.ok) {
        setSuccess('Settings saved successfully!');
        setTimeout(() => setSuccess(''), 4000);
      } else {
        setError('Failed to save settings');
      }
    } catch (err) {
      setError('Connection error while saving');
    } finally {
      setSaving(false);
    }
  };

  const updateFollowerField = (index, field, value) => {
    const newList = [...user.socialLinks];
    newList[index] = { ...newList[index], [field]: value };
    setUser({ ...user, socialLinks: newList });
  };

  const saveManualCount = async () => {
    const parsed = parseInt(manualCountInput);
    if (isNaN(parsed) || parsed < 0) {
      setError('Please enter a valid number');
      return;
    }
    updateFollowerField(activePlatformIdx, 'followerCount', parsed);
    setEditingCount(false);

    // Auto-save immediately
    setSaving(true);
    try {
      const newList = [...user.socialLinks];
      newList[activePlatformIdx] = { ...newList[activePlatformIdx], followerCount: parsed };
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ socialLinks: newList }),
      });
      if (res.ok) {
        setUser(prev => ({ ...prev, socialLinks: newList }));
        setSuccess('Follower count updated!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to save count');
      }
    } catch {
      setError('Connection error');
    } finally {
      setSaving(false);
    }
  };

  const triggerAutoSync = async (index) => {
    if (syncingIdx !== null) return;
    setSyncingIdx(index);
    setError('');
    setSuccess('');

    try {
      // Save current state first
      await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ socialLinks: user.socialLinks }),
      });

      const res = await fetch('/api/profile/sync-followers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkIndex: index }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const newList = [...user.socialLinks];
        newList[index] = data.updatedLink;
        setUser({ ...user, socialLinks: newList });
        setSuccess(`✓ Live data synced for ${user.socialLinks[index].platform}! (${data.fetchedCount?.toLocaleString()} fetched)`);
        setTimeout(() => setSuccess(''), 5000);
      } else if (data.manualOnly) {
        setError(`Auto-sync not available for this platform. Please enter your count manually below.`);
      } else if (data.fetchFailed) {
        setError(`Could not fetch live data. Check your profile URL is correct, then try again.`);
      } else {
        setError(data.error || 'Sync failed');
      }
    } catch (err) {
      setError('Server connection timeout during sync');
    } finally {
      setSyncingIdx(null);
    }
  };

  const copyUniversalLink = () => {
    if (!user) return;
    const link = `${window.location.origin}/${user.username}`;
    navigator.clipboard.writeText(link);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const socialLinks = user?.socialLinks || [];
  const totalPlatforms = socialLinks.length;
  const totalAudience = socialLinks.reduce((sum, link) => sum + (link.followerCount || 0), 0);
  const activeLink = socialLinks[activePlatformIdx];
  const isRealAutoSync = activeLink ? REAL_AUTO_SYNC_PLATFORMS.includes(activeLink.platform) : false;

  const fmt = (count) => {
    if (!count && count !== 0) return '—';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toLocaleString();
  };

  const getPlatformName = (platform) => {
    return PLATFORMS_CONFIG.find(p => p.id === platform)?.name || platform;
  };

  const getAudienceLabel = (platform) => {
    if (platform === 'youtube') return 'Subscribers';
    if (platform === 'github') return 'Followers';
    if (platform === 'website') return 'Visitors';
    return 'Followers';
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground font-black tracking-widest animate-pulse">LOADING TELEMETRY...</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes sparkline-flow {
          0% { stroke-dashoffset: 200; }
          100% { stroke-dashoffset: 0; }
        }
        .sparkline-animated {
          stroke-dasharray: 200;
          animation: sparkline-flow 3s linear infinite;
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.03; }
          50% { opacity: 0.07; }
        }
        .glow-breathe { animation: glow-pulse 3s ease-in-out infinite; }
        @keyframes border-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin-slow { animation: border-spin 20s linear infinite; }
        .glass-card {
          background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.07);
        }
        .count-input::-webkit-outer-spin-button,
        .count-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        .count-input[type=number] { -moz-appearance: textfield; }
      `}</style>

      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase">Follower Stats</h1>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-400 uppercase tracking-wider">
                <Radio className="w-2.5 h-2.5 animate-pulse" /> Live Telemetry
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Monitor follower stats across all connected platforms. GitHub & YouTube sync live — others are manual.
            </p>
          </div>

          {user && (
            <div className="self-start md:self-center flex items-center gap-3 bg-[#0d0d12]/60 border border-white/5 pl-2.5 pr-4 py-1.5 rounded-full backdrop-blur-md">
              <div className="w-7 h-7 rounded-full bg-primary/10 border border-white/10 overflow-hidden shrink-0">
                {user.image ? (
                  <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-white/50 bg-white/5">
                    {(user.name || user.username)[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-white leading-none tracking-tight">{user.name || user.username}</p>
                <p className="text-[8px] font-bold text-violet-400/80 tracking-wider mt-0.5 uppercase">@{user.username}</p>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-2" />
            </div>
          )}
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in duration-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="flex-1">{error}</span>
            <button onClick={() => setError('')} className="p-0.5 hover:text-white transition-colors cursor-pointer shrink-0"><X className="w-3.5 h-3.5" /></button>
          </div>
        )}
        {success && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in duration-300">
            <Check className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="flex-1">{success}</span>
            <button onClick={() => setSuccess('')} className="p-0.5 hover:text-white transition-colors cursor-pointer shrink-0"><X className="w-3.5 h-3.5" /></button>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">

          {/* LEFT COLUMN */}
          <div className="xl:col-span-8 space-y-5">

            {/* Platform Cards Grid */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[9px] uppercase tracking-widest font-black text-muted-foreground">Connected Channels</span>
                <span className="text-[9px] uppercase tracking-widest font-black text-primary/70">{totalPlatforms} platforms linked</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5">
                {socialLinks.map((link, index) => {
                  const Icon = SOCIAL_ICONS[link.platform] || SOCIAL_ICONS.default;
                  const brandColor = BRAND_COLORS[link.platform] || BRAND_COLORS.default;
                  const isActive = activePlatformIdx === index;
                  const sparkPath = SPARKLINE_PATHS[index % SPARKLINE_PATHS.length];
                  const hasRealSync = REAL_AUTO_SYNC_PLATFORMS.includes(link.platform);
                  const hasCount = link.followerCount > 0;

                  return (
                    <div
                      key={index}
                      onClick={() => {
                        setActivePlatformIdx(index);
                        setEditingCount(false);
                      }}
                      className={cn(
                        'rounded-[1.8rem] p-4 relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between h-[130px] group',
                        isActive
                          ? 'bg-white/[0.04]'
                          : 'bg-[#0d0d12]/50 hover:bg-white/[0.02]'
                      )}
                      style={{
                        border: isActive
                          ? `1px solid ${brandColor}40`
                          : '1px solid rgba(255,255,255,0.05)',
                        boxShadow: isActive ? `0 0 30px ${brandColor}18, 0 0 0 1px ${brandColor}15` : 'none',
                      }}
                    >
                      {/* Background glow */}
                      <div
                        className="absolute inset-0 glow-breathe pointer-events-none rounded-[1.8rem]"
                        style={{ backgroundColor: isActive ? brandColor : 'transparent' }}
                      />

                      {/* Top row */}
                      <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border"
                            style={{
                              backgroundColor: `${brandColor}18`,
                              color: brandColor,
                              borderColor: `${brandColor}25`,
                            }}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-white text-xs font-black capitalize tracking-tight leading-tight">
                            {getPlatformName(link.platform)}
                          </span>
                        </div>
                        <ArrowUpRight
                          className="w-3.5 h-3.5 transition-colors"
                          style={{ color: isActive ? brandColor : 'rgba(255,255,255,0.2)' }}
                        />
                      </div>

                      {/* Count row */}
                      <div className="mt-1 relative z-10">
                        <p className="text-xl font-black text-white tracking-tight">
                          {hasCount ? fmt(link.followerCount) : (link.platform === 'website' ? '—' : '—')}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          {link.platform === 'website' ? (
                            <p className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground/50">Personal channel</p>
                          ) : hasRealSync && link.isAutoSynced ? (
                            <>
                              <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                              <p className="text-[8px] font-bold uppercase tracking-wider text-emerald-400/80">Live Synced</p>
                            </>
                          ) : hasRealSync ? (
                            <p className="text-[8px] font-bold uppercase tracking-wider text-sky-400/60">API Capable</p>
                          ) : (
                            <p className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground/50">Manual Entry</p>
                          )}
                        </div>
                      </div>

                      {/* Sparkline */}
                      <div className="absolute bottom-0 left-0 right-0 h-10 w-full pointer-events-none opacity-35 group-hover:opacity-70 transition-opacity overflow-hidden">
                        <svg className="w-full h-full mt-2" viewBox="0 0 100 30" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id={`grad-${link.platform}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={brandColor} stopOpacity="0.3" />
                              <stop offset="100%" stopColor={brandColor} stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          <path
                            d={sparkPath}
                            fill="none"
                            stroke={brandColor}
                            strokeWidth="1.5"
                            className={isActive ? 'sparkline-animated' : ''}
                          />
                          <path d={`${sparkPath} L 100 30 L 0 30 Z`} fill={`url(#grad-${link.platform})`} />
                        </svg>
                      </div>

                      {/* Active bottom bar */}
                      {isActive && (
                        <div
                          className="absolute bottom-0 left-1/4 right-1/4 h-[2px] rounded-full"
                          style={{ backgroundColor: brandColor }}
                        />
                      )}
                    </div>
                  );
                })}

                {socialLinks.length === 0 && (
                  <div className="col-span-full text-center py-8 border border-dashed border-white/5 rounded-[1.8rem] bg-white/[0.01]">
                    <Globe className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider">No Active Connections</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">Link platforms on your profile first.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Active Platform Telemetry Panel */}
            {activeLink ? (
              <div className="glass-card rounded-[2rem] p-5 sm:p-6 space-y-5 relative overflow-hidden">

                {/* Brand glow mesh */}
                <div
                  className="absolute top-0 right-0 w-[250px] h-[250px] rounded-full opacity-[0.04] blur-[100px] pointer-events-none"
                  style={{ backgroundColor: BRAND_COLORS[activeLink.platform] || BRAND_COLORS.default }}
                />
                {/* Left accent bar */}
                <div
                  className="absolute left-0 top-6 bottom-6 w-[3px] rounded-full"
                  style={{ backgroundColor: `${BRAND_COLORS[activeLink.platform] || BRAND_COLORS.default}60` }}
                />

                {/* Panel header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    {/* Platform badge */}
                    <div
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full border"
                      style={{
                        backgroundColor: `${BRAND_COLORS[activeLink.platform] || BRAND_COLORS.default}10`,
                        borderColor: `${BRAND_COLORS[activeLink.platform] || BRAND_COLORS.default}25`,
                      }}
                    >
                      {(() => { const Icon = SOCIAL_ICONS[activeLink.platform] || SOCIAL_ICONS.default; return <Icon className="w-3 h-3" style={{ color: BRAND_COLORS[activeLink.platform] || BRAND_COLORS.default }} />; })()}
                      <span className="text-[9px] font-black uppercase tracking-wider text-white/70">
                        {getPlatformName(activeLink.platform)}
                      </span>
                    </div>

                    {/* Sync capability badge */}
                    {activeLink.platform !== 'website' && (
                      isRealAutoSync ? (
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-[8px] font-black uppercase tracking-wider text-emerald-400">API Live Sync</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                          <Edit3 className="w-2.5 h-2.5 text-amber-400" />
                          <span className="text-[8px] font-black uppercase tracking-wider text-amber-400">Manual Entry</span>
                        </div>
                      )
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {activeLink.lastSyncedAt && (
                      <div className="flex items-center gap-1 text-[8px] text-muted-foreground/60 bg-white/[0.03] border border-white/5 px-2.5 py-1 rounded-full">
                        <Clock className="w-2.5 h-2.5" />
                        <span>Synced {new Date(activeLink.lastSyncedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                    {activeLink.url && (
                      <a
                        href={activeLink.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/30 hover:text-white transition-colors"
                        title="Open profile"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Central Stats + Controls */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
                  <div className="space-y-1">
                    <p className="text-[9px] uppercase tracking-widest font-black text-muted-foreground/60">
                      {getAudienceLabel(activeLink.platform)} Count
                    </p>

                    {/* Count display / edit */}
                    {editingCount && activeLink.platform !== 'website' ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          autoFocus
                          value={manualCountInput}
                          onChange={(e) => setManualCountInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') saveManualCount(); if (e.key === 'Escape') setEditingCount(false); }}
                          className="count-input w-36 text-4xl font-black bg-transparent text-white outline-none border-b-2 border-violet-500 pb-1 placeholder-white/20"
                          placeholder="0"
                        />
                        <div className="flex flex-col gap-1">
                          <button onClick={saveManualCount} className="p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 transition-colors cursor-pointer">
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setEditingCount(false)} className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white transition-colors cursor-pointer">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-3">
                        <p
                          className="text-4xl sm:text-5xl font-black text-white tracking-tight transition-all"
                          style={{ textShadow: `0 0 30px ${BRAND_COLORS[activeLink.platform] || BRAND_COLORS.default}30` }}
                        >
                          {activeLink.followerCount > 0 ? activeLink.followerCount.toLocaleString() : '—'}
                        </p>
                        {!isRealAutoSync && activeLink.platform !== 'website' && (
                          <button
                            onClick={() => {
                              setManualCountInput(activeLink.followerCount?.toString() || '');
                              setEditingCount(true);
                            }}
                            className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-amber-400/70 hover:text-amber-400 transition-colors cursor-pointer group/edit"
                          >
                            <Edit3 className="w-3 h-3 group-hover/edit:scale-110 transition-transform" />
                            Edit
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap items-center gap-2.5">

                    {/* Real auto-sync button — only for GitHub/YouTube */}
                    {isRealAutoSync && activeLink.url && (
                      <button
                        type="button"
                        onClick={() => triggerAutoSync(activePlatformIdx)}
                        disabled={syncingIdx === activePlatformIdx}
                        className="h-11 px-5 rounded-full bg-white hover:bg-white/95 text-black font-black uppercase text-[10px] tracking-wider transition-all duration-300 active:scale-95 cursor-pointer shadow-lg shadow-white/5 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {syncingIdx === activePlatformIdx ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Fetching Live...</span>
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 text-black/60" />
                            <span>Sync Live Data</span>
                          </>
                        )}
                      </button>
                    )}

                    {/* Manual entry button for non-auto-sync platforms */}
                    {!isRealAutoSync && activeLink.platform !== 'website' && !editingCount && (
                      <button
                        type="button"
                        onClick={() => {
                          setManualCountInput(activeLink.followerCount?.toString() || '');
                          setEditingCount(true);
                        }}
                        className="h-11 px-5 rounded-full bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 text-amber-400 font-black uppercase text-[10px] tracking-wider transition-all duration-300 active:scale-95 cursor-pointer flex items-center gap-2"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Enter Count</span>
                      </button>
                    )}

                    {/* Save Preferences */}
                    <button
                      type="button"
                      disabled={saving}
                      onClick={handleUpdate}
                      className="h-11 px-5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black uppercase text-[10px] tracking-wider transition-all duration-300 active:scale-95 cursor-pointer flex items-center gap-2"
                    >
                      {saving ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5 text-white/50" />
                          <span>Save</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Info note for manual platforms */}
                {!isRealAutoSync && activeLink.platform !== 'website' && (
                  <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-500/[0.06] border border-amber-500/15">
                    <Info className="w-3.5 h-3.5 text-amber-400/80 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-amber-200/60 leading-relaxed">
                      <strong className="text-amber-400/90">Manual entry required:</strong> {getPlatformName(activeLink.platform)} doesn&apos;t provide a public API for follower counts. Check your {getPlatformName(activeLink.platform)} profile and enter your current count above. Real-time auto-sync is available for <strong className="text-amber-300/80">GitHub</strong> and <strong className="text-amber-300/80">YouTube</strong>.
                    </p>
                  </div>
                )}

                {/* Toggle Controls */}
                {activeLink.platform !== 'website' && (
                  <div className="flex flex-wrap gap-5 pt-4 border-t border-white/5">
                    <label className="flex items-center gap-2.5 cursor-pointer group/toggle select-none">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={!!activeLink.showFollowers}
                        onChange={(e) => updateFollowerField(activePlatformIdx, 'showFollowers', e.target.checked)}
                      />
                      <div className="w-8 h-4 bg-white/5 peer-checked:bg-violet-500/50 rounded-full relative transition-colors duration-300 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white/80 peer-checked:after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-4 border border-white/5 shrink-0" />
                      <span className="text-[10px] font-black uppercase text-white/40 group-hover/toggle:text-white/60 transition-colors">
                        Show Follower Badge on Profile
                      </span>
                    </label>

                    {isRealAutoSync && (
                      <label className="flex items-center gap-2.5 cursor-pointer group/toggle select-none">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={!!activeLink.isAutoSynced}
                          onChange={(e) => updateFollowerField(activePlatformIdx, 'isAutoSynced', e.target.checked)}
                        />
                        <div className="w-8 h-4 bg-white/5 peer-checked:bg-emerald-500/50 rounded-full relative transition-colors duration-300 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white/80 peer-checked:after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-4 border border-white/5 shrink-0" />
                        <span className="text-[10px] font-black uppercase text-white/40 group-hover/toggle:text-white/60 transition-colors">
                          Enable Auto-Sync
                        </span>
                      </label>
                    )}
                  </div>
                )}

                {/* Bottom sub-stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/5">
                  <div className="space-y-1">
                    <p className="text-[8px] font-black text-muted-foreground/50 uppercase tracking-widest">Data Source</p>
                    <p className="text-xs font-black text-white flex items-center gap-1">
                      {isRealAutoSync ? (
                        <><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> <span className="text-emerald-400">Live API</span></>
                      ) : activeLink.platform === 'website' ? (
                        <><Globe className="w-3.5 h-3.5 text-muted-foreground/50" /> <span className="text-muted-foreground/70">N/A</span></>
                      ) : (
                        <><Edit3 className="w-3.5 h-3.5 text-amber-400" /> <span className="text-amber-400">Manual</span></>
                      )}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] font-black text-muted-foreground/50 uppercase tracking-widest">Badge Status</p>
                    <p className="text-xs font-black flex items-center gap-1">
                      {activeLink.showFollowers ? (
                        <><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> <span className="text-emerald-400">Visible</span></>
                      ) : (
                        <><span className="w-1.5 h-1.5 rounded-full bg-white/20 inline-block" /> <span className="text-white/40">Hidden</span></>
                      )}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] font-black text-muted-foreground/50 uppercase tracking-widest">Audience Tier</p>
                    <p className="text-xs font-black text-white/85">
                      {!activeLink.followerCount || activeLink.followerCount === 0
                        ? <span className="text-white/30">Not Set</span>
                        : activeLink.followerCount >= 1000000 ? 'Mega Creator'
                        : activeLink.followerCount >= 100000 ? 'Top Influencer'
                        : activeLink.followerCount >= 10000 ? 'Influential'
                        : 'Rising Star'
                      }
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] font-black text-muted-foreground/50 uppercase tracking-widest">Est. Reach</p>
                    <p className="text-xs font-black text-violet-400 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" />
                      <span>{activeLink.followerCount ? fmt(Math.round(activeLink.followerCount * 1.5)) : '—'}</span>
                    </p>
                  </div>
                </div>

              </div>
            ) : (
              <div className="glass-card p-10 rounded-[2rem] text-center space-y-4">
                <Activity className="w-10 h-10 text-muted-foreground/30 mx-auto animate-pulse" />
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider">No Platform Selected</p>
                  <p className="text-[10px] text-muted-foreground/60">Select a connected platform from the cards above.</p>
                </div>
              </div>
            )}

            {/* Bottom Cumulative Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#0d0d12]/50 border border-white/5 p-4 rounded-[1.8rem] space-y-1.5 relative overflow-hidden group hover:border-white/10 transition-colors">
                <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-emerald-500/[0.04] blur-xl" />
                <Globe className="w-3.5 h-3.5 text-emerald-400/60 mb-1" />
                <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Total Audience</span>
                <p className="text-lg font-black text-white">{fmt(totalAudience)}</p>
                <span className="text-[8px] font-black uppercase text-emerald-400/80 tracking-wider">All Platforms</span>
              </div>

              <div className="bg-[#0d0d12]/50 border border-white/5 p-4 rounded-[1.8rem] space-y-1.5 relative overflow-hidden group hover:border-white/10 transition-colors">
                <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-sky-500/[0.04] blur-xl" />
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400/60 mb-1" />
                <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Real-Time Sync</span>
                <p className="text-lg font-black text-white">
                  {socialLinks.filter(l => REAL_AUTO_SYNC_PLATFORMS.includes(l.platform)).length}/{totalPlatforms}
                </p>
                <span className="text-[8px] font-black uppercase text-sky-400/80 tracking-wider">Platforms Live</span>
              </div>

              <div className="bg-[#0d0d12]/50 border border-white/5 p-4 rounded-[1.8rem] space-y-1.5 relative overflow-hidden group hover:border-white/10 transition-colors">
                <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-violet-500/[0.04] blur-xl" />
                <TrendingUp className="w-3.5 h-3.5 text-violet-400/60 mb-1" />
                <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Badges Active</span>
                <p className="text-lg font-black text-white">{socialLinks.filter(l => l.showFollowers).length}</p>
                <span className="text-[8px] font-black uppercase text-violet-400/80 tracking-wider">Showing on Profile</span>
              </div>

              <div className="bg-[#0d0d12]/50 border border-white/5 p-4 rounded-[1.8rem] space-y-1.5 relative overflow-hidden group hover:border-white/10 transition-colors">
                <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-fuchsia-500/[0.04] blur-xl" />
                <Zap className="w-3.5 h-3.5 text-fuchsia-400/60 mb-1" />
                <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Est. Total Reach</span>
                <p className="text-lg font-black text-white">{fmt(Math.round(totalAudience * 1.5))}</p>
                <span className="text-[8px] font-black uppercase text-fuchsia-400/80 tracking-wider">Potential Impressions</span>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Profile Share Hub */}
          <div className="xl:col-span-4 space-y-5">

            <div className="relative overflow-hidden rounded-[2.2rem] bg-gradient-to-b from-[#1c1236] to-[#0c0c0e] border border-violet-500/10 p-6 shadow-2xl flex flex-col items-center justify-between min-h-[350px]">

              {/* Mesh glows */}
              <div className="absolute top-0 right-0 w-[150px] h-[150px] rounded-full bg-fuchsia-500/[0.08] blur-[70px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-[150px] h-[150px] rounded-full bg-violet-500/[0.08] blur-[70px] pointer-events-none" />
              <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />

              <div className="w-full text-center space-y-1.5 relative z-10">
                <span className="text-[8px] font-black tracking-[0.25em] text-violet-400 uppercase bg-violet-500/10 border border-violet-500/20 px-3 py-0.5 rounded-full">
                  Universal Profile Hub
                </span>
                <h3 className="text-lg font-black tracking-tight text-white uppercase mt-2">Share Your Reach</h3>
                <p className="text-[10px] text-white/50 leading-relaxed max-w-[200px] mx-auto font-medium">
                  One link — all your platforms, stats, and audience in one place.
                </p>
              </div>

              {/* QR Code Visual */}
              <div className="relative my-6 z-10">
                <div className="absolute -inset-4 rounded-full border border-dashed border-violet-500/15 spin-slow pointer-events-none" />
                <div className="w-36 h-36 rounded-[2rem] bg-white/[0.02] border border-white/5 flex items-center justify-center p-4 shadow-inner relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 opacity-40 pointer-events-none" />
                  <svg className="w-full h-full text-violet-400/80" viewBox="0 0 100 100" fill="currentColor">
                    <rect x="5" y="5" width="22" height="22" rx="6" fill="none" stroke="currentColor" strokeWidth="3" />
                    <rect x="11" y="11" width="10" height="10" rx="3" />
                    <rect x="73" y="5" width="22" height="22" rx="6" fill="none" stroke="currentColor" strokeWidth="3" />
                    <rect x="79" y="11" width="10" height="10" rx="3" />
                    <rect x="5" y="73" width="22" height="22" rx="6" fill="none" stroke="currentColor" strokeWidth="3" />
                    <rect x="11" y="79" width="10" height="10" rx="3" />
                    <circle cx="45" cy="10" r="3" /><circle cx="58" cy="15" r="3.5" />
                    <circle cx="42" cy="25" r="2.5" /><circle cx="55" cy="30" r="4" />
                    <circle cx="68" cy="40" r="3" /><circle cx="10" cy="45" r="2.5" />
                    <circle cx="22" cy="50" r="3" /><circle cx="35" cy="55" r="3.5" />
                    <circle cx="48" cy="48" r="4.5" /><circle cx="60" cy="52" r="3" />
                    <circle cx="75" cy="45" r="2.5" /><circle cx="88" cy="50" r="3" />
                    <circle cx="12" cy="62" r="3.5" /><circle cx="28" cy="62" r="2.5" />
                    <circle cx="40" cy="72" r="4" /><circle cx="52" cy="65" r="3" />
                    <circle cx="65" cy="75" r="2.5" /><circle cx="58" cy="88" r="3.5" />
                    <circle cx="45" cy="90" r="2.5" /><circle cx="78" cy="62" r="3" />
                    <circle cx="85" cy="90" r="3" /><circle cx="72" cy="85" r="3.5" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-9 h-9 rounded-full bg-[#130d22] border border-violet-500/20 shadow-lg flex items-center justify-center text-white text-[10px] font-black">
                      V
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="w-full space-y-2 mt-2 relative z-10">
                <button
                  type="button"
                  onClick={copyUniversalLink}
                  className="w-full h-11 rounded-full bg-white hover:bg-white/95 text-black font-black uppercase text-[10px] tracking-widest flex items-center justify-center transition-all duration-300 active:scale-[0.98] cursor-pointer shadow-lg shadow-white/5 gap-2"
                >
                  {copySuccess ? (
                    <><Check className="w-4 h-4 text-emerald-600" /><span>Link Copied!</span></>
                  ) : (
                    <><Copy className="w-3.5 h-3.5 text-black/60" /><span>Copy Universal Link</span></>
                  )}
                </button>

                {user && (
                  <Link
                    href={`/${user.username}`}
                    target="_blank"
                    className="w-full h-11 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black uppercase text-[10px] tracking-widest flex items-center justify-center transition-all duration-300 active:scale-[0.98] cursor-pointer gap-2"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-white/50" />
                    <span>View Public Page</span>
                  </Link>
                )}
              </div>

            </div>

            {/* API Capabilities Info Card */}
            <div className="glass-card rounded-[1.8rem] p-4 space-y-3">
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Sync Capabilities</p>
              <div className="space-y-2">
                {[
                  { platform: 'github', label: 'GitHub', status: 'live' },
                  { platform: 'youtube', label: 'YouTube', status: 'live' },
                  { platform: 'instagram', label: 'Instagram', status: 'manual' },
                  { platform: 'facebook', label: 'Facebook', status: 'manual' },
                  { platform: 'twitter', label: 'X (Twitter)', status: 'manual' },
                  { platform: 'linkedin', label: 'LinkedIn', status: 'manual' },
                  { platform: 'tiktok', label: 'TikTok', status: 'manual' },
                ].map(({ platform, label, status }) => {
                  const Icon = SOCIAL_ICONS[platform];
                  const color = BRAND_COLORS[platform];
                  return (
                    <div key={platform} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5" style={{ color }} />
                        <span className="text-[10px] font-bold text-white/60">{label}</span>
                      </div>
                      {status === 'live' ? (
                        <span className="text-[8px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Live API</span>
                      ) : (
                        <span className="text-[8px] font-black uppercase tracking-wider text-amber-400/70 bg-amber-500/10 px-2 py-0.5 rounded-full">Manual</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
