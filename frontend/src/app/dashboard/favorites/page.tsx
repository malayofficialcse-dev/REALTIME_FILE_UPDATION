'use client';

import { Star, LayoutGrid, Search, Filter, Shield, Clock, Users } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function FavoritesPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const favWorkspaces = [
    { name: 'Aurora ERP', category: 'Strategic', lastActive: '2m ago', peers: 12, health: 'Optimized' },
    { name: 'Marketing v4', category: 'Creative', lastActive: '1h ago', peers: 8, health: 'Healthy' },
    { name: 'Financial Hub', category: 'Security', lastActive: '4h ago', peers: 5, health: 'Strict' },
  ];

  return (
    <div className="p-10 lg:p-14 animate-fade-in space-y-12">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-foreground">
              Strategic <span className="gradient-text">Favorites</span>
            </h1>
            <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Curated High-Value Operation Hubs
            </p>
          </div>
          <div className="flex items-center gap-4">
             <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input type="text" placeholder="Search curated hubs..." className="pl-11 pr-4 py-3 bg-secondary border border-border rounded-xl text-xs outline-none focus:ring-1 ring-primary w-64" />
             </div>
             <button className="p-3 bg-secondary border border-border rounded-xl text-muted-foreground"><Filter size={20} /></button>
          </div>
        </div>

        {/* Favorites Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {favWorkspaces.map((w, i) => (
              <div key={i} className="premium-card p-10 flex flex-col justify-between h-[380px] group overflow-hidden relative">
                 <div className="absolute top-0 right-0 p-8">
                    <Star size={32} className="text-amber-400 fill-amber-400 shadow-xl shadow-amber-500/20" />
                 </div>

                 <div className="space-y-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-2xl group-hover:rotate-12 transition-transform">
                       <LayoutGrid size={28} />
                    </div>
                    <div className="space-y-1">
                       <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">{w.category} Bridge</p>
                       <h3 className="text-3xl font-black text-foreground tracking-tight">{w.name}</h3>
                    </div>
                 </div>

                 <div className="pt-8 border-t border-border flex flex-col gap-4">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                       <span className="text-muted-foreground flex items-center gap-2"><Clock size={12} className="text-indigo-500" /> Active {w.lastActive}</span>
                       <span className="text-emerald-500 flex items-center gap-2"><Shield size={12} /> {w.health}</span>
                    </div>
                    <div className="flex items-center justify-between">
                       <div className="flex -space-x-2">
                          {[1, 2, 3].map(j => (
                            <div key={j} className="w-8 h-8 rounded-lg border-2 border-card bg-secondary flex items-center justify-center text-[10px] font-black text-muted-foreground">
                              {String.fromCharCode(64 + j + i)}
                            </div>
                          ))}
                          <div className="w-8 h-8 rounded-lg border-2 border-card bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">+{w.peers - 3}</div>
                       </div>
                       <button className="text-xs font-black uppercase tracking-widest text-foreground hover:text-primary transition-all">Launch Bridge</button>
                    </div>
                 </div>
              </div>
           ))}

           {/* Add New Favorite Placeholder */}
           <div className="border-2 border-dashed border-border rounded-[2rem] p-10 flex flex-col items-center justify-center gap-6 group hover:border-primary/50 hover:bg-primary/5 transition-all text-center">
              <div className="w-16 h-16 bg-secondary text-muted-foreground rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-lg">
                 <Star size={28} />
              </div>
              <div>
                <p className="font-black text-foreground uppercase tracking-tight">Curate New Node</p>
                <p className="text-xs text-muted-foreground mt-1">Pin your high-velocity workspaces for instant bridge access.</p>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
