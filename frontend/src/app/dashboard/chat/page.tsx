'use client';

import { MessageSquare, Send, Users, Circle, Plus, Smile, Paperclip } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ChatWallPage() {
  const [mounted, setMounted] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const demoMessages = [
    { user: 'Alex Thompson', content: "Just updated the Q2 Roadmap document. Please review the timeline section.", time: '10:24 AM', type: 'text' },
    { user: 'Sarah Chen', content: "Will do. Are we still on track for the automation trigger build?", time: '10:30 AM', type: 'text' },
    { user: 'Elena Rodriguez', content: "Automation logic is 90% complete. Running stress tests now.", time: '10:35 AM', type: 'text' },
    { user: 'System', content: "New document 'Infrastructure Audit v4' added to 'Engineering Hub'", time: '11:02 AM', type: 'event' },
  ];

  return (
    <div className="flex h-full flex-col lg:flex-row animate-fade-in bg-card/20 overflow-hidden">
      
      {/* Sidebar - Channels/Rooms */}
      <div className="w-full lg:w-80 border-r border-border bg-card/50 backdrop-blur-md flex flex-col shrink-0">
        <div className="p-8 border-b border-border">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black tracking-tighter text-foreground">Chat <span className="gradient-text">Wall</span></h2>
            <button className="p-2 bg-primary text-white rounded-lg shadow-lg hover:scale-105 transition-all"><Plus size={18} /></button>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">Active Channels</p>
            {['General Bridge', 'Engineering Audit', 'Marketing Sync', 'Strategic Planning'].map((c, i) => (
              <button key={i} className={`w-full flex items-center justify-between px-4 py-3 text-sm font-bold transition-all rounded-xl ${i === 1 ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}>
                <div className="flex items-center gap-3">
                  <span className="opacity-50 text-xs">#</span> {c}
                </div>
                {i === 1 && <div className="w-2 h-2 rounded-full bg-white animate-pulse" />}
              </button>
            ))}
          </div>
        </div>

        <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-6">Online Peers</p>
          <div className="space-y-4">
            {['Sarah Chen', 'Alex Thompson', 'David Kim', 'Elena Rodriguez'].map((u, i) => (
              <div key={i} className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <div className="w-9 h-9 bg-secondary rounded-lg flex items-center justify-center font-black group-hover:bg-primary transition-all group-hover:text-white">{u[0]}</div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-card rounded-full" />
                </div>
                <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors">{u}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-card/10">
        <div className="p-6 border-b border-border bg-card/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center border border-indigo-500/20">
              <MessageSquare size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-foreground uppercase tracking-tight"># Engineering Audit</h3>
              <p className="text-[10px] font-bold text-muted-foreground flex items-center gap-1.5"><Circle size={8} fill="currentColor" className="text-emerald-500" /> 14 Peers Connected</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-secondary border border-border text-[10px] font-black uppercase tracking-widest text-muted-foreground rounded-lg hover:bg-card transition-all">Export Log</button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {demoMessages.map((m, i) => (
             m.type === 'event' ? (
                <div key={i} className="flex justify-center">
                  <div className="bg-secondary/50 px-6 py-2 border border-border rounded-full text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">{m.content}</div>
                </div>
             ) : (
                <div key={i} className={`flex items-start gap-4 ${m.user === 'Alex Thompson' ? 'ml-0' : 'ml-0'}`}>
                  <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-xs font-black shadow-sm shrink-0">{m.user[0]}</div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-foreground uppercase tracking-tight">{m.user}</span>
                      <span className="text-[9px] text-muted-foreground font-black opacity-30">{m.time}</span>
                    </div>
                    <div className="bg-card p-4 rounded-2xl rounded-tl-none border border-border shadow-sm max-w-lg">
                      <p className="text-sm font-medium text-foreground leading-relaxed">{m.content}</p>
                    </div>
                  </div>
                </div>
             )
          ))}
        </div>

        {/* Message Input */}
        <div className="p-8 bg-card/50 backdrop-blur-md border-t border-border shrink-0">
          <div className="flex gap-4 p-2 bg-secondary/80 border border-border rounded-2xl focus-within:ring-2 ring-primary/20 transition-all">
            <button className="p-3 text-muted-foreground hover:bg-card rounded-xl transition-all"><Paperclip size={20} /></button>
            <input 
              type="text" 
              placeholder="Deploy strategic insights to #Engineering Audit..." 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 bg-transparent px-2 outline-none text-sm font-medium text-foreground placeholder:text-muted-foreground/30"
            />
            <button className="p-3 text-muted-foreground hover:bg-card rounded-xl transition-all"><Smile size={20} /></button>
            <button className="p-3 bg-primary text-white rounded-xl shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all">
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
