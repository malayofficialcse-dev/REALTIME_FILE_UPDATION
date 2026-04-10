'use client';

import { 
  Zap, Play, Plus, Trash2, Cpu, 
  Settings, RefreshCcw, Layers, ArrowRight, Save
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AutomationBridgePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const workflows = [
    { name: 'Resource Allocation Sync', trigger: 'New Asset Create', active: true, color: 'indigo' },
    { name: 'Security Alert Dispatch', trigger: 'Access Level Change', active: true, color: 'rose' },
    { name: 'Daily Pulse Report', trigger: 'Scheduled (08:00)', active: false, color: 'amber' },
  ];

  return (
    <div className="p-10 lg:p-14 animate-fade-in space-y-12 h-full flex flex-col">
      <div className="max-w-7xl mx-auto w-full space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-foreground">
              Workflow <span className="gradient-text">Engine</span>
            </h1>
            <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              Autonomous Strategic Operation & Trigger Logic
            </p>
          </div>
          <button className="flex items-center gap-3 px-8 py-3.5 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-xl shadow-primary/20 hover:scale-105 transition-all">
            <Plus size={18} className="stroke-[3]" /> Construct Bridge
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 flex-1">
          {/* Active Workflows Panel */}
          <div className="lg:col-span-1 space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-2">Operational Bridges</h3>
            <div className="space-y-4">
              {workflows.map((w, i) => (
                <div key={i} className={`premium-card p-6 border-l-4 ${w.active ? 'border-primary' : 'border-muted opacity-60'} hover:bg-secondary transition-all cursor-pointer group`}>
                   <div className="flex items-center justify-between mb-4">
                     <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg group-hover:bg-indigo-500 group-hover:text-white transition-all">
                       <Zap size={18} />
                     </div>
                     <div className={`w-3 h-3 rounded-full ${w.active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
                   </div>
                   <h4 className="font-black text-foreground uppercase tracking-tight mb-1">{w.name}</h4>
                   <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Trigger: {w.trigger}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Builder Canvas Mockup */}
          <div className="lg:col-span-2 premium-card p-10 bg-secondary/20 flex flex-col relative overflow-hidden min-h-[600px]">
            <div className="absolute top-0 right-0 p-8 space-y-4">
               <button className="p-3 bg-card border border-border rounded-xl text-muted-foreground hover:text-primary transition-all"><Settings size={20} /></button>
               <br />
               <button className="p-3 bg-card border border-border rounded-xl text-muted-foreground hover:text-rose-500 transition-all"><Trash2 size={20} /></button>
            </div>

            <h3 className="text-2xl font-black text-foreground mb-12">Bridge Constructor <span className="text-xs font-black uppercase tracking-widest text-primary ml-4">v2.4 Editor</span></h3>
            
            <div className="flex-1 flex flex-col items-center justify-center space-y-12 pb-20">
              {/* Node: Trigger */}
              <div className="w-72 p-6 bg-card border-2 border-primary shadow-2xl rounded-2xl relative">
                <div className="absolute -top-3 left-6 px-3 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full">Source Trigger</div>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 text-primary rounded-xl"><Layers size={20} /></div>
                  <div>
                    <p className="text-xs font-black text-foreground uppercase tracking-tight">On Asset Create</p>
                    <p className="text-[9px] text-muted-foreground">Monitoring all hubs</p>
                  </div>
                </div>
              </div>

              <div className="w-0.5 h-12 bg-primary/30 relative">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-primary/30"><ArrowRight size={16} className="rotate-90" /></div>
              </div>

              {/* Node: Condition */}
              <div className="w-72 p-6 bg-card border-2 border-indigo-400/30 shadow-2xl rounded-2xl relative">
                <div className="absolute -top-3 left-6 px-3 py-1 bg-secondary border border-border text-muted-foreground text-[10px] font-black uppercase tracking-widest rounded-full">Logic Gate</div>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl"><Cpu size={20} /></div>
                  <div>
                    <p className="text-xs font-black text-foreground uppercase tracking-tight">Type IS "Sheet"</p>
                    <p className="text-[9px] text-muted-foreground">Conditional filtering</p>
                  </div>
                </div>
              </div>

              <div className="w-0.5 h-12 bg-primary/30 relative">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-primary/30"><ArrowRight size={16} className="rotate-90" /></div>
              </div>

              {/* Node: Action */}
              <div className="w-72 p-6 bg-gradient-to-br from-indigo-500 to-purple-600 shadow-2xl rounded-2xl relative text-white">
                <div className="absolute -top-3 left-6 px-3 py-1 bg-white text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">Final Execution</div>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-xl"><RefreshCcw size={20} /></div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-tight">Sync to Analytics</p>
                    <p className="text-[9px] opacity-70">Bridge persistent data</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-border flex justify-between items-center">
              <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                <span className="flex items-center gap-2"><Play size={14} className="text-emerald-500" /> Auto-Deploy On</span>
              </div>
              <button className="flex items-center gap-2 px-8 py-3.5 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-xl hover:scale-105 transition-all">
                 <Save size={16} /> Deploy Strategy
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
