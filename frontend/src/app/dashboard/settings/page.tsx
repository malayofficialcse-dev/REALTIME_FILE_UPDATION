'use client';

import { 
  Settings, User, Bell, Shield, Moon, Sun, 
  Trash2, Save, Globe, Lock, Palette
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '@/components/providers';

export default function GlobalSettingsPage() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const tabs = [
    { id: 'profile', label: 'Identity', icon: User },
    { id: 'appearance', label: 'Aesthetics', icon: Palette },
    { id: 'notifications', label: 'Alerts', icon: Bell },
    { id: 'security', label: 'Firewall', icon: Shield },
  ];

  return (
    <div className="p-10 lg:p-14 animate-fade-in">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-foreground">
            Control <span className="gradient-text">Center</span>
          </h1>
          <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Global Platform Configuration & Personalization
          </p>
        </div>

        {/* Settings Layout */}
        <div className="flex flex-col md:flex-row gap-10">
          {/* Tabs Navigation */}
          <div className="w-full md:w-64 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-5 py-3.5 text-sm font-black uppercase tracking-widest transition-all rounded-xl ${
                  activeTab === tab.id 
                  ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]' 
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground border border-transparent hover:border-border'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 space-y-8">
            {activeTab === 'profile' && (
              <div className="premium-card p-10 space-y-8 animate-fade-scale-in">
                <div className="flex items-center gap-6 pb-6 border-b border-border">
                  <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-4xl text-white font-black shadow-2xl">
                    M
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-foreground">Malay Maity</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-secondary px-3 py-1 border border-border inline-block rounded-full">
                      Full Access Administrator
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Display Name</label>
                    <input type="text" defaultValue="Malay Maity" className="w-full px-5 py-3 bg-secondary/50 border border-border rounded-xl text-sm font-bold focus:ring-2 ring-primary/20 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email Address</label>
                    <input type="email" defaultValue="m1@gmail.com" disabled className="w-full px-5 py-3 bg-secondary/20 border border-border rounded-xl text-sm font-bold text-muted-foreground italic cursor-not-allowed" />
                  </div>
                </div>

                <div className="pt-6 border-t border-border flex justify-end">
                  <button className="flex items-center gap-2 px-8 py-3.5 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-xl hover:scale-105 transition-all">
                    <Save size={16} /> Synchronize Profile
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="premium-card p-10 space-y-8 animate-fade-scale-in">
                 <div className="space-y-6">
                   <h3 className="text-xl font-black text-foreground">Visual Engine</h3>
                   <div className="grid grid-cols-2 gap-4">
                     <button 
                        onClick={() => setTheme('light')}
                        className={`p-6 border-2 transition-all rounded-2xl flex flex-col items-center gap-4 ${theme === 'light' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                     >
                       <Sun size={32} className={theme === 'light' ? 'text-primary' : 'text-muted-foreground'} />
                       <span className="text-xs font-black uppercase tracking-widest">Lumina Light</span>
                     </button>
                     <button 
                        onClick={() => setTheme('dark')}
                        className={`p-6 border-2 transition-all rounded-2xl flex flex-col items-center gap-4 ${theme === 'dark' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                     >
                       <Moon size={32} className={theme === 'dark' ? 'text-primary' : 'text-muted-foreground'} />
                       <span className="text-xs font-black uppercase tracking-widest">Obsidian Dark</span>
                     </button>
                   </div>
                 </div>

                 <div className="space-y-4 pt-8 border-t border-border">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-black text-foreground uppercase tracking-tight text-primary">High Contrast Surfaces</p>
                        <p className="text-xs text-muted-foreground">Enhance element isolation for complex workspaces</p>
                      </div>
                      <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                      </div>
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="premium-card p-10 space-y-8 animate-fade-scale-in">
                <div className="p-6 bg-rose-500/5 border border-rose-500/20 rounded-2xl flex items-center gap-6">
                  <div className="w-12 h-12 bg-rose-500/20 text-rose-500 rounded-xl flex items-center justify-center">
                    <Lock size={24} />
                  </div>
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-black text-rose-600 dark:text-rose-400 uppercase tracking-tight">Security Hardening Required</p>
                    <p className="text-xs text-muted-foreground font-medium">Your current session bridge is stable but lacks 2FA authentication.</p>
                  </div>
                  <button className="px-5 py-2.5 bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg">
                    Enable Factor 2
                  </button>
                </div>

                <div className="space-y-4 pt-6">
                  <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Session Audit</h3>
                  <div className="space-y-2">
                    {[
                      { city: 'Kolkata, IN', ip: '192.168.1.1', device: 'Windows PC (Chrome)' },
                      { city: 'Mumbai, IN', ip: '103.24.51.22', device: 'MacOS (Safari)' },
                    ].map((s, i) => (
                      <div key={i} className="p-4 bg-secondary border border-border rounded-xl flex justify-between items-center">
                        <div className="flex items-center gap-4">
                           <Globe size={18} className="text-primary" />
                           <div className="space-y-1">
                             <p className="text-xs font-black text-foreground uppercase tracking-tight">{s.city}</p>
                             <p className="text-[10px] text-muted-foreground">{s.device} • IP: {s.ip}</p>
                           </div>
                        </div>
                        <button className="text-rose-500 hover:text-rose-600 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
