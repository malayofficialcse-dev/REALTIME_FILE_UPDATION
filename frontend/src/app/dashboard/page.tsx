'use client';

import { useQuery, useMutation, gql } from '@apollo/client';
import { 
  Plus, Folder, Users, ChevronRight, Moon, Sun, LogOut, RefreshCcw, Activity, 
  LayoutDashboard, Search, FileText, Table, Zap, LayoutGrid, List,
  Sparkles, Bell, Settings, Star, Clock, BarChart2, Layers,
  Filter, Calendar, ChevronDown, ChevronUp, Home, HelpCircle, Mail, MessageSquare, 
  PieChart, Briefcase, PlusCircle, Bookmark, Shield, X, ArrowRight, TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from '@/components/providers';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

const GET_WORKSPACES = gql`
  query GetWorkspaces {
    workspaces {
      id
      name
      createdAt
      members {
        user {
          id
          email
        }
        role
      }
      documents {
        id
        type
      }
    }
    me {
      id
      email
    }
  }
`;

const CREATE_WORKSPACE = gql`
  mutation CreateWorkspace($name: String!) {
    createWorkspace(name: $name) {
      id
      name
    }
  }
`;

function WorkspaceCardSkeleton() {
  return (
    <div className="premium-card p-7 min-h-[280px] flex flex-col justify-between animate-pulse">
      <div>
        <div className="flex items-start justify-between mb-6">
          <div className="skeleton w-14 h-14 rounded-xl" />
          <div className="skeleton w-24 h-6 rounded-full" />
        </div>
        <div className="skeleton w-3/4 h-8 rounded-lg mb-3" />
        <div className="skeleton w-1/2 h-4 rounded-lg" />
      </div>
      <div>
        <div className="flex gap-3 pt-5 border-t border-border mt-5">
          <div className="skeleton w-8 h-8 rounded-full" />
          <div className="skeleton w-8 h-8 rounded-full" />
          <div className="skeleton w-8 h-8 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const { data, loading, error, refetch } = useQuery(GET_WORKSPACES);
  const [mounted, setMounted] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [creating, setCreating] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [dateFilter, setDateFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const [createWorkspace] = useMutation(CREATE_WORKSPACE);

  useEffect(() => {
    setMounted(true);
    if (!localStorage.getItem('token')) {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    if (showCreateModal) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [showCreateModal]);

  const handleCreateWorkspace = useCallback(async () => {
    if (!newWorkspaceName.trim()) return;
    setCreating(true);
    try {
      await createWorkspace({ variables: { name: newWorkspaceName.trim() } });
      refetch();
      setShowCreateModal(false);
      setNewWorkspaceName('');
    } catch (err) {
      console.error('Create error:', err);
    } finally {
      setCreating(false);
    }
  }, [createWorkspace, refetch, newWorkspaceName]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const workspaces = data?.workspaces || [];
  
  // Apply filters and sorting
  const filteredWorkspaces = workspaces
    .filter((w: any) => {
      const nameMatch = w.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (!nameMatch) return false;
      
      if (dateFilter === 'all') return true;
      const createdAt = new Date(parseInt(w.createdAt || '0'));
      const now = new Date();
      if (dateFilter === 'today') return createdAt.toDateString() === now.toDateString();
      if (dateFilter === 'week') return (now.getTime() - createdAt.getTime()) < 7 * 24 * 60 * 60 * 1000;
      if (dateFilter === 'month') return (now.getTime() - createdAt.getTime()) < 30 * 24 * 60 * 60 * 1000;
      return true;
    })
    .sort((a: any, b: any) => {
      let valA, valB;
      if (sortBy === 'name') { valA = a.name; valB = b.name; }
      else if (sortBy === 'date') { valA = parseInt(a.createdAt || '0'); valB = parseInt(b.createdAt || '0'); }
      else if (sortBy === 'members') { valA = a.members.length; valB = b.members.length; }
      else if (sortBy === 'assets') { 
        valA = a.documents?.length || 0; 
        valB = b.documents?.length || 0; 
      }
      else { valA = a.name; valB = b.name; }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  // Calculate stats
  const totalMembers = workspaces.reduce((acc: number, w: any) => acc + w.members.length, 0);
  const totalDocs = workspaces.reduce((acc: number, w: any) => acc + (w.documents?.filter((d: any) => d.type === 'text').length || 0), 0);
  const totalSheets = workspaces.reduce((acc: number, w: any) => acc + (w.documents?.filter((d: any) => d.type === 'sheet').length || 0), 0);
  const userEmail = data?.me?.email || '';

  const statCards = [
    {
      label: 'Active Workspaces',
      value: workspaces.length,
      icon: Layers,
      color: 'from-indigo-600 to-purple-600',
      bg: 'bg-indigo-500/15 dark:bg-indigo-500/20',
      text: 'text-indigo-600 dark:text-indigo-400',
    },
    {
      label: 'Team Members',
      value: totalMembers,
      icon: Users,
      color: 'from-violet-600 to-pink-600',
      bg: 'bg-violet-500/15 dark:bg-violet-500/20',
      text: 'text-violet-600 dark:text-violet-400',
    },
    {
      label: 'Text Documents',
      value: totalDocs,
      icon: FileText,
      color: 'from-blue-600 to-cyan-600',
      bg: 'bg-blue-500/15 dark:bg-blue-500/20',
      text: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Spreadsheets',
      value: totalSheets,
      icon: Table,
      color: 'from-emerald-600 to-teal-600',
      bg: 'bg-emerald-500/15 dark:bg-emerald-500/20',
      text: 'text-emerald-600 dark:text-emerald-400',
    },
  ];

  return (
    <div className="p-10 lg:p-14 animate-fade-in">
      <div className="max-w-7xl mx-auto">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6 animate-slide-up">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-foreground">
                Workspace <span className="gradient-text">Stream</span>
              </h1>
            </div>
            <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Collaborative Enterprise Dashboard — {mounted ? new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Loading...'}
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="group flex items-center gap-3 px-7 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold hover:opacity-90 active:scale-95 transition-all shadow-xl shadow-indigo-200 dark:shadow-indigo-900/40 shrink-0"
          >
            <Plus size={20} className="stroke-[3] group-hover:rotate-90 transition-transform duration-300" />
            New Workspace
          </button>
        </div>

        {/* Stats Row */}
        {!loading && !error && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10 stagger-children">
            {statCards.map((stat, i) => (
              <div
                key={i}
                className="stat-card p-5 animate-slide-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 ${stat.bg}`}>
                    <stat.icon size={20} className={stat.text} />
                  </div>
                  <TrendingUp size={14} className="text-muted-foreground opacity-50" />
                </div>
                <div className="animate-count-up" style={{ animationDelay: `${200 + i * 80}ms` }}>
                  <p className={`text-3xl font-black ${stat.text}`}>{stat.value}</p>
                  <p className="text-xs font-semibold text-muted-foreground mt-1 uppercase tracking-widest">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="premium-card p-12 flex flex-col items-center gap-8 text-center max-w-xl mx-auto my-20 animate-fade-scale-in">
            <div className="w-20 h-20 bg-amber-50 dark:bg-amber-900/20 text-amber-500 flex items-center justify-center">
              <RefreshCcw size={40} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-tight text-foreground">Sync Interrupted</h2>
              <p className="text-sm font-medium text-muted-foreground max-w-sm">Security credentials expired. Please re-authenticate to restore your workspace bridge.</p>
            </div>
            <div className="flex gap-4">
              <button onClick={handleLogout} className="px-8 py-3.5 bg-primary text-white font-bold shadow-lg hover:opacity-90 transition-all flex items-center gap-2">
                <ArrowRight size={16} /> Sign In
              </button>
              <button
                onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
                className="px-6 py-3.5 border border-border text-muted-foreground font-bold hover:bg-secondary transition-all"
              >
                Reset Cache
              </button>
            </div>
          </div>
        )}
        {/* Search & Filter Row */}
        {!error && (
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search workspaces..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-card border border-border outline-none text-sm"
              />
            </div>
            <div className="flex items-center gap-2 bg-card border border-border p-1">
              {['all', 'today', 'week', 'month'].map((f) => (
                <button
                  key={f}
                  onClick={() => setDateFilter(f)}
                  className={`px-3 py-1 select-none text-[10px] font-bold uppercase transition-all ${dateFilter === f ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-secondary'}`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 bg-card border border-border p-1">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-all ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-muted-foreground'}`}
              >
                <LayoutGrid size={16} />
              </button>
              <button 
                onClick={() => setViewMode('table')}
                className={`p-2 transition-all ${viewMode === 'table' ? 'bg-primary text-white' : 'text-muted-foreground'}`}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Workspace Display */}
        {!error && (
          <div>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => <WorkspaceCardSkeleton key={i} />)}
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredWorkspaces.map((workspace: any, idx: number) => {
                  const docCount = workspace.documents?.filter((d: any) => d.type === 'text').length || 0;
                  const sheetCount = workspace.documents?.filter((d: any) => d.type === 'sheet').length || 0;
                  const totalAssets = docCount + sheetCount;
                  const gradients = [
                    { from: '#4F46E5', to: '#7C3AED' },
                    { from: '#0891B2', to: '#2563EB' },
                    { from: '#059669', to: '#0891B2' },
                    { from: '#7C3AED', to: '#DB2777' },
                    { from: '#D97706', to: '#DC2626' },
                    { from: '#2563EB', to: '#7C3AED' },
                  ];
                  const grad = gradients[idx % gradients.length];

                  return (
                    <Link
                      key={workspace.id}
                      href={`/workspace/${workspace.id}`}
                      className="premium-card group p-7 flex flex-col justify-between min-h-[280px] relative overflow-hidden animate-slide-up"
                      style={{ animationDelay: `${idx * 80}ms` }}
                    >
                      {/* Gradient top accent */}
                      <div
                        className="absolute top-0 left-0 right-0 h-1 transition-all duration-500 group-hover:h-1.5"
                        style={{ background: `linear-gradient(90deg, ${grad.from}, ${grad.to})` }}
                      />

                      {/* Background decorative blob */}
                      <div
                        className="absolute -right-10 -top-10 w-44 h-44 rounded-full opacity-10 blur-2xl group-hover:opacity-20 transition-all duration-700 group-hover:scale-125"
                        style={{ background: `radial-gradient(circle, ${grad.from}, transparent)` }}
                      />

                      <div>
                        <div className="flex items-start justify-between mb-5">
                          <div
                            className="p-3.5 shadow-lg"
                            style={{ background: `linear-gradient(135deg, ${grad.from}20, ${grad.to}15)`, border: `1px solid ${grad.from}25` }}
                          >
                            <Folder size={26} style={{ color: grad.from }} />
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <div className="badge-operational flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Operational
                            </div>
                          </div>
                        </div>

                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1 leading-none">
                          {workspace.name.length % 2 === 0 ? 'Enterprise' : 'Collaborative'} Hub
                        </p>
                        <h3 className="text-2xl font-black text-foreground tracking-tight group-hover:translate-x-1 transition-transform duration-300 mb-1 leading-tight">
                          {workspace.name}
                        </h3>

                        <div className="flex items-center gap-4 mt-2.5">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                            <Users size={13} style={{ color: grad.from }} />
                            {workspace.members.length} member{workspace.members.length !== 1 ? 's' : ''}
                          </div>
                          {docCount > 0 && (
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                              <FileText size={13} className="text-blue-500" />
                              {docCount} doc{docCount !== 1 ? 's' : ''}
                            </div>
                          )}
                          {sheetCount > 0 && (
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                              <Table size={13} className="text-emerald-500" />
                              {sheetCount} sheet{sheetCount !== 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="relative z-10">
                        <div className="flex items-center justify-between border-t border-border pt-5 mt-5">
                          {/* Member avatar stack */}
                          <div className="flex -space-x-2.5">
                            {workspace.members.slice(0, 4).map((m: any, mIdx: number) => (
                              <div
                                key={mIdx}
                                title={m.user.email}
                                className="w-8 h-8 border-2 border-card flex items-center justify-center text-[10px] text-white font-black shadow-sm hover:scale-110 hover:z-10 transition-all cursor-pointer"
                                style={{
                                  background: `hsl(${(mIdx * 137) % 360}, 65%, 55%)`,
                                  borderRadius: '50%'
                                }}
                              >
                                {m.user.email[0].toUpperCase()}
                              </div>
                            ))}
                            {workspace.members.length > 4 && (
                              <div className="w-8 h-8 border-2 border-card bg-secondary flex items-center justify-center text-[10px] font-black text-muted-foreground shadow-sm" style={{ borderRadius: '50%' }}>
                                +{workspace.members.length - 4}
                              </div>
                            )}
                          </div>

                          <div
                            className="flex items-center gap-1.5 text-xs font-bold opacity-0 group-hover:opacity-100 -translate-x-3 group-hover:translate-x-0 transition-all duration-300"
                            style={{ color: grad.from }}
                          >
                            Open <ChevronRight size={16} />
                          </div>
                        </div>

                        {/* Total assets indicator */}
                        {totalAssets > 0 && (
                          <div className="mt-3 flex items-center gap-2">
                            <div className="flex-1 h-1 bg-secondary overflow-hidden">
                              <div
                                className="h-full transition-all duration-700"
                                style={{
                                  width: `${Math.min((totalAssets / 10) * 100, 100)}%`,
                                  background: `linear-gradient(90deg, ${grad.from}, ${grad.to})`
                                }}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-muted-foreground">{totalAssets} asset{totalAssets !== 1 ? 's' : ''}</span>
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}

                {/* Empty / No results */}
                {filteredWorkspaces.length === 0 && !loading && (
                  <div className="col-span-full py-28 text-center border-2 border-dashed border-border flex flex-col items-center animate-fade-scale-in">
                    <div className="w-20 h-20 bg-secondary text-muted-foreground flex items-center justify-center mb-6 animate-float">
                      {searchQuery ? <Search size={36} /> : <LayoutDashboard size={36} />}
                    </div>
                    <h3 className="text-2xl font-black text-foreground">
                      {searchQuery ? 'No workspaces match your search' : 'Your Hub is Silent'}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                      {searchQuery
                        ? `No results for "${searchQuery}". Try a different term.`
                        : 'Start your journey by creating your first collaborative workspace.'
                      }
                    </p>
                    {!searchQuery && (
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="mt-8 px-8 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold shadow-xl hover:opacity-90 transition-all flex items-center gap-2"
                      >
                        <Plus size={18} className="stroke-[3]" />
                        Create First Workspace
                      </button>
                    )}
                  </div>
                )}

                {/* "Create New" trailing card */}
                {!searchQuery && filteredWorkspaces.length > 0 && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="group border-2 border-dashed border-border hover:border-primary p-7 min-h-[280px] flex flex-col items-center justify-center gap-4 transition-all duration-300 hover:bg-primary/3"
                  >
                    <div className="w-14 h-14 bg-secondary group-hover:bg-primary/10 flex items-center justify-center transition-all duration-300">
                      <Plus size={28} className="text-muted-foreground group-hover:text-primary stroke-2 transition-colors group-hover:rotate-90 duration-300" />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-foreground group-hover:text-primary transition-colors">New Workspace</p>
                      <p className="text-xs text-muted-foreground mt-1">Start a new collaboration hub</p>
                    </div>
                  </button>
                )}
              </div>
            ) : (
              /* Table View Implementation */
              <div className="premium-card overflow-hidden animate-fade-scale-in border-none shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-secondary/30 border-b border-border/50">
                        <th 
                          className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                          onClick={() => handleSort('name')}
                        >
                          <div className="flex items-center gap-2">
                            Collaboration Hub
                            {sortBy === 'name' && (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                          </div>
                        </th>
                        <th 
                          className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-muted-foreground text-center cursor-pointer hover:text-primary transition-colors"
                          onClick={() => handleSort('assets')}
                        >
                          <div className="flex items-center justify-center gap-2">
                            Assets
                            {sortBy === 'assets' && (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                          </div>
                        </th>
                        <th 
                          className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                          onClick={() => handleSort('date')}
                        >
                          <div className="flex items-center gap-2">
                            Timeline
                            {sortBy === 'date' && (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                          </div>
                        </th>
                        <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-muted-foreground">Owner / Creator</th>
                        <th 
                          className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                          onClick={() => handleSort('members')}
                        >
                          <div className="flex items-center gap-2">
                            Team Composition
                            {sortBy === 'members' && (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                          </div>
                        </th>
                        <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-muted-foreground text-right">Access</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {filteredWorkspaces.map((workspace: any) => {
                        const admin = workspace.members.find((m: any) => m.role === 'admin')?.user.email || 'System';
                        const docCount = workspace.documents?.filter((d: any) => d.type === 'text').length || 0;
                        const sheetCount = workspace.documents?.filter((d: any) => d.type === 'sheet').length || 0;
                        
                        // Calculate roles
                        const roles = Array.from(new Set(workspace.members.map((m: any) => m.role)));
                        const roleColors: Record<string, string> = {
                          admin: 'bg-indigo-500/10 text-indigo-600 border-indigo-200',
                          viewer: 'bg-amber-500/10 text-amber-600 border-amber-200',
                          editor: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
                          member: 'bg-blue-500/10 text-blue-600 border-blue-200',
                        };

                        return (
                          <tr key={workspace.id} className="hover:bg-primary/3 transition-all duration-300 group">
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-4">
                                <div className="w-11 h-11 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center text-indigo-600 border border-indigo-100 dark:border-indigo-900/30 shadow-sm group-hover:scale-110 transition-transform">
                                  <Folder size={22} />
                                </div>
                                <div className="space-y-0.5">
                                  <p className="font-bold text-foreground group-hover:text-primary transition-colors text-base">{workspace.name}</p>
                                  <div className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Enterprise Project</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex items-center justify-center gap-5">
                                <div className="flex items-center gap-2 group/asset">
                                  <FileText size={16} className="text-blue-500/70 group-hover/asset:text-blue-500 transition-colors" />
                                  <span className="text-sm font-black text-foreground">{docCount}</span>
                                </div>
                                <div className="flex items-center gap-2 group/asset">
                                  <Table size={16} className="text-emerald-500/70 group-hover/asset:text-emerald-500 transition-colors" />
                                  <span className="text-sm font-black text-foreground">{sheetCount}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-foreground">
                                  {workspace.createdAt ? new Date(parseInt(workspace.createdAt)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Jan 1, 2026'}
                                </span>
                                <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                                  <Clock size={10} />
                                  {workspace.createdAt ? new Date(parseInt(workspace.createdAt)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '12:00 AM'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <div 
                                  className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] text-white font-black shadow-inner border border-white/20"
                                  style={{ background: `hsl(${admin.charCodeAt(0) * 13 % 360}, 65%, 55%)` }}
                                >
                                  {admin[0].toUpperCase()}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-xs font-bold text-foreground max-w-[140px] truncate">{admin.split('@')[0]}</span>
                                  <span className="text-[9px] text-muted-foreground font-semibold">{admin}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-1.5">
                                  <Users size={14} className="text-muted-foreground" />
                                  <span className="text-xs font-black text-foreground">{workspace.members.length}</span>
                                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">Peers</span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {roles.map((role: any) => (
                                    <span 
                                      key={role} 
                                      className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 border ${roleColors[role as string] || 'bg-secondary text-muted-foreground border-border'}`}
                                    >
                                      {role}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5 text-right">
                              <Link 
                                href={`/workspace/${workspace.id}`}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-card border border-border text-foreground text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm group-hover:shadow-md"
                              >
                                Enter Hub <ChevronRight size={14} />
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {filteredWorkspaces.length === 0 && (
                    <div className="py-20 text-center flex flex-col items-center">
                      <div className="w-16 h-16 bg-secondary text-muted-foreground flex items-center justify-center mb-4">
                        <Search size={24} />
                      </div>
                      <p className="font-bold text-foreground">No matches found</p>
                      <p className="text-xs text-muted-foreground mt-1">Try refining your search strategy.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Workspace Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/50 backdrop-blur-sm"
          onClick={e => e.target === e.currentTarget && setShowCreateModal(false)}
        >
          <div className="bg-card w-full max-w-md shadow-2xl border border-border animate-fade-scale-in">
            {/* Modal header */}
            <div className="p-8 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-indigo-500/10 to-purple-600/10 border border-indigo-200 dark:border-indigo-800">
                    <Sparkles size={22} className="text-indigo-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-foreground">Create Workspace</h3>
                    <p className="text-xs text-muted-foreground font-medium mt-0.5">Launch a new collaborative hub</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-secondary text-muted-foreground transition-all"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal body */}
            <div className="p-8 space-y-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-2.5">
                  Workspace Name
                </label>
                <div className="relative">
                  <Folder className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="e.g. Marketing Team, Q2 Sprint..."
                    value={newWorkspaceName}
                    onChange={e => setNewWorkspaceName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleCreateWorkspace()}
                    className="w-full pl-11 pr-4 py-3.5 bg-secondary border border-border text-foreground outline-none focus:ring-2 ring-primary/15 focus:border-primary transition-all font-medium"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground mt-2">You can rename or add members at any time.</p>
              </div>

              {/* Workspace type previews */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 border border-border bg-secondary/50 text-left">
                  <FileText size={18} className="text-blue-500 mb-2" />
                  <p className="text-xs font-bold text-foreground">Documents</p>
                  <p className="text-[11px] text-muted-foreground">Collaborative writing</p>
                </div>
                <div className="p-4 border border-border bg-secondary/50 text-left">
                  <Table size={18} className="text-emerald-500 mb-2" />
                  <p className="text-xs font-bold text-foreground">Spreadsheets</p>
                  <p className="text-[11px] text-muted-foreground">Data & analysis</p>
                </div>
              </div>

              <button
                disabled={creating || !newWorkspaceName.trim()}
                onClick={handleCreateWorkspace}
                className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold shadow-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {creating ? (
                  <><RefreshCcw size={18} className="animate-spin" /> Creating...</>
                ) : (
                  <><Plus size={18} className="stroke-[3]" /> Launch Workspace</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
