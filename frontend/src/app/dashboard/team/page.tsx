'use client';

import { Users, Mail, Shield, Circle, ExternalLink, Search, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function TeamStreamPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const members = [
    { name: 'Alex Thompson', email: 'alex@prosync.com', role: 'System Admin', status: 'online', initials: 'AT', color: 'indigo' },
    { name: 'Sarah Chen', email: 'sarah.c@prosync.com', role: 'Product Lead', status: 'online', initials: 'SC', color: 'emerald' },
    { name: 'Marcus Miller', email: 'marcus@prosync.com', role: 'Architect', status: 'away', initials: 'MM', color: 'amber' },
    { name: 'Elena Rodriguez', email: 'elena@prosync.com', role: 'Contributor', status: 'busy', initials: 'ER', color: 'rose' },
    { name: 'Jordan Blake', email: 'jordan@prosync.com', role: 'Stakeholder', status: 'offline', initials: 'JB', color: 'slate' },
    { name: 'David Kim', email: 'david.k@prosync.com', role: 'Developer', status: 'online', initials: 'DK', color: 'blue' },
  ];

  return (
    <div className="p-10 lg:p-14 animate-fade-in space-y-12">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-foreground">
              Team <span className="gradient-text">Stream</span>
            </h1>
            <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Global Collaboration Presence & Hierarchy
            </p>
          </div>
          <button className="px-6 py-3 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all">
            Secure Invite
          </button>
        </div>

        {/* Global Directory */}
        <div className="premium-card overflow-hidden">
          <div className="p-6 border-b border-border bg-secondary/30 flex items-center justify-between">
            <div className="relative w-full max-w-md">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search global directory..." 
                className="w-full pl-11 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm outline-none focus:ring-2 ring-primary/10"
              />
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-muted-foreground hover:bg-secondary rounded-lg transition-all border border-transparent hover:border-border">
                <Filter size={14} /> Filters
              </button>
            </div>
          </div>

          <div className="divide-y divide-border/50">
            {members.map((m, i) => (
              <div key={i} className="flex items-center justify-between p-6 hover:bg-primary/5 transition-all group">
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <div 
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg text-white font-black shadow-lg shadow-black/5"
                      style={{ background: `hsl(${i * 60 + 200}, 65%, 55%)` }}
                    >
                      {m.initials}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 border-card ${
                      m.status === 'online' ? 'bg-emerald-500' : 
                      m.status === 'away' ? 'bg-amber-500' : 
                      m.status === 'busy' ? 'bg-rose-500' : 'bg-slate-400'
                    }`} />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-base font-black text-foreground group-hover:text-primary transition-colors">{m.name}</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Mail size={12} className="text-primary/60" /> {m.email}
                    </p>
                  </div>
                </div>

                <div className="hidden lg:flex flex-col items-center px-10 border-x border-border/50">
                   <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-full border border-border">
                      <Shield size={12} className="text-primary" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-foreground">{m.role}</span>
                   </div>
                </div>

                <div className="flex items-center gap-3">
                  <button className="p-2.5 text-muted-foreground hover:bg-secondary rounded-lg transition-all">
                    <Mail size={18} />
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-primary hover:text-white hover:border-primary transition-all rounded-lg">
                    Log View <ExternalLink size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Presence Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="premium-card p-8 flex flex-col items-center text-center space-y-4 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/10">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Circle size={24} fill="currentColor" />
            </div>
            <div>
              <p className="text-3xl font-black text-foreground">84</p>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">Available Now</p>
            </div>
          </div>
          <div className="premium-card p-8 flex flex-col items-center text-center space-y-4 bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/10">
            <div className="w-16 h-16 bg-amber-500/20 text-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Circle size={24} fill="currentColor" />
            </div>
            <div>
              <p className="text-3xl font-black text-foreground">12</p>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400">At Capacity</p>
            </div>
          </div>
          <div className="premium-card p-8 flex flex-col items-center text-center space-y-4 bg-gradient-to-br from-rose-500/10 to-rose-600/5 border-rose-500/10">
            <div className="w-16 h-16 bg-rose-500/20 text-rose-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Circle size={24} fill="currentColor" />
            </div>
            <div>
              <p className="text-3xl font-black text-foreground">204</p>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-600 dark:text-rose-400">Off-Bridge</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
