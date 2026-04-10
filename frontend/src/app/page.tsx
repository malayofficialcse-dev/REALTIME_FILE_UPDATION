'use client';

import { ArrowRight, Zap, Shield, Globe, Layers, CheckCircle2, Play, Users, BarChart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="min-h-screen mesh-bg text-foreground scroll-smooth overflow-x-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] orb-1 pointer-events-none translate-x-1/3 -translate-y-1/3 z-0" />
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] orb-2 pointer-events-none -translate-x-1/2 -translate-y-1/2 z-0" />

      {/* Navigation */}
      <nav className="glass-header px-6 py-4 lg:px-10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30">
              <Zap size={20} fill="currentColor" />
            </div>
            <span className="text-2xl font-black tracking-tight gradient-text">ProSync</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#solutions" className="hover:text-foreground transition-colors">Solutions</a>
            <a href="#enterprise" className="hover:text-foreground transition-colors">Enterprise</a>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:block text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors">
              Sign In
            </Link>
            <Link href="/login" className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold hover:opacity-90 transition-all rounded shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 flex items-center gap-2">
              Get Started <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="px-6 py-20 lg:py-32 xl:py-40 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10">
        <div className="flex-1 space-y-8 text-center lg:text-left animate-slide-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            ProSync v4.0 Now Live
          </div>
          <h1 className="text-5xl lg:text-7xl xl:text-8xl font-black tracking-tight leading-[1.05]">
            Project <br />
            Management <br />
            <span className="gradient-text italic opacity-90 block mt-2">Redefined.</span>
          </h1>
          <p className="text-lg lg:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
            The only enterprise platform that combines real-time collaboration, 
            version control, and military-grade RBAC security in one seamless experience.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-4">
            <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-foreground text-background font-black text-sm uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 rounded shadow-xl">
              Start Building Free
              <ArrowRight size={18} />
            </Link>
            <button className="w-full sm:w-auto px-8 py-4 premium-card text-foreground font-black text-sm uppercase tracking-widest hover:bg-secondary active:scale-95 transition-all flex items-center justify-center gap-2">
              <Play size={18} fill="currentColor" /> Watch Demo
            </button>
          </div>
        </div>

        <div className="flex-1 relative w-full aspect-square lg:aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-border group animate-fade-scale-in">
          <Image 
            src="/team_collaboration_hero_1775714864156.png" 
            alt="Workspace Collaboration" 
            fill 
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover group-hover:scale-[1.03] transition-transform duration-1000"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
          
          {/* Floating UI Elements */}
          <div className="absolute bottom-6 left-6 right-6 premium-card p-4 flex items-center justify-between shadow-2xl translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-background bg-blue-500" />
                <div className="w-8 h-8 rounded-full border-2 border-background bg-emerald-500" />
                <div className="w-8 h-8 rounded-full border-2 border-background bg-purple-500" />
              </div>
              <span className="text-xs font-bold text-foreground">3 users active now</span>
            </div>
            <div className="badge-operational px-2 py-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider rounded">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Live Sync
            </div>
          </div>
        </div>
      </header>

      {/* Stats/Social Proof Bar */}
      <section className="border-y border-border bg-card/50 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-border">
          <div className="text-center px-4">
            <h4 className="text-3xl font-black text-foreground">99.9%</h4>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">Uptime SLA</p>
          </div>
          <div className="text-center px-4">
            <h4 className="text-3xl font-black text-foreground">10ms</h4>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">Global Latency</p>
          </div>
          <div className="text-center px-4">
            <h4 className="text-3xl font-black text-foreground">SOC2</h4>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">Certified</p>
          </div>
          <div className="text-center px-4">
            <h4 className="text-3xl font-black text-foreground">250k+</h4>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">Teams Active</p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-20 animate-slide-up">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-3">Enterprise Capabilities</h2>
            <h3 className="text-4xl font-black tracking-tight text-foreground">Built for modern, distributed workflows.</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Real-time */}
            <div className="premium-card p-8 group hover:-translate-y-2 transition-all duration-300">
              <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 flex items-center justify-center rounded-lg mb-6 group-hover:scale-110 transition-transform">
                <Globe size={28} />
              </div>
              <h3 className="text-xl font-bold tracking-tight mb-3">Global Real-Time Sync</h3>
              <p className="text-muted-foreground font-medium leading-relaxed">
                Every keystroke is synced globally in milliseconds. See your team work live on documents and spreadsheets with zero collision.
              </p>
            </div>
            {/* Security */}
            <div className="premium-card p-8 group hover:-translate-y-2 transition-all duration-300 delay-100">
              <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 flex items-center justify-center rounded-lg mb-6 group-hover:scale-110 transition-transform">
                <Shield size={28} />
              </div>
              <h3 className="text-xl font-bold tracking-tight mb-3">Military Grade RBAC</h3>
              <p className="text-muted-foreground font-medium leading-relaxed">
                Granular permission levels. Ensure that sensitive documents are only visible and editable by explicitly authorized personnel.
              </p>
            </div>
            {/* Versioning */}
            <div className="premium-card p-8 group hover:-translate-y-2 transition-all duration-300 delay-200">
              <div className="w-14 h-14 bg-purple-50 dark:bg-purple-900/20 text-purple-500 flex items-center justify-center rounded-lg mb-6 group-hover:scale-110 transition-transform">
                <Layers size={28} />
              </div>
              <h3 className="text-xl font-bold tracking-tight mb-3">Time-Travel History</h3>
              <p className="text-muted-foreground font-medium leading-relaxed">
                Mistakes are a thing of the past. Scrub through the history of any document or data grid and restore snapshots instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 px-6 border-t border-border bg-card/30">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-xs font-bold uppercase tracking-[0.4em] text-muted-foreground mb-12">Trusted by Industry Leaders</h2>
          <div className="flex flex-wrap justify-center items-center gap-12 lg:gap-20 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
             <div className="text-3xl font-black">GITHUB</div>
             <div className="text-3xl font-black">STRIPE</div>
             <div className="text-3xl font-black">FIGMA</div>
             <div className="text-3xl font-black">DISCORD</div>
             <div className="text-3xl font-black">NETFLIX</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary opacity-5 dark:opacity-10" />
        <div className="max-w-4xl mx-auto text-center relative z-10 premium-card p-12 lg:p-20">
          <h2 className="text-4xl lg:text-5xl font-black tracking-tight mb-6">Ready to align your team?</h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join thousands of teams already using ProSync to streamline their workflow and deliver projects faster.
          </p>
          <Link href="/login" className="inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black text-sm uppercase tracking-widest hover:scale-105 transition-all rounded shadow-2xl shadow-indigo-300 dark:shadow-indigo-900/50">
            Create Free Account <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-border bg-card relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white rounded">
                <Zap size={16} fill="currentColor" />
              </div>
              <span className="text-xl font-black tracking-tight gradient-text">ProSync</span>
            </div>
            <p className="text-muted-foreground font-medium max-w-sm leading-relaxed">
              The professional choice for distributed teams. Built for security, speed, and absolute reliability.
            </p>
          </div>
          <div className="space-y-5">
            <h4 className="font-bold uppercase text-xs tracking-widest text-foreground">Product</h4>
            <ul className="space-y-3 text-sm text-muted-foreground font-medium">
              <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Security</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
            </ul>
          </div>
          <div className="space-y-5">
            <h4 className="font-bold uppercase text-xs tracking-widest text-foreground">Company</h4>
            <ul className="space-y-3 text-sm text-muted-foreground font-medium">
              <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
            © 2026 ProSync Technologies. All Rights Reserved.
          </div>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 px-3 py-1.5 rounded">
               <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> System Operational
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
