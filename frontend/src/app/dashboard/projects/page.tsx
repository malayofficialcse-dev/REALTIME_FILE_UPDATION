'use client';

import { 
  Briefcase, Plus, Play, MoreVertical, 
  Calendar, CheckCircle, Clock, Zap
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ProjectsPulsePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const projects = [
    { name: 'Aurora ERP Migration', status: 'In Flight', progress: 65, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { name: 'Global Asset Audit v4', status: 'Final Review', progress: 92, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { name: 'Strategic Ops Realignment', status: 'Planning', progress: 15, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { name: 'Quantum Bridge Build', status: 'Testing', progress: 45, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  ];

  return (
    <div className="p-10 lg:p-14 animate-fade-in space-y-12">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-foreground">
              Project <span className="gradient-text">Pulse</span>
            </h1>
            <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              High-Level Lifecycle Tracking & Resource Allocation
            </p>
          </div>
          <button className="flex items-center gap-3 px-8 py-3.5 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-xl shadow-primary/20 hover:scale-105 transition-all">
            <Plus size={18} className="stroke-[3]" /> Launch Project
          </button>
        </div>

        {/* Pulse Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {projects.map((p, i) => (
             <div key={i} className="premium-card p-6 flex flex-col justify-between h-[280px] group hover:bg-primary/5 transition-all">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`px-3 py-1 bg-secondary border border-border rounded-full text-[9px] font-black uppercase tracking-[0.2em] ${p.color}`}>
                      {p.status}
                    </div>
                    <button className="text-muted-foreground hover:text-foreground transition-colors"><MoreVertical size={16} /></button>
                  </div>
                  <h3 className="text-xl font-black text-foreground group-hover:text-primary transition-colors leading-tight">{p.name}</h3>
                </div>

                <div className="space-y-4 pt-6 border-t border-border/50">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    <span>Momentum</span>
                    <span className="text-foreground">{p.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r from-primary to-indigo-400 transition-all duration-1000`} 
                      style={{ width: `${p.progress}%` }} 
                    />
                  </div>
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(j => (
                      <div key={j} className="w-8 h-8 rounded-lg border-2 border-card bg-secondary flex items-center justify-center text-[10px] font-black text-muted-foreground shadow-sm">
                        {String.fromCharCode(64 + j + i)}
                      </div>
                    ))}
                  </div>
                </div>
             </div>
           ))}
        </div>

        {/* Timeline Summary Table */}
        <div className="premium-card overflow-hidden">
          <div className="p-8 border-b border-border bg-secondary/20 flex items-center justify-between">
            <h3 className="text-lg font-black text-foreground uppercase tracking-tight">Timeline Bridge</h3>
            <div className="flex items-center gap-4 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
              <span className="flex items-center gap-1"><Clock size={12} className="text-indigo-500" /> View Schedule</span>
              <span className="flex items-center gap-1"><Play size={12} className="text-primary" /> Active Sprint</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-secondary/30 border-b border-border">
                <tr className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  <th className="px-8 py-4">Strategic Initiative</th>
                  <th className="px-8 py-4">Primary Goal</th>
                  <th className="px-8 py-4">Deadline</th>
                  <th className="px-8 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  { name: 'ERP Bridge Integration', goal: 'Data Parity', date: 'Apr 24, 2026', status: 'On Track' },
                  { name: 'Security Audit v9', goal: 'Zero-Leak Cert', date: 'May 12, 2026', status: 'Executing' },
                  { name: 'Market Expansion', goal: '12% Market Share', date: 'Jun 01, 2026', status: 'Planning' },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-primary/5 transition-all text-sm font-bold border-l-4 border-transparent hover:border-primary">
                    <td className="px-8 py-4 text-foreground">{row.name}</td>
                    <td className="px-8 py-4 text-muted-foreground">{row.goal}</td>
                    <td className="px-8 py-4 flex items-center gap-2"><Calendar size={14} className="text-primary" /> {row.date}</td>
                    <td className="px-8 py-4 text-right">
                       <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 rounded-full">
                         {row.status}
                       </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
