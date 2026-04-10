'use client';

import { 
  HelpCircle, Search, Book, MessageCircle, 
  Terminal, Shield, Zap, ArrowRight, ExternalLink
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function HelpCenterPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="p-10 lg:p-14 animate-fade-in space-y-16">
      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* Hero Section */}
        <div className="text-center space-y-8 py-12">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-black uppercase tracking-widest animate-slide-up">
            <Zap size={14} fill="currentColor" /> ProSync Knowledge Core
          </div>
          <h1 className="text-5xl lg:text-7xl font-black tracking-tighter text-foreground max-w-4xl mx-auto leading-[0.9]">
            Strategic <span className="gradient-text">Assistance</span> & Bridge Support
          </h1>
          <div className="max-w-2xl mx-auto relative group">
            <Search size={22} className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search for documentation, bridge specs, or protocol logs..." 
              className="w-full pl-16 pr-8 py-6 bg-card border border-border rounded-[2rem] text-lg font-bold outline-none ring-primary/20 focus:ring-8 transition-all shadow-2xl"
            />
          </div>
        </div>

        {/* Support Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="premium-card p-10 space-y-6 hover:bg-primary/5 transition-all text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center shadow-lg"><Book size={28} /></div>
              <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Bridge Protocols</h3>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed">Examine the foundational documentation for workspace synchronization and automation logic.</p>
              <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary hover:gap-3 transition-all pt-4">Explore Library <ArrowRight size={16} /></button>
           </div>

           <div className="premium-card p-10 space-y-6 hover:bg-emerald-500/5 transition-all text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center shadow-lg"><MessageCircle size={28} /></div>
              <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Direct Support</h3>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed">Initiate a secure channel with the regional orchestration team for immediate bridge assistance.</p>
              <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-500 hover:gap-3 transition-all pt-4">Open Channel <MessageCircle size={16} /></button>
           </div>

           <div className="premium-card p-10 space-y-6 hover:bg-rose-500/5 transition-all text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center shadow-lg"><Terminal size={28} /></div>
              <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Security API</h3>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed">Review the operational security guidelines and API integration parameters for custom bridges.</p>
              <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-rose-500 hover:gap-3 transition-all pt-4">API Documentation <Shield size={16} /></button>
           </div>
        </div>

        {/* Popular Articles */}
        <div className="space-y-8">
           <div className="flex items-center justify-between border-b border-border pb-6">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">High-Traffic Resources</h2>
              <button className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">View Global Stream <ExternalLink size={14} /></button>
           </div>
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[
                'Optimizing Workspace Velocity through Automation Bridges',
                'Advanced Hierarchy Control & Permission Hardening',
                'Real-time Data Persistence across Multi-Hub Nodes',
                'Configuring Webhook Triggers for Strategic Dispatches',
              ].map((t, i) => (
                <div key={i} className="flex items-center justify-between p-6 bg-card border border-border rounded-2xl hover:bg-secondary transition-all cursor-pointer group">
                   <div className="flex items-center gap-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{t}</span>
                   </div>
                   <ArrowRight size={18} className="text-muted-foreground opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
              ))}
           </div>
        </div>

      </div>
    </div>
  );
}
