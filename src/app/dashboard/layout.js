'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  BarChart3, 
  User as UserIcon, 
  Settings, 
  ExternalLink, 
  Menu,
  X,
  LayoutDashboard,
  LogOut,
  Share2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ThemeToggle from '@/components/ThemeToggle';

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else if (res.status === 401) {
          console.log('Session expired, logging out...');
          handleLogout();
        }
      } catch (err) {
        console.error('Failed to fetch user in layout', err);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout failed');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex selection:bg-primary/30" suppressHydrationWarning>
      {/* Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10" suppressHydrationWarning>
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px]" />
      </div>

      {/* Sidebar - Desktop */}
      <aside className="w-72 border-r border-border bg-background/80 backdrop-blur-2xl hidden md:flex flex-col fixed h-full z-40" suppressHydrationWarning>
        <div className="p-8">
          <Logo />
        </div>
        
        {/* User Card in Sidebar */}
        <div className="px-6 mb-8" suppressHydrationWarning>
          <div className="p-4 rounded-2xl surface-panel flex items-center gap-3" suppressHydrationWarning>
             <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center overflow-hidden" suppressHydrationWarning>
                {user?.image ? (
                  <img src={user.image} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-5 h-5 text-primary" />
                )}
             </div>
             <div className="flex-1 min-w-0" suppressHydrationWarning>
               <p className="text-sm font-bold truncate">{user?.name || user?.username || 'User'}</p>
               <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Free Plan</p>
             </div>
          </div>
        </div>

        <div className="flex-1 px-4">
          <NavLinks pathname={pathname} onNavItemClick={() => {}} />
          
          <div className="mt-6 px-1">
            <Link 
              href={user ? `/${user.username}` : '#'}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-primary/10 text-primary hover:bg-primary/20 transition-all text-sm font-bold border border-primary/20 group"
            >
              <ExternalLink className="w-5 h-5 transition-transform group-hover:scale-110" />
              Check Public Page
            </Link>
          </div>
        </div>

        <div className="p-6 mt-auto space-y-3">
          <div className="flex items-center justify-between px-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Theme</span>
            <ThemeToggle variant="compact" />
          </div>
          <LogoutButton onLogout={handleLogout} />
        </div>
      </aside>

      {/* Sidebar - Mobile Drawer */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-80 bg-background/95 backdrop-blur-2xl border-r border-border z-[60] p-6 flex flex-col transition-transform duration-500 ease-out md:hidden",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between mb-10">
          <Logo />
          <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        <NavLinks pathname={pathname} onNavItemClick={() => setIsSidebarOpen(false)} />
        
        <div className="mt-6">
          <Link 
            href={user ? `/${user.username}` : '#'}
            onClick={() => setIsSidebarOpen(false)}
            className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-primary/10 text-primary text-sm font-bold border border-primary/20"
          >
            <ExternalLink className="w-5 h-5" />
            Check Public Page
          </Link>
        </div>

        <div className="mt-auto pt-6 border-t border-border space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Theme</span>
            <ThemeToggle variant="compact" />
          </div>
          <LogoutButton onLogout={handleLogout} />
        </div>
      </aside>

      {/* Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 md:hidden animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-72 min-h-screen">
        {/* Mobile Header Only */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 glass-liquid md:hidden">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold capitalize tracking-tight text-foreground">
              {pathname.split('/').pop() === 'dashboard' ? 'Overview' : pathname.split('/').pop()}
            </h1>
          </div>
          <ThemeToggle variant="compact" />
        </header>

        <div className="p-6 md:p-12 max-w-7xl mx-auto animate-entrance">
          {children}
        </div>
      </main>
    </div>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-primary/20 relative group overflow-hidden">
        <span className="relative z-10">V</span>
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
      </div>
      <span className="text-2xl font-black tracking-tighter text-foreground">Viewi</span>
    </div>
  );
}

function NavLinks({ pathname, onNavItemClick }) {
  const menuItems = [
    { name: 'Overview', icon: LayoutDashboard, href: '/dashboard' },
    { name: 'Profile', icon: UserIcon, href: '/dashboard/profile' },
    { name: 'Social Connects', icon: Share2, href: '/dashboard/socials' },
    { name: 'Analytics', icon: BarChart3, href: '/dashboard/analytics' },
    { name: 'Settings', icon: Settings, href: '/dashboard/settings' },
  ];

  return (
    <nav className="space-y-1">
      {menuItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={onNavItemClick}
            className={cn(
              "flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all duration-300 group text-sm font-bold relative overflow-hidden",
              isActive 
                ? "text-foreground bg-foreground/[0.05] border border-border" 
                : "text-muted-foreground hover:text-foreground hover:bg-foreground/[0.02]"
            )}
          >
            {isActive && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-full shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
            )}
            <item.icon className={cn(
              "w-5 h-5 transition-all duration-300",
              isActive ? "text-primary scale-110" : "group-hover:scale-110"
            )} />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}

function LogoutButton({ onLogout }) {
  return (
    <button 
      onClick={onLogout}
      className="flex items-center gap-3 px-5 py-4 rounded-2xl text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-all w-full text-sm font-bold group border border-transparent hover:border-red-500/20"
    >
      <div className="p-2 rounded-lg bg-red-500/5 group-hover:bg-red-500/10 transition-colors">
        <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
      </div>
      Sign Out
    </button>
  );
}
