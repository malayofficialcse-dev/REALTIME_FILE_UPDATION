'use client';

import { 
  Mail, Send, Search, Users, Paperclip, 
  Trash2, Star, Archive, Inbox, Clock, Zap
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function DirectMailPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const mails = [
    { sender: 'System Node alpha', subject: 'Strategic Resource Sync Complete', time: '10:24 AM', status: 'Unread', priority: 'High' },
    { sender: 'Malay Maity', subject: 'ProSync Dashboard v4 Deployment Specs', time: 'Yesterday', status: 'Read', priority: 'Critical' },
    { sender: 'Security Bot', subject: 'Unauthorized Bridge Attempt Blocked', time: '2 days ago', status: 'Archived', priority: 'Medium' },
  ];

  return (
    <div className="flex h-full animate-fade-in bg-card/20 overflow-hidden">
      
      {/* Mail Sidebar */}
      <div className="w-80 border-r border-border bg-card/50 backdrop-blur-md flex flex-col shrink-0">
        <div className="p-8 space-y-8">
           <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black tracking-tighter text-foreground">Direct <span className="gradient-text">Mail</span></h2>
              <button className="p-2.5 bg-primary text-white rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all"><Send size={18} /></button>
           </div>
           <div className="space-y-1">
              {[
                { label: 'Strategic Inbox', icon: Inbox, count: 12, active: true },
                { label: 'Dispatched', icon: Send },
                { label: 'Priority Stream', icon: Star },
                { label: 'Archives', icon: Archive },
              ].map((item, i) => (
                <button key={i} className={`w-full flex items-center justify-between px-4 py-3 text-sm font-bold transition-all rounded-xl ${item.active ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}>
                  <div className="flex items-center gap-3">
                    <item.icon size={18} /> {item.label}
                  </div>
                  {item.count && <span className="text-[10px] font-black">{item.count}</span>}
                </button>
              ))}
           </div>
        </div>

        <div className="p-8 border-t border-border mt-auto">
           <div className="bg-gradient-to-br from-indigo-500/10 to-purple-600/10 p-4 rounded-2xl border border-indigo-500/20 text-center space-y-2">
              <Zap size={20} className="text-indigo-500 mx-auto" />
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Mail AI Bridge</p>
              <p className="text-[9px] text-muted-foreground leading-relaxed">Auto-categorizing strategic communications based on priority mapping.</p>
           </div>
        </div>
      </div>

      {/* Mail List */}
      <div className="flex-1 flex flex-col bg-card/10">
         <div className="p-6 border-b border-border bg-card/30 flex items-center justify-between sticky top-0 z-10">
            <div className="relative w-full max-w-sm">
               <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
               <input type="text" placeholder="Search strategic dispatch..." className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-lg text-xs outline-none focus:ring-1 ring-primary" />
            </div>
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
               <span className="flex items-center gap-1"><Clock size={12} className="text-primary" /> Last Sync: 2m ago</span>
            </div>
         </div>

         <div className="flex-1 overflow-y-auto divide-y divide-border/50 custom-scrollbar">
            {mails.map((m, i) => (
              <div key={i} className="group p-8 flex items-start justify-between hover:bg-primary/5 transition-all cursor-pointer">
                 <div className="flex items-start gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-black shadow-lg ${i === 0 ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground'}`}>
                      {m.sender[0]}
                    </div>
                    <div className="space-y-1.5 flex-1 min-w-0 pr-10">
                       <div className="flex items-center gap-3">
                          <h4 className="text-sm font-black text-foreground uppercase tracking-tight">{m.sender}</h4>
                          <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded ${m.priority === 'Critical' ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20' : 'bg-secondary text-muted-foreground border border-border'}`}>
                             {m.priority}
                          </span>
                       </div>
                       <p className="text-base font-bold text-foreground truncate">{m.subject}</p>
                       <p className="text-xs text-muted-foreground line-clamp-1">Deployment of the latest Strategic Operational Bridge is now complete and awaiting final kernel verification.</p>
                    </div>
                 </div>
                 <div className="flex flex-col items-end gap-4 shrink-0">
                    <span className="text-[10px] font-black text-muted-foreground uppercase opacity-40">{m.time}</span>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button className="p-2 hover:bg-secondary rounded-lg text-muted-foreground"><Star size={16} /></button>
                       <button className="p-2 hover:bg-secondary rounded-lg text-rose-500"><Trash2 size={16} /></button>
                    </div>
                 </div>
              </div>
            ))}
         </div>
      </div>

    </div>
  );
}
