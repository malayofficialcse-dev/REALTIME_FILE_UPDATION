'use client';

import { Shield, Search, Filter, Terminal, Clock, Download, ExternalLink, Activity } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function OperationalAuditPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const logs = [
    { event: 'Key Rotation', entity: 'System Kernel', actor: 'Automated Bot', status: 'Secure', time: 'Just Now', color: 'text-indigo-500' },
    { event: 'Hierarchy Change', entity: 'Marketing Hub', actor: 'Alex Thompson', status: 'Verified', time: '12m ago', color: 'text-emerald-500' },
    { event: 'Bulk Export', entity: 'Financial Data', actor: 'Sarah Chen', status: 'Authorized', time: '1h ago', color: 'text-amber-500' },
    { event: 'Access Revoked', entity: 'External Node', actor: 'Security Bot', status: 'Blocked', time: '4h ago', color: 'text-rose-500' },
    { event: 'Bridge Build', entity: 'Workflow Engine', actor: 'Elena Rodriguez', status: 'Operational', time: '6h ago', color: 'text-blue-500' },
  ];

  return (
    <div className="p-10 lg:p-14 animate-fade-in space-y-12">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-foreground">
              Operational <span className="gradient-text">Audit</span>
            </h1>
            <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              Immutable Transaction Ledger & Global Event Stream
            </p>
          </div>
          <button className="flex items-center gap-3 px-8 py-3.5 bg-card border border-border text-xs font-black uppercase tracking-widest rounded-xl hover:bg-secondary transition-all">
            <Download size={18} /> Export Immutable Log
          </button>
        </div>

        {/* Security Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="premium-card p-8 bg-indigo-500/5 flex items-center gap-6">
              <div className="w-14 h-14 bg-indigo-500 text-white rounded-2xl flex items-center justify-center shadow-xl"><Shield size={24} /></div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Encryption Level</p>
                <p className="text-2xl font-black text-foreground uppercase tracking-tight">AES-4096-X</p>
              </div>
           </div>
           <div className="premium-card p-8 bg-emerald-500/5 flex items-center gap-6">
              <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-xl"><Activity size={24} /></div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">integrity Score</p>
                <p className="text-2xl font-black text-foreground uppercase tracking-tight">100 / 100</p>
              </div>
           </div>
           <div className="premium-card p-8 bg-rose-500/5 flex items-center gap-6">
              <div className="w-14 h-14 bg-rose-500 text-white rounded-2xl flex items-center justify-center shadow-xl"><Terminal size={24} /></div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Threats Neutralized</p>
                <p className="text-2xl font-black text-foreground uppercase tracking-tight">1,248 Today</p>
              </div>
           </div>
        </div>

        {/* Ledger Table */}
        <div className="premium-card overflow-hidden">
           <div className="p-6 border-b border-border bg-secondary/30 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                 <h3 className="text-sm font-black text-foreground uppercase tracking-tight">Real-time Persistence Ledger</h3>
              </div>
              <div className="flex items-center gap-4">
                 <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input type="text" placeholder="Search ledger..." className="pl-9 pr-4 py-2 bg-card border border-border rounded-lg text-xs outline-none focus:ring-1 ring-primary" />
                 </div>
                 <button className="p-2.5 bg-secondary border border-border rounded-lg text-muted-foreground"><Filter size={16} /></button>
              </div>
           </div>
           <table className="w-full text-left">
              <thead className="bg-secondary/20 text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-8 py-4">Timestamp</th>
                  <th className="px-8 py-4">Event Bridge</th>
                  <th className="px-8 py-4">Strategic Entity</th>
                  <th className="px-8 py-4">Authorized Actor</th>
                  <th className="px-8 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map((l, i) => (
                  <tr key={i} className="group hover:bg-primary/5 transition-all text-xs font-bold font-mono">
                    <td className="px-8 py-5 text-muted-foreground/60 flex items-center gap-2 italic">
                       <Clock size={12} className="text-primary/40" /> {l.time}
                    </td>
                    <td className="px-8 py-5 text-foreground uppercase tracking-tight">{l.event}</td>
                    <td className="px-8 py-5 text-muted-foreground uppercase">{l.entity}</td>
                    <td className="px-8 py-5">
                       <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-secondary rounded flex items-center justify-center text-[8px] font-black shadow-inner">{l.actor[0]}</div>
                          <span className="text-primary">{l.actor}</span>
                       </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                       <span className={`px-2 py-0.5 border ${l.color.replace('text-', 'bg-').replace('-500', '-500/10')} ${l.color} border-${l.color.split('-')[1]}-500/20 rounded text-[9px] uppercase tracking-widest`}>
                         {l.status}
                       </span>
                       <button className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary"><ExternalLink size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
           </table>
        </div>

      </div>
    </div>
  );
}
