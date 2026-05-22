'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { 
  ArrowRight, 
  BarChart3, 
  QrCode, 
  Share2, 
  Sparkles, 
  Globe, 
  Users, 
  CheckCircle2, 
  TrendingUp, 
  MessageSquare, 
  Send, 
  Smartphone, 
  Play, 
  Sliders, 
  Star, 
  ArrowUpRight, 
  Lock, 
  Plus,
  Instagram,
  Linkedin,
  Github,
  Youtube,
  Check
} from 'lucide-react';

export default function Home() {
  // Claims Handle state
  const [claimUsername, setClaimUsername] = useState('');
  
  // Interactive Connection Network Hub state
  const [activePlatform, setActivePlatform] = useState('instagram');
  const [hoveredPlatform, setHoveredPlatform] = useState(null);

  // Estimator states
  const [followers, setFollowers] = useState(15000);
  const [engagement, setEngagement] = useState('moderate'); // 'low', 'moderate', 'high'
  const [selectedPlatforms, setSelectedPlatforms] = useState(['instagram', 'linkedin', 'github']);
  
  // Projection output states
  const [projectedViews, setProjectedViews] = useState(0);
  const [projectedCTR, setProjectedCTR] = useState(0);
  const [projectedClicks, setProjectedClicks] = useState(0);
  const [growthPercent, setGrowthPercent] = useState(0);

  // Calculate Estimator metrics in real-time
  useEffect(() => {
    // 1. Calculate Monthly Views based on followers and engagement level
    const viewMultiplier = engagement === 'low' ? 0.04 : engagement === 'moderate' ? 0.12 : 0.28;
    const views = Math.round(followers * viewMultiplier);

    // 2. Calculate CTR (Click-Through Rate) based on engagement and number of platform links
    let ctrBase = engagement === 'low' ? 2.1 : engagement === 'moderate' ? 5.4 : 11.2;
    // Add minor boost for each selected platform (up to 3 platforms optimized)
    const platformMultiplier = Math.min(selectedPlatforms.length * 0.4, 1.6);
    const ctr = parseFloat((ctrBase + platformMultiplier).toFixed(1));

    // 3. Calculate clicks
    const clicks = Math.round(views * (ctr / 100));

    // 4. Growth boost factor compared to traditional bio links
    const growth = Math.round((ctrBase + platformMultiplier) * (engagement === 'high' ? 38 : 24));

    setProjectedViews(views);
    setProjectedCTR(ctr);
    setProjectedClicks(clicks);
    setGrowthPercent(growth);
  }, [followers, engagement, selectedPlatforms]);

  const togglePlatformInEstimator = (platformId) => {
    if (selectedPlatforms.includes(platformId)) {
      if (selectedPlatforms.length > 1) {
        setSelectedPlatforms(selectedPlatforms.filter(p => p !== platformId));
      }
    } else {
      setSelectedPlatforms([...selectedPlatforms, platformId]);
    }
  };

  const currentPlatform = hoveredPlatform || activePlatform;

  // Social platforms configurations for the Connection Network Hub
  const socialPlatforms = [
    {
      id: 'instagram',
      name: 'Instagram',
      color: '#E1306C',
      gradient: 'from-pink-500 via-red-500 to-yellow-500',
      shadow: 'rgba(225, 48, 108, 0.35)',
      description: 'Display interactive picture feeds and custom portfolios.',
      icon: <Instagram className="w-5 h-5" />,
      accentText: 'text-pink-500',
      mockData: {
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        name: 'Sarah Jenkins',
        handle: '@sarah.jenkins',
        bio: 'Visual Designer & Digital Curator 🎨 | Creating premium design systems',
        buttonText: 'Follow on Instagram',
        stats: '4.8k Clicks • 8.4% CTR'
      }
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      color: '#0077B5',
      gradient: 'from-blue-600 to-indigo-600',
      shadow: 'rgba(0, 119, 181, 0.35)',
      description: 'Showcase your corporate network, accomplishments, and CV.',
      icon: <Linkedin className="w-5 h-5" />,
      accentText: 'text-blue-500',
      mockData: {
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
        name: 'Marcus Vance',
        handle: 'in/marcusvance',
        bio: 'Co-Founder & VP of Product | Scaling Next-Gen SaaS architectures 🚀',
        buttonText: 'Connect on LinkedIn',
        stats: '2.9k Clicks • 9.2% CTR'
      }
    },
    {
      id: 'github',
      name: 'GitHub',
      color: '#24292e',
      gradient: 'from-[#24292e] to-[#404448]',
      shadow: 'rgba(36, 41, 46, 0.35)',
      description: 'Publish code repositories, projects, and developer profile cards.',
      icon: <Github className="w-5 h-5" />,
      accentText: 'text-gray-200',
      mockData: {
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
        name: 'Devin Thorne',
        handle: '@devinthorn',
        bio: 'Senior Staff Engineer | React core contributor & open-source builder 💻',
        buttonText: 'Fork Repositories',
        stats: '7.1k Clicks • 12.5% CTR'
      }
    },
    {
      id: 'youtube',
      name: 'YouTube',
      color: '#FF0000',
      gradient: 'from-red-600 to-rose-700',
      shadow: 'rgba(255, 0, 0, 0.35)',
      description: 'Stream video playlists, tutorials, and direct channel subscriptions.',
      icon: <Youtube className="w-5 h-5" />,
      accentText: 'text-red-500',
      mockData: {
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
        name: 'Elena Rose',
        handle: '@elenarose_vlogs',
        bio: 'Tech Reviewer & Vlogger 🎥 | Weekly tech tutorials & desk setups',
        buttonText: 'Subscribe on YouTube',
        stats: '12.4k Clicks • 6.8% CTR'
      }
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      color: '#010101',
      gradient: 'from-[#00f2fe] via-black to-[#4facfe]',
      shadow: 'rgba(0, 242, 254, 0.25)',
      description: 'Embed viral vertical clips, reviews, and short-form content.',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.62 4.2 1.13 1.25 2.69 2.05 4.35 2.27v3.91c-1.85-.02-3.66-.56-5.21-1.57-.18-.12-.35-.25-.51-.39-.01 2.37.02 4.75-.01 7.12-.08 2.04-.73 4.09-2.02 5.67-1.74 2.19-4.57 3.32-7.34 2.94-2.61-.31-4.99-1.99-6.09-4.42-1.39-2.92-.88-6.66 1.27-9.05 1.77-2.05 4.54-3.05 7.21-2.6v3.94c-1.42-.23-2.94.19-3.92 1.23-.97.98-1.32 2.45-.92 3.79.36 1.26 1.48 2.22 2.78 2.41 1.44.25 2.98-.36 3.73-1.63.45-.73.61-1.6.58-2.45.02-4.92-.01-9.84.02-14.76z" />
        </svg>
      ),
      accentText: 'text-cyan-400',
      mockData: {
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&auto=format&fit=crop&q=80',
        name: 'Chloe Vlogs',
        handle: '@chloe_dances',
        bio: 'Dance Instructor & Short Content Creator 💃 | Dynamic daily challenges',
        buttonText: 'Watch on TikTok',
        stats: '15.6k Clicks • 7.5% CTR'
      }
    },
    {
      id: 'discord',
      name: 'Discord',
      color: '#5865F2',
      gradient: 'from-[#5865F2] to-indigo-700',
      shadow: 'rgba(88, 101, 242, 0.35)',
      description: 'Invite your followers directly to your gaming & coding servers.',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.094 13.094 0 0 1-1.873-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z" />
        </svg>
      ),
      accentText: 'text-indigo-400',
      mockData: {
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80',
        name: 'Gamer Clan x',
        handle: 'discord.gg/clan-x',
        bio: 'Competitive eSports Clan 🎮 | Joining regional tournaments weekly',
        buttonText: 'Accept Server Invite',
        stats: '8.4k Invites • 14.2% CTR'
      }
    }
  ];

  const activePlatformConfig = socialPlatforms.find(p => p.id === currentPlatform) || socialPlatforms[0];

  return (
    <main className="min-h-screen bg-background text-foreground overflow-hidden select-none font-sans">
      <Navbar />

      {/* SECTION 1: HERO */}
      <section className="relative isolate pt-32 pb-44 px-6 overflow-hidden flex flex-col items-center">
        {/* Sky background — z-0 so it stays above page bg */}
        <div
          className="hero-sky absolute top-0 left-0 w-full h-full min-h-[720px] z-0 pointer-events-none overflow-hidden"
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 82%, 50% 100%, 0 82%)' }}
        >
          <div className="absolute inset-0 hero-sky-glow opacity-50" />
          <div className="absolute top-20 left-10 w-96 h-36 bg-white/25 rounded-full blur-[80px] animate-pulse pointer-events-none" style={{ animationDuration: '8s' }} />
          <div className="absolute top-44 right-10 w-[450px] h-48 bg-white/35 rounded-full blur-[90px] animate-pulse pointer-events-none" style={{ animationDuration: '12s' }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left: headline */}
          <div className="lg:col-span-6 flex flex-col text-center lg:text-left items-center lg:items-start hero-copy space-y-6">
            <div className="hero-badge inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest shadow-sm animate-bounce-slow">
              <Sparkles className="w-3.5 h-3.5 hero-badge-icon" /> Unify your digital world
            </div>

            <h1 className="hero-title text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.08]">
              The union of your <br />
              <span className="hero-accent">digital identity</span> <br />
              begins here
            </h1>

            <p className="hero-subtitle text-sm sm:text-base md:text-lg max-w-xl leading-relaxed font-medium">
              Create a luxury landing profile page in seconds. Consolidate your social media, share a universal link or organic QR code, and track click metrics in real-time.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link href="/signup" className="btn-premium w-full sm:w-auto h-12 px-8 text-xs font-black uppercase tracking-wider shadow-xl shadow-primary/20">
                Get Started in 30s <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
              <a href="#estimations" className="hero-secondary-cta w-full sm:w-auto h-12 px-8 text-xs font-black uppercase tracking-wider inline-flex items-center justify-center rounded-xl transition-all active:scale-[0.98] cursor-pointer">
                <Play className="w-3.5 h-3.5 mr-2 fill-current" /> Watch Potential
              </a>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
              <div className="flex -space-x-1.5">
                <img className="h-7 w-7 rounded-full ring-2 ring-blue-500 object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" alt="user" />
                <img className="h-7 w-7 rounded-full ring-2 ring-blue-500 object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" alt="user" />
                <img className="h-7 w-7 rounded-full ring-2 ring-blue-500 object-cover" src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100" alt="user" />
                <img className="h-7 w-7 rounded-full ring-2 ring-blue-500 object-cover" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100" alt="user" />
              </div>
              <div className="hero-social-proof text-[11px] font-extrabold uppercase tracking-wider">
                Loved by <span className="hero-accent font-black">12,000+ creators</span> worldwide ⭐⭐⭐⭐⭐
              </div>
            </div>
          </div>

          {/* Right Column: Premium Editorial Creator + CSS Interactive Floating Widgets */}
          <div className="lg:col-span-6 flex items-center justify-center relative w-full h-[380px] sm:h-[480px]">
            {/* The Main Editorial Photo Container */}
            <div className="w-[260px] sm:w-[320px] h-[340px] sm:h-[420px] rounded-[2.5rem] overflow-hidden border-4 border-white/60 shadow-[0_32px_64px_rgba(0,0,0,0.15)] relative z-10 transition-transform duration-500 hover:rotate-1">
              <img 
                src="/homepage_creator.png" 
                alt="Featured Viewi Creator Portrait" 
                className="w-full h-full object-cover select-none" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/10 via-transparent to-transparent" />
            </div>

            {/* Interactive Glassmorphic Floating Widget A: Creator Pill Profile */}
            <div className="absolute top-10 left-0 sm:left-4 z-20 flex items-center gap-3 p-2.5 rounded-full bg-white/90 border border-white/50 shadow-[0_16px_32px_rgba(0,0,0,0.08)] backdrop-blur-md animate-bounce-slow max-w-[190px]">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80" className="w-8 h-8 rounded-full border border-gray-200 object-cover" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-gray-800 leading-tight">Sarah Jenkins</span>
                <span className="text-[8px] font-bold text-gray-500 leading-none">@sarah.jenkins</span>
              </div>
              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-white text-[8px] font-bold shadow-sm">✓</div>
            </div>

            {/* Interactive Widget B: Floating Live Views Area Chart */}
            <div className="absolute bottom-16 right-0 sm:right-6 z-20 p-3 rounded-2xl bg-slate-900/90 border border-slate-700 shadow-xl backdrop-blur-md flex flex-col gap-1 w-[130px] sm:w-[150px] animate-bounce-slow" style={{ animationDelay: '1.2s' }}>
              <span className="text-[8.5px] font-black tracking-widest text-slate-400 uppercase">LIVE PROFILE VIEWS</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm sm:text-base font-black text-white">12,490</span>
                <span className="text-[8px] font-extrabold text-green-400">+124%</span>
              </div>
              {/* Clean mini CSS/SVG chart path */}
              <div className="h-6 w-full mt-1.5 opacity-80">
                <svg className="w-full h-full" viewBox="0 0 100 30" fill="none">
                  <path d="M0,25 Q15,10 30,18 T60,5 T90,12 L100,10" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M0,25 Q15,10 30,18 T60,5 T90,12 L100,10 L100,30 L0,30 Z" fill="url(#purpleGlow)" opacity="0.15"/>
                  <defs>
                    <linearGradient id="purpleGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6"/>
                      <stop offset="100%" stopColor="transparent"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Interactive Widget C: Connected Platforms Pill */}
            <div className="absolute bottom-28 left-0 sm:left-4 z-20 flex items-center gap-2 p-2 px-3.5 rounded-full bg-white/95 border border-slate-200 shadow-lg text-slate-800 text-[9px] font-black uppercase tracking-wider animate-bounce-slow dark:bg-white/30 dark:border-white/20 dark:text-white" style={{ animationDelay: '0.6s' }}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              +5 Platforms Connected
            </div>

            {/* Interactive Widget D: Organic Maze QR Code */}
            <div className="absolute top-16 right-2 sm:right-10 z-20 p-2.5 rounded-2xl bg-white shadow-xl flex items-center justify-center animate-bounce-slow" style={{ animationDelay: '1.8s' }}>
              <QrCode className="w-8 h-8 sm:w-10 sm:h-10 text-gray-800" />
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 2: CONNECTION NETWORK HUB (Circuit Path Layout) */}
      <section id="features" className="py-28 px-6 max-w-7xl mx-auto w-full relative scroll-mt-24">
        {/* Background micro grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10" />

        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 text-[10px] font-black uppercase tracking-widest border border-violet-500/20">
            Platform Union
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            A clear entry to the <br />
            <span className="gradient-text">connected universe</span> of platforms
          </h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto font-medium">
            Never struggle with multiple bio links again. Weave all your accounts, files, and channels into one single universal canvas.
          </p>
        </div>

        {/* 3D Mobile Profile Mockup and Circuit Platforms Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-8">
          
          {/* Left Column: Social Network Selection Capsules */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <h3 className="text-lg font-black tracking-wider text-muted-foreground uppercase pl-2">ACTIVE CHANNELS</h3>
            
            <div className="flex flex-col gap-3">
              {socialPlatforms.map((platform) => {
                const isSelected = currentPlatform === platform.id;
                
                return (
                  <button
                    key={platform.id}
                    onClick={() => setActivePlatform(platform.id)}
                    onMouseEnter={() => setHoveredPlatform(platform.id)}
                    onMouseLeave={() => setHoveredPlatform(null)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left cursor-pointer ${
                      isSelected
                        ? `bg-white/[0.04] text-white shadow-md`
                        : 'bg-white/[0.01] border-white/5 text-muted-foreground hover:bg-white/[0.02] hover:text-white/80'
                    }`}
                    style={{
                      borderColor: isSelected ? `${platform.color}40` : '',
                      boxShadow: isSelected ? `0 8px 24px -4px ${platform.shadow}` : ''
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 rounded-xl transition-all duration-300"
                           style={{
                             backgroundColor: isSelected ? `${platform.color}20` : 'rgba(255,255,255,0.02)',
                             color: isSelected ? platform.color : 'inherit'
                           }}>
                        {platform.icon}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black tracking-tight">{platform.name}</span>
                        {isSelected && (
                          <span className="text-[11px] text-muted-foreground font-medium mt-0.5 leading-snug animate-in fade-in duration-300">
                            {platform.description}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                      isSelected ? 'bg-white text-black border-transparent' : 'border-white/10 text-transparent'
                    }`}>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: 3D High-Fidelity Smartphone mock with connecting glowing SVGs */}
          <div className="lg:col-span-7 flex items-center justify-center relative min-h-[480px]">
            {/* Ambient Background Glow for Platform color */}
            <div 
              className="absolute w-[280px] h-[280px] rounded-full blur-[100px] opacity-15 pointer-events-none -z-10 transition-all duration-500" 
              style={{
                backgroundColor: activePlatformConfig.color
              }}
            />

            {/* Glowing Circuit Connection Lines (Animated SVG paths pointing from grid positions to center phone) */}
            <div className="absolute inset-0 pointer-events-none hidden md:block">
              <svg className="w-full h-full" viewBox="0 0 600 500" fill="none">
                {/* Custom paths mapping coordinates around the center mobile mockup at (300, 250) */}
                
                {/* Path 1: Top-Left platform to Phone */}
                <path d="M 80 80 Q 200 80, 260 200" stroke={currentPlatform === 'instagram' ? '#E1306C' : 'rgba(255,255,255,0.04)'} strokeWidth={currentPlatform === 'instagram' ? '3' : '1.5'} strokeLinecap="round" className="transition-colors duration-500" />
                
                {/* Path 2: Mid-Left to Phone */}
                <path d="M 60 230 Q 180 230, 250 250" stroke={currentPlatform === 'linkedin' ? '#0077B5' : 'rgba(255,255,255,0.04)'} strokeWidth={currentPlatform === 'linkedin' ? '3' : '1.5'} strokeLinecap="round" className="transition-colors duration-500" />

                {/* Path 3: Bottom-Left to Phone */}
                <path d="M 80 380 Q 200 380, 260 300" stroke={currentPlatform === 'github' ? '#ffffff' : 'rgba(255,255,255,0.04)'} strokeWidth={currentPlatform === 'github' ? '3' : '1.5'} strokeLinecap="round" className="transition-colors duration-500" />

                {/* Path 4: Top-Right to Phone */}
                <path d="M 520 80 Q 400 80, 340 200" stroke={currentPlatform === 'youtube' ? '#FF0000' : 'rgba(255,255,255,0.04)'} strokeWidth={currentPlatform === 'youtube' ? '3' : '1.5'} strokeLinecap="round" className="transition-colors duration-500" />

                {/* Path 5: Mid-Right to Phone */}
                <path d="M 540 230 Q 420 230, 350 250" stroke={currentPlatform === 'tiktok' ? '#00f2fe' : 'rgba(255,255,255,0.04)'} strokeWidth={currentPlatform === 'tiktok' ? '3' : '1.5'} strokeLinecap="round" className="transition-colors duration-500" />

                {/* Path 6: Bottom-Right to Phone */}
                <path d="M 520 380 Q 400 380, 340 300" stroke={currentPlatform === 'discord' ? '#5865F2' : 'rgba(255,255,255,0.04)'} strokeWidth={currentPlatform === 'discord' ? '3' : '1.5'} strokeLinecap="round" className="transition-colors duration-500" />
              </svg>
            </div>

            {/* Glowing floating SVG nodules (nodes) representing the connection points */}
            <div className="absolute top-16 left-16 w-3 h-3 rounded-full hidden md:block transition-all duration-500" style={{ backgroundColor: currentPlatform === 'instagram' ? '#E1306C' : 'rgba(255,255,255,0.1)', boxShadow: currentPlatform === 'instagram' ? '0 0 12px #E1306C' : '' }} />
            <div className="absolute top-52 left-10 w-3 h-3 rounded-full hidden md:block transition-all duration-500" style={{ backgroundColor: currentPlatform === 'linkedin' ? '#0077B5' : 'rgba(255,255,255,0.1)', boxShadow: currentPlatform === 'linkedin' ? '0 0 12px #0077B5' : '' }} />
            <div className="absolute bottom-24 left-16 w-3 h-3 rounded-full hidden md:block transition-all duration-500" style={{ backgroundColor: currentPlatform === 'github' ? '#ffffff' : 'rgba(255,255,255,0.1)', boxShadow: currentPlatform === 'github' ? '0 0 12px #ffffff' : '' }} />
            
            <div className="absolute top-16 right-16 w-3 h-3 rounded-full hidden md:block transition-all duration-500" style={{ backgroundColor: currentPlatform === 'youtube' ? '#FF0000' : 'rgba(255,255,255,0.1)', boxShadow: currentPlatform === 'youtube' ? '0 0 12px #FF0000' : '' }} />
            <div className="absolute top-52 right-10 w-3 h-3 rounded-full hidden md:block transition-all duration-500" style={{ backgroundColor: currentPlatform === 'tiktok' ? '#00f2fe' : 'rgba(255,255,255,0.1)', boxShadow: currentPlatform === 'tiktok' ? '0 0 12px #00f2fe' : '' }} />
            <div className="absolute bottom-24 right-16 w-3 h-3 rounded-full hidden md:block transition-all duration-500" style={{ backgroundColor: currentPlatform === 'discord' ? '#5865F2' : 'rgba(255,255,255,0.1)', boxShadow: currentPlatform === 'discord' ? '0 0 12px #5865F2' : '' }} />

            {/* Center Piece: 3D-Style Smartphone Card Mockup */}
            <div className="w-[230px] sm:w-[260px] h-[440px] sm:h-[500px] bg-[#0c0c0e] border-[6px] border-[#1e1e24] rounded-[2.5rem] p-4 flex flex-col justify-between shadow-[0_24px_50px_-12px_rgba(0,0,0,0.8)] relative z-10 select-none overflow-hidden animate-in zoom-in-95 duration-500">
              
              {/* Dynamic Theme Glow over phone screen */}
              <div 
                className="absolute top-0 left-0 w-full h-[60%] opacity-10 pointer-events-none -z-10 transition-colors duration-500"
                style={{
                  backgroundImage: `radial-gradient(circle at 50% 0%, ${activePlatformConfig.color}, transparent 70%)`
                }}
              />

              {/* Dynamic Camera Notch (Dynamic Island) */}
              <div className="w-20 h-5 bg-[#1e1e24] rounded-full mx-auto flex items-center justify-between px-2.5">
                <div className="w-1.5 h-1.5 bg-black/40 rounded-full" />
                <div className="w-6 h-1.5 bg-black/80 rounded-full" />
              </div>

              {/* Mock Mobile Profile Page */}
              <div className="flex-1 flex flex-col justify-between pt-6 pb-2 relative z-10">
                {/* Identity header segment */}
                <div className="text-center space-y-3">
                  <div className="relative w-14 h-14 mx-auto">
                    <img 
                      src={activePlatformConfig.mockData.avatar} 
                      className="w-full h-full rounded-full border-2 border-white/10 object-cover transition-all duration-500" 
                      style={{
                        borderColor: activePlatformConfig.color
                      }}
                    />
                    <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold shadow-md"
                         style={{ backgroundColor: activePlatformConfig.color }}>✓</div>
                  </div>
                  
                  <div>
                    <h4 className="text-[12px] font-black tracking-tight text-foreground dark:text-white leading-tight">{activePlatformConfig.mockData.name}</h4>
                    <p className="text-[9px] font-bold text-muted-foreground leading-none mt-0.5">{activePlatformConfig.mockData.handle}</p>
                  </div>

                  <p className="text-[9px] font-semibold text-muted-foreground leading-relaxed px-4 max-w-[200px] mx-auto min-h-[30px] line-clamp-2">
                    {activePlatformConfig.mockData.bio}
                  </p>
                </div>

                {/* Overlaid Platform Link Actions */}
                <div className="space-y-2 mt-4 px-2">
                  <div className={`w-full py-2.5 px-4 rounded-full text-center text-[10px] font-black uppercase tracking-wider text-white shadow-md transition-all active:scale-[0.98]`}
                       style={{
                         backgroundImage: `linear-gradient(to right, ${activePlatformConfig.color}, ${activePlatformConfig.color}dd)`
                       }}>
                    {activePlatformConfig.mockData.buttonText}
                  </div>

                  {/* Secondary items presets for preview */}
                  <div className="w-full py-2 px-4 rounded-full bg-white/[0.02] border border-white/5 text-center text-[9px] font-bold text-muted-foreground">
                    Visit Portfolio Gallery
                  </div>
                  <div className="w-full py-2 px-4 rounded-full bg-white/[0.02] border border-white/5 text-center text-[9px] font-bold text-muted-foreground">
                    Send Anonymous Message
                  </div>
                </div>

                {/* Footer Segment metrics */}
                <div className="text-center pt-4 border-t border-white/5">
                  <span className={`text-[9px] font-black tracking-widest uppercase transition-colors duration-500 ${activePlatformConfig.accentText}`}>
                    {activePlatformConfig.mockData.stats}
                  </span>
                  <div className="text-[7.5px] font-bold text-muted-foreground/70 mt-1 uppercase tracking-widest">REAL-TIME CLICK METRICS</div>
                </div>

              </div>

              {/* iOS Home Indicator Bar */}
              <div className="w-20 h-1 bg-white/20 rounded-full mx-auto mb-1 mt-1" />
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 3: INTERACTIVE CLICK & ENGAGEMENT ESTIMATOR */}
      <section id="estimations" className="py-28 px-6 max-w-7xl mx-auto w-full relative scroll-mt-24">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fcd34d]/10 text-[#fcd34d] text-[10px] font-black uppercase tracking-widest border border-[#fcd34d]/20">
            Live Estimator
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Estimate your digital <br />
            <span className="gradient-text">growth potential</span>
          </h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto font-medium">
            Configure your active metrics to project potential link engagement, visitor conversion rates, and monthly CTR growth using our premium system.
          </p>
        </div>

        {/* The Estimator Tool Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pt-4">
          
          {/* Left Column: Estimator Control Panel */}
          <div className="lg:col-span-6 p-6 sm:p-8 rounded-[2.5rem] glass-card flex flex-col justify-between">
            <div className="space-y-6">
              <h3 className="text-lg font-black tracking-tight text-foreground dark:text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-violet-400" /> Control Panel
              </h3>

              {/* Controller 1: Total Followers Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Audience Size</label>
                  <span className="text-sm font-black text-foreground dark:text-white px-2 py-0.5 rounded bg-foreground/5 dark:bg-white/5 border border-border">
                    {followers.toLocaleString()} followers
                  </span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="150000"
                  step="1000"
                  value={followers}
                  onChange={(e) => setFollowers(parseInt(e.target.value))}
                  className="w-full accent-violet-500 h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-bold text-muted-foreground px-1">
                  <span>1k</span>
                  <span>50k</span>
                  <span>100k</span>
                  <span>150k</span>
                </div>
              </div>

              {/* Controller 2: Engagement Level Capsule switches */}
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Audience Engagement</label>
                <div className="bg-white/5 p-1 rounded-xl grid grid-cols-3 gap-2 border border-white/5">
                  <button
                    onClick={() => setEngagement('low')}
                    className={`py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                      engagement === 'low'
                        ? 'bg-[#1c1d24] text-[#eceef2] border border-white/10 shadow-sm'
                        : 'text-muted-foreground hover:text-muted-foreground'
                    }`}
                  >
                    Standard
                  </button>
                  <button
                    onClick={() => setEngagement('moderate')}
                    className={`py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                      engagement === 'moderate'
                        ? 'bg-[#1c1d24] text-[#eceef2] border border-white/10 shadow-sm'
                        : 'text-muted-foreground hover:text-muted-foreground'
                    }`}
                  >
                    High
                  </button>
                  <button
                    onClick={() => setEngagement('high')}
                    className={`py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                      engagement === 'high'
                        ? 'bg-[#1c1d24] text-[#eceef2] border border-white/10 shadow-sm'
                        : 'text-muted-foreground hover:text-muted-foreground'
                    }`}
                  >
                    Creator-level
                  </button>
                </div>
              </div>

              {/* Controller 3: Connected Platforms Selection checkboxes */}
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Platforms to Optimize</label>
                <div className="grid grid-cols-2 gap-3">
                  {['instagram', 'linkedin', 'github', 'youtube'].map((platformId) => {
                    const isSelected = selectedPlatforms.includes(platformId);
                    
                    return (
                      <button
                        key={platformId}
                        onClick={() => togglePlatformInEstimator(platformId)}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-violet-500/10 border-violet-500/30 text-white'
                            : 'bg-white/[0.01] border-white/5 text-muted-foreground hover:bg-white/[0.02]'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                          isSelected ? 'bg-violet-500 border-transparent text-white' : 'border-white/20'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="text-xs font-black uppercase tracking-wider">{platformId}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            <div className="mt-8 pt-6 border-t border-white/5 text-[11px] font-bold text-muted-foreground pl-1 uppercase tracking-widest flex items-center gap-2">
              <Lock className="w-3.5 h-3.5" /> Calculations based on live platform benchmarks
            </div>

          </div>

          {/* Right Column: Calculations Outputs and Live Progress visualizer */}
          <div className="lg:col-span-6 p-6 sm:p-8 rounded-[2.5rem] glass-card flex flex-col justify-between relative overflow-hidden">
            
            {/* Soft decorative glow behind outputs */}
            <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-violet-600/10 rounded-full blur-[80px] pointer-events-none" />

            <div className="space-y-6">
              <h3 className="text-lg font-black tracking-tight text-foreground dark:text-white flex items-center justify-between">
                <span>Projections Summary</span>
                <span className="text-xs text-green-400 font-extrabold uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full" /> Dynamic Log
                </span>
              </h3>

              {/* Dynamic metric counters rows */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* Metric 1: Monthly Visits */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">MONTHLY VIEWS</span>
                  <p className="text-2xl sm:text-3xl font-black text-foreground dark:text-white tracking-tight animate-in fade-in duration-300">
                    {projectedViews.toLocaleString()}
                  </p>
                  <p className="text-[10px] font-bold text-muted-foreground leading-none">Visits to universal bio</p>
                </div>

                {/* Metric 2: Estimated CTR */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">OPTIMIZED CTR</span>
                  <p className="text-2xl sm:text-3xl font-black text-violet-400 tracking-tight animate-in fade-in duration-300">
                    {projectedCTR}%
                  </p>
                  <p className="text-[10px] font-bold text-muted-foreground leading-none">Click-through rate boost</p>
                </div>

                {/* Metric 3: Total Engaged Clicks */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">TOTAL ROUTED CLICKS</span>
                  <p className="text-2xl sm:text-3xl font-black text-[#fcd34d] tracking-tight animate-in fade-in duration-300">
                    {projectedClicks.toLocaleString()}
                  </p>
                  <p className="text-[10px] font-bold text-muted-foreground leading-none">Clicks forwarded directly</p>
                </div>

                {/* Metric 4: Growth boost percent */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">CONVERSION BOOST</span>
                  <p className="text-2xl sm:text-3xl font-black text-green-400 tracking-tight animate-in fade-in duration-300">
                    +{growthPercent}%
                  </p>
                  <p className="text-[10px] font-bold text-muted-foreground leading-none">Over traditional layout links</p>
                </div>

              </div>

              {/* Progress dynamic bars visualizer representing optimization levels */}
              <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 space-y-4">
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest pl-1 block">Optimization Benchmarks</span>
                
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-black uppercase text-muted-foreground">
                      <span>Interactive Bio-Profile Efficiency</span>
                      <span>{Math.min(Math.round(projectedCTR * 8), 98)}%</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-500" 
                           style={{ width: `${Math.min(Math.round(projectedCTR * 8), 98)}%` }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-black uppercase text-muted-foreground">
                      <span>Click Leakage Protection</span>
                      <span>95%</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-[#fcd34d] rounded-full transition-all duration-500" style={{ width: '95%' }} />
                    </div>
                  </div>
                </div>

              </div>

            </div>

            <Link href="/signup" className="btn-premium w-full h-12 mt-6 uppercase text-xs font-black tracking-widest flex items-center justify-center gap-1.5 shadow-lg">
              CLAIM YOUR HANDLE NOW <ArrowRight className="w-4 h-4" />
            </Link>

          </div>

        </div>
      </section>

      {/* SECTION 4: TESTIMONIAL GRIDS & CASES */}
      <section id="testimonials" className="py-28 px-6 max-w-7xl mx-auto w-full relative scroll-mt-24">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
            Success Indicators
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            The best minds have been <br />
            <span className="gradient-text">seeking approaches</span> to link optimization
          </h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto font-medium">
            Discover how verified creators and marketing teams utilize Viewi to aggregate traffic, print custom QR presets, and claim audiences.
          </p>
        </div>

        {/* Dual High-Fidelity Showcase Panel Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-4">
          
          {/* Panel A: Neon Analytics Card */}
          <div className="md:col-span-6 p-8 rounded-[2.5rem] glass-card flex flex-col justify-between min-h-[380px] relative overflow-hidden">
            {/* Top segment title */}
            <div className="space-y-4 z-10">
              <div className="w-fit p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-black tracking-tight leading-snug">
                Analyzing the reach <br />
                reveals the truth of click metrics
              </h3>
              <p className="text-xs font-semibold text-muted-foreground leading-relaxed max-w-sm">
                "Viewi's custom analytics dashboard let us isolate referring domains, optimize profile layouts, and redirect visitors to campaign funnels with 100% precision."
              </p>
            </div>

            {/* Testimonial Author Pill */}
            <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-6 z-10">
              <div className="flex items-center gap-3">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" className="w-10 h-10 rounded-full object-cover border border-white/10" />
                <div className="flex flex-col">
                  <span className="text-xs font-black text-foreground dark:text-white leading-tight">Nicholas Vance</span>
                  <span className="text-[9.5px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">VP of Product, Cloud Tech</span>
                </div>
              </div>
              
              {/* Linked brand logos */}
              <div className="flex items-center gap-2 text-muted-foreground/70">
                <Github className="w-4 h-4" />
                <Linkedin className="w-4 h-4" />
              </div>
            </div>

          </div>

          {/* Panel B: Editorial Case Study Card */}
          <div className="md:col-span-6 rounded-[2.5rem] border border-white/[0.06] shadow-xl min-h-[380px] relative overflow-hidden flex flex-col justify-end p-8">
            {/* Absolute backdrop case study image */}
            <div className="absolute inset-0 z-0">
              <img 
                src="/testimonial_creator.png" 
                alt="Case Study Creator Portrait" 
                className="w-full h-full object-cover select-none" 
              />
              {/* Deep dark gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            </div>

            {/* Content overlay */}
            <div className="space-y-4 z-10 relative">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-[9px] font-black uppercase tracking-wider backdrop-blur-md">
                <Star className="w-3.5 h-3.5 text-yellow-300 fill-current" /> CASE STUDY SUCCESS
              </div>

              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">BIO-LINK GENERATED VALUE</span>
                <p className="text-3xl font-black text-white tracking-tight">$8,234.00</p>
                <p className="text-[10px] font-bold text-green-400 leading-none uppercase mt-1 tracking-widest">+38% Engaged Leads This Month</p>
              </div>

              <p className="text-xs font-semibold text-muted-foreground leading-relaxed max-w-sm">
                "Consolidating my platforms into Viewi helped me secure high-end sponsorships and double my link-in-bio conversions instantly."
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 5: COSMIC DARK FOOTER (PLG Username claim handle) */}
      <section id="claim" className="relative py-32 px-6 overflow-hidden bg-background dark:bg-black flex flex-col items-center justify-center scroll-mt-24">
        {/* Deep black/indigo mesh gradient background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(139,92,246,0.15),transparent_60%)] pointer-events-none -z-10" />

        {/* Blazing cosmic central beam of light (Sleek vector drawing) */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-[240px] bg-gradient-to-t from-violet-500 via-violet-500/20 to-transparent pointer-events-none z-0" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-[120px] bg-violet-600/20 blur-[16px] pointer-events-none z-0" />

        <div className="max-w-4xl mx-auto text-center space-y-8 z-10 relative">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none text-foreground dark:text-white">
            Expansion potential of your <br />
            <span className="gradient-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400">digital presence</span>
          </h2>

          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed font-semibold">
            Claim your unique professional handle, consolidate your links into an organic layout, and watch your visitor metrics soar. 100% free setup in seconds.
          </p>

          {/* PLG Claim Handle Form Card */}
          <div className="max-w-md mx-auto p-2 glass-card rounded-2xl flex flex-col sm:flex-row items-center gap-2 shadow-xl backdrop-blur-md">
            <div className="w-full flex items-center gap-1 px-4 py-2 sm:py-0">
              <span className="text-sm font-bold text-muted-foreground tracking-tight">viewi.link/</span>
              <input
                type="text"
                placeholder="username"
                value={claimUsername}
                onChange={(e) => setClaimUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
                className="w-full bg-transparent border-none text-sm font-black text-foreground dark:text-white focus:outline-none placeholder:text-muted-foreground/70 select-text"
              />
            </div>
            
            <Link 
              href={`/signup?username=${claimUsername}`}
              className="w-full sm:w-auto px-6 h-12 bg-white text-black font-black uppercase text-xs tracking-widest rounded-xl hover:bg-gray-100 flex items-center justify-center gap-1.5 shrink-0 transition-all active:scale-[0.98]"
            >
              Claim Handle <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
            </Link>
          </div>

          <div className="flex items-center justify-center gap-8 text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest pt-4">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-violet-400" /> Free Setup</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-violet-400" /> No credit card required</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-violet-400" /> Cancel anytime</span>
          </div>

        </div>
      </section>

      {/* FOOTER segment */}
      <footer className="py-12 border-t border-border bg-background z-10 relative">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Viewi" className="w-8 h-8 object-contain" />
            <span className="text-lg font-black tracking-tighter gradient-text">Viewi</span>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">&copy; 2026 Viewi. All rights reserved.</p>
          <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest">
            <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link>
            <a href="mailto:support@viewi.link" className="text-muted-foreground hover:text-foreground transition-colors">Support</a>
          </div>
        </div>
      </footer>

    </main>
  );
}
