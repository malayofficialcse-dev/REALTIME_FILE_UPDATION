'use client';

import { 
  BarChart2, TrendingUp, Users, Activity, Target, Zap, 
  ArrowUpRight, ArrowDownRight, Clock, Star
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AnalyticsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const stats = [
    { label: 'Platform Velocity', value: '94.2%', trend: '+4.2%', icon: Zap, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { label: 'Active Collaborators', value: '1,284', trend: '+12%', icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Resource Efficiency', value: '88.5%', trend: '-2.1%', icon: Target, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'System Uptime', value: '99.99%', trend: 'Stable', icon: Activity, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  ];

  return (
    <div className="p-10 lg:p-14 animate-fade-in space-y-12">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-foreground">
              Strategic <span className="gradient-text">Intelligence</span>
            </h1>
            <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Real-time Performance Metrics & Predictive Analytics
            </p>
          </div>
          <div className="flex items-center gap-2 p-1 bg-secondary border border-border rounded-xl">
            {['24h', '7d', '30d', '90d'].map((t) => (
              <button key={t} className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-lg ${t === '7d' ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:bg-card'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <div key={i} className="premium-card p-6 flex flex-col gap-4 group hover:scale-[1.02] transition-all cursor-default">
              <div className="flex items-center justify-between">
                <div className={`p-3 ${s.bg} ${s.color} rounded-xl group-hover:rotate-12 transition-transform`}>
                  <s.icon size={22} />
                </div>
                <div className={`flex items-center gap-1 text-[10px] font-black ${s.trend.startsWith('+') ? 'text-emerald-500' : s.trend === 'Stable' ? 'text-blue-500' : 'text-rose-500'}`}>
                  {s.trend.startsWith('+') ? <ArrowUpRight size={12} /> : s.trend.startsWith('-') ? <ArrowDownRight size={12} /> : null}
                  {s.trend}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{s.label}</p>
                <p className="text-3xl font-black text-foreground tracking-tight">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Chart Mockups */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 premium-card p-8 flex flex-col h-[450px]">
            <div className="flex items-center justify-between mb-10">
              <div className="space-y-1">
                <h3 className="text-xl font-black text-foreground">Growth Trajectory</h3>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Team productivity vs capacity</p>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <div className="flex items-center gap-2"><div className="w-2h-2 rounded-full bg-primary" /> Output</div>
                <div className="flex items-center gap-2"><div className="w-2h-2 rounded-full bg-indigo-200" /> Target</div>
              </div>
            </div>
            
            <div className="flex-1 flex items-end justify-between gap-4 px-4 pb-4">
              {[65, 45, 75, 55, 95, 65, 85, 45, 90, 70, 80, 100].map((h, i) => (
                <div key={i} className="group relative w-full">
                  <div 
                    className="w-full bg-gradient-to-t from-primary/80 to-primary rounded-t-lg transition-all duration-1000 group-hover:brightness-125 cursor-help shadow-lg"
                    style={{ height: mounted ? `${h}%` : '0%' }}
                  />
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-card border border-border px-2 py-1 text-[9px] font-black rounded opacity-0 group-hover:opacity-100 transition-all shadow-xl z-10">
                    {h}%
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 px-4 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
              <span>Jan</span><span>Apr</span><span>Jul</span><span>Oct</span><span>Dec</span>
            </div>
          </div>

          <div className="premium-card p-8 flex flex-col">
            <h3 className="text-xl font-black text-foreground mb-8 text-center">Engagement Spread</h3>
            <div className="flex-1 flex items-center justify-center relative">
              <div className="w-48 h-48 rounded-full border-[16px] border-indigo-500/10 flex items-center justify-center">
                <div className="w-36 h-36 rounded-full border-[16px] border-primary flex items-center justify-center shadow-2xl">
                  <div className="text-center">
                    <p className="text-3xl font-black text-foreground">72%</p>
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Peak Rate</p>
                  </div>
                </div>
              </div>
              <div className="absolute top-4 right-4 animate-bounce"><Star size={20} className="text-amber-400 fill-amber-400 shadow-xl" /></div>
            </div>
            <div className="space-y-4 mt-8">
              {[
                { label: 'Deep Focus', value: 45, color: 'bg-primary' },
                { label: 'Collaborative', value: 25, color: 'bg-indigo-400' },
                { label: 'Admin/Review', value: 30, color: 'bg-indigo-100 dark:bg-indigo-900' },
              ].map((item, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="text-foreground">{item.value}%</span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
