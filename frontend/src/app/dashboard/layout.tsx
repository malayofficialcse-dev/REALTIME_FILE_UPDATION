'use client';

import { 
  Zap, LayoutGrid, PieChart, Users, Briefcase, Star, Settings, Layers,
  HelpCircle, Mail, MessageSquare, Shield, LogOut, Moon, Sun,
  PlusCircle, Bell, Home, ChevronRight, LayoutDashboard, Search, X
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from '@/components/providers';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    setMounted(true);
    const email = localStorage.getItem('userEmail') || 'guest@prosync.com';
    setUserEmail(email);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  const menuItems = [
    { label: 'Workspaces', icon: LayoutGrid, path: '/dashboard' },
    { label: 'Strategic Matrix', icon: Layers, path: '/dashboard/kanban' },
    { label: 'Analytics', icon: PieChart, path: '/dashboard/analytics' },
    { label: 'Team Stream', icon: Users, path: '/dashboard/team' },
    { label: 'Projects', icon: Briefcase, path: '/dashboard/projects' },
    { label: 'Favorites', icon: Star, path: '/dashboard/favorites' },
  ];

  const featureItems = [
    { label: 'Automation', icon: Zap, path: '/dashboard/automation', badge: 'Beta' },
    { label: 'Direct Mail', icon: Mail, path: '/dashboard/mail' },
    { label: 'Chat Wall', icon: MessageSquare, path: '/dashboard/chat' },
    { label: 'Global Audit', icon: Shield, path: '/dashboard/audit' },
  ];

  const supportItems = [
    { label: 'Settings', icon: Settings, path: '/dashboard/settings' },
    { label: 'Help Center', icon: HelpCircle, path: '/dashboard/help' },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <div className="min-h-screen mesh-bg text-foreground flex">
      {/* Premium Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col p-6 overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-3 mb-12">
            <div 
              className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xl cursor-pointer hover:rotate-12 transition-transform"
              onClick={() => router.push('/dashboard')}
            >
              <Zap size={20} fill="currentColor" />
            </div>
            <span className="text-2xl font-black tracking-tighter gradient-text">ProSync</span>
          </div>

          <div className="space-y-9 flex-1">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-3 mb-4">Core Ecosystem</p>
              {menuItems.map((item, i) => (
                <button 
                  key={i} 
                  onClick={() => router.push(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-3 font-bold text-sm transition-all rounded-xl ${isActive(item.path) ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}
                >
                  <item.icon size={19} className={isActive(item.path) ? 'text-white' : 'text-primary'} />
                  {item.label}
                </button>
              ))}
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-3 mb-4">Force Multipliers</p>
              {featureItems.map((item, i) => (
                <button 
                  key={i} 
                  onClick={() => router.push(item.path)}
                  className={`w-full flex items-center justify-between px-3 py-3 font-bold text-sm transition-all rounded-xl ${isActive(item.path) ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={19} className={isActive(item.path) ? 'text-white' : 'text-indigo-500'} />
                    {item.label}
                  </div>
                  {item.badge && <span className="text-[9px] px-2 py-0.5 bg-indigo-500 text-white rounded-full font-black">{item.badge}</span>}
                </button>
              ))}
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-3 mb-4">Enterprise Control</p>
              {supportItems.map((item, i) => (
                <button 
                  key={i} 
                  onClick={() => router.push(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-3 font-bold text-sm transition-all rounded-xl ${isActive(item.path) ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}
                >
                  <item.icon size={19} className={isActive(item.path) ? 'text-white' : 'text-muted-foreground'} />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-8">
            <div className="bg-secondary/40 p-4 rounded-2xl flex items-center gap-4 border border-border/50">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-sm text-white font-black shadow-lg"
                style={{ background: `hsl(${userEmail.charCodeAt(0) * 8 % 360}, 65%, 55%)` }}
              >
                {userEmail ? userEmail[0].toUpperCase() : '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-foreground truncate uppercase tracking-tight">{userEmail.split('@')[0]}</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <p className="text-[10px] text-muted-foreground font-bold truncate">Enterprise Level</p>
                </div>
              </div>
              <button 
                onClick={handleLogout} 
                className="p-2.5 hover:bg-card rounded-xl text-muted-foreground hover:text-destructive transition-all group"
                title="Secure Sign Out"
              >
                <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar */}
        <nav className="h-20 border-b border-border bg-card/40 backdrop-blur-xl px-10 flex items-center justify-between shrink-0 sticky top-0 z-40">
          <div className="flex items-center gap-6">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-3 hover:bg-secondary rounded-xl text-muted-foreground">
              <LayoutDashboard size={22} />
            </button>
            <div className="hidden sm:flex items-center gap-3 text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] bg-secondary/50 px-4 py-2 rounded-lg border border-border/50">
              <Home size={14} className="text-primary" />
              <span>Platform</span>
              <ChevronRight size={12} className="opacity-30" />
              <span className="text-foreground">{pathname.split('/').pop()}</span>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="hidden md:flex items-center gap-1.5 px-4 py-2 bg-secondary/50 rounded-xl border border-border/30">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Operational</span>
            </div>

            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-3 bg-secondary/50 hover:bg-primary/10 rounded-xl text-muted-foreground transition-all border border-border/30 hover:border-primary/30"
            >
              {mounted && (
                theme === 'dark'
                  ? <Sun size={20} className="text-amber-400" />
                  : <Moon size={20} className="text-indigo-500" />
              )}
            </button>

            <button className="relative p-3 bg-secondary/50 hover:bg-primary/10 rounded-xl text-muted-foreground transition-all border border-border/30">
              <Bell size={20} />
              <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 border-2 border-card rounded-full" />
            </button>
          </div>
        </nav>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}
