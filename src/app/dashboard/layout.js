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

      {/* Top Navbar - Desktop & Mobile Header */}
      <header className="fixed top-0 left-0 right-0 h-20 border-b border-border bg-background/80 backdrop-blur-2xl z-40 flex items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Logo />
          
          {/* Desktop Navigation Links */}
          <div className="hidden md:block">
            <NavLinks pathname={pathname} onNavItemClick={() => {}} direction="horizontal" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link 
              href={user ? `/${user.username}` : '#'}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all text-sm font-bold border border-primary/20 group"
            >
              <ExternalLink className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span className="hidden lg:inline">Public Page</span>
            </Link>
            
            <div className="w-px h-6 bg-border mx-2" />
            
            {/* User Mini Card */}
            <div className="flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-full border border-border/50 bg-foreground/[0.02]">
               <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center overflow-hidden">
                  {user?.image ? (
                    <img src={user.image} alt="User" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-4 h-4 text-primary" />
                  )}
               </div>
               <span className="text-xs font-bold truncate max-w-[100px]">{user?.name || user?.username || 'User'}</span>
            </div>

            <div className="w-px h-6 bg-border mx-2" />

            <ThemeToggle variant="compact" />
            <LogoutButton onLogout={handleLogout} variant="icon" />
          </div>

          {/* Mobile Hamburger */}
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors md:hidden"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Mobile Drawer (Left Sidebar on Mobile only) */}
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
        
        {/* User Card in Mobile Sidebar */}
        <div className="mb-8 p-4 rounded-2xl surface-panel flex items-center gap-3">
           <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center overflow-hidden">
              {user?.image ? (
                <img src={user.image} alt="User" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-5 h-5 text-primary" />
              )}
           </div>
           <div className="flex-1 min-w-0">
             <p className="text-sm font-bold truncate">{user?.name || user?.username || 'User'}</p>
             <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Free Plan</p>
           </div>
        </div>

        <NavLinks pathname={pathname} onNavItemClick={() => setIsSidebarOpen(false)} direction="vertical" />
        
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
          <LogoutButton onLogout={handleLogout} variant="full" />
        </div>
      </aside>

      {/* Overlay for Mobile Drawer */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 md:hidden animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 pt-20 min-h-screen w-full">
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

function NavLinks({ pathname, onNavItemClick, direction = 'vertical' }) {
  const menuItems = [
    { name: 'Overview', icon: LayoutDashboard, href: '/dashboard' },
    { name: 'Profile', icon: UserIcon, href: '/dashboard/profile' },
    { name: 'Analytics', icon: BarChart3, href: '/dashboard/analytics' },
    { name: 'Settings', icon: Settings, href: '/dashboard/settings' },
  ];

  const isHorizontal = direction === 'horizontal';

  return (
    <nav className={cn(
      "flex",
      isHorizontal ? "flex-row items-center gap-1.5 p-1.5 rounded-[1.25rem] bg-foreground/[0.02] border border-border/40 shadow-sm" : "flex-col space-y-1"
    )}>
      {menuItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={onNavItemClick}
            className={cn(
              "flex items-center gap-2.5 transition-all duration-300 group text-sm font-bold relative overflow-hidden",
              isHorizontal ? "px-4 py-2.5 rounded-xl" : "px-5 py-3.5 rounded-2xl",
              isActive 
                ? (isHorizontal 
                    ? "text-foreground bg-background shadow-md border border-border/50" 
                    : "text-foreground bg-foreground/[0.05] border border-border") 
                : "text-muted-foreground hover:text-foreground hover:bg-foreground/[0.03]"
            )}
          >
            {/* Active Indicator for Vertical */}
            {isActive && !isHorizontal && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-full shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
            )}
            
            <item.icon className={cn(
              "w-4 h-4 transition-all duration-300",
              isActive ? "text-primary scale-110" : "group-hover:scale-110"
            )} />
            <span className={cn(isHorizontal && !isActive && "hidden lg:inline")}>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function LogoutButton({ onLogout, variant = 'full' }) {
  if (variant === 'icon') {
    return (
      <button 
        onClick={onLogout}
        className="p-2.5 rounded-xl text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors group border border-transparent hover:border-red-500/20"
        title="Sign Out"
      >
        <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
      </button>
    );
  }

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
