'use client';

import { useQuery, useMutation, gql } from '@apollo/client';
import { useParams, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import {
  Plus, FileText, LayoutGrid, Search, ArrowLeft, Users, Table, MoreVertical,
  PieChart as PieIcon, LineChart as LineIcon, BarChart as BarIcon, Activity,
  Filter, Clock, Layout, Sparkles, MessageSquare, X, RefreshCcw, Shield,
  ChevronRight, Zap, Star, Eye, Edit3, Trash2, Copy, Globe, Lock, CheckCircle2,
  TrendingUp, FileSpreadsheet, AlignLeft, Settings
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Radar, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, ScatterChart, Scatter, Legend
} from 'recharts';
import Link from 'next/link';

const GET_WORKSPACE_DETAILS = gql`
  query GetWorkspaceDetails($id: ID!) {
    workspace(id: $id) {
      id
      name
      currentUserRole
      members {
        user {
          id
          email
        }
        role
      }
    }
    documents(workspaceId: $id) {
      id
      title
      content
      type
      createdAt
      updatedAt
    }
  }
`;

const CREATE_DOCUMENT = gql`
  mutation CreateDocument($title: String!, $workspaceId: ID!, $type: String!) {
    createDocument(title: $title, workspaceId: $workspaceId, type: $type) {
      id
      title
      type
    }
  }
`;

const GET_WORKSPACE_ANALYTICS = gql`
  query GetWorkspaceAnalytics($id: ID!) {
    workspaceAnalytics(id: $id) {
      assetDistribution { label value color }
      productivityTrend { label value }
      resourceAllocation { label value color }
      memberEngagement { username updates chats }
      updateFrequency { date count type }
      chatIntensity { label value color }
    }
  }
`;

function DocCardSkeleton() {
  return (
    <div className="premium-card p-6 min-h-[220px] flex flex-col justify-between animate-pulse">
      <div>
        <div className="flex justify-between mb-5">
          <div className="skeleton w-14 h-14 rounded-xl" />
          <div className="skeleton w-6 h-6 rounded" />
        </div>
        <div className="skeleton w-4/5 h-6 rounded mb-2" />
        <div className="skeleton w-2/3 h-4 rounded" />
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="skeleton w-24 h-4 rounded" />
        <div className="skeleton w-16 h-4 rounded" />
      </div>
    </div>
  );
}

function MemberRoleBadge({ role }: { role: string }) {
  const config: Record<string, { label: string; className: string }> = {
    admin: { label: 'Admin', className: 'bg-purple-50 text-purple-600 border border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800' },
    editor: { label: 'Editor', className: 'bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800' },
    viewer: { label: 'Viewer', className: 'bg-slate-50 text-slate-600 border border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800' },
  };
  const c = config[role] || config.viewer;
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 ${c.className}`}>
      {c.label}
    </span>
  );
}

export default function WorkspacePage() {
  const { id } = useParams();
  const router = useRouter();
  const [showPicker, setShowPicker] = useState(false);
  const [activeView, setActiveView] = useState<'hub' | 'analytics' | 'members'>('hub');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'text' | 'sheet'>('all');

  // Create doc modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState<'text' | 'sheet'>('text');
  const [createTitle, setCreateTitle] = useState('');
  const [creating, setCreating] = useState(false);
  const createInputRef = useRef<HTMLInputElement>(null);

  const { data, loading, refetch } = useQuery(GET_WORKSPACE_DETAILS, {
    variables: { id }
  });

  const { data: analData, loading: analLoading } = useQuery(GET_WORKSPACE_ANALYTICS, {
    variables: { id },
    skip: activeView !== 'analytics'
  });

  const [createDocument] = useMutation(CREATE_DOCUMENT);

  useEffect(() => {
    if (showCreateModal) setTimeout(() => createInputRef.current?.focus(), 100);
  }, [showCreateModal]);

  const role = data?.workspace?.currentUserRole;
  const isViewer = role === 'viewer';
  const isAdmin = role === 'admin';

  const handleOpenCreate = (type: 'text' | 'sheet') => {
    setCreateType(type);
    setCreateTitle('');
    setShowCreateModal(true);
    setShowPicker(false);
  };

  const handleCreateSubmit = async () => {
    if (!createTitle.trim()) return;
    setCreating(true);
    try {
      await createDocument({ variables: { title: createTitle.trim(), workspaceId: id, type: createType } });
      setShowCreateModal(false);
      setCreateTitle('');
      refetch();
    } catch (err) {
      alert('Error creating document');
    } finally {
      setCreating(false);
    }
  };

  const docs = data?.documents || [];
  const filteredDocs = docs.filter((d: any) => {
    const matchType = filterType === 'all' || d.type === filterType;
    const matchSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchSearch;
  });

  const members = data?.workspace?.members || [];

  const viewTabs = [
    { id: 'hub', label: 'Assets', icon: LayoutGrid },
    { id: 'analytics', label: 'Analytics', icon: Activity },
    { id: 'members', label: 'Team', icon: Users },
  ] as const;

  const getDocPreview = (doc: any) => {
    if (doc.type !== 'text' || !doc.content) return null;
    const text = doc.content.replace(/<[^>]*>/g, '').trim();
    return text.substring(0, 80) + (text.length > 80 ? '...' : '');
  };

  const formatDate = (iso: string) => {
    if (!iso) return 'Unknown';
    const d = new Date(iso);
    const now = new Date();
    const diff = (now.getTime() - d.getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return d.toLocaleDateString();
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent animate-spin" style={{ borderRadius: '50%' }} />
        <p className="text-sm font-semibold text-muted-foreground">Loading workspace...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen mesh-bg text-foreground">
      {/* Orb decorations */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] orb-1 pointer-events-none translate-x-1/2 -translate-y-1/2 z-0" />

      {/* Header */}
      <header className="glass-header px-6 lg:px-10 py-3.5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-5">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2.5 hover:bg-secondary text-muted-foreground transition-all border border-transparent hover:border-border"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black tracking-tight gradient-text">
                  {data?.workspace?.name}
                </h1>
                <MemberRoleBadge role={role || 'viewer'} />
              </div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse inline-block" />
                {docs.length} asset{docs.length !== 1 ? 's' : ''} · {members.length} member{members.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Tabs */}
            <div className="hidden sm:flex bg-secondary p-1 border border-border gap-0.5">
              {viewTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold transition-all ${
                    activeView === tab.id
                      ? 'bg-card shadow-sm text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <tab.icon size={14} />
                  {tab.label}
                </button>
              ))}
            </div>

            {!isViewer && (
              <div className="relative">
                <button
                  onClick={() => setShowPicker(!showPicker)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold hover:opacity-90 transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 text-sm"
                >
                  <Plus size={16} className="stroke-[3]" />
                  Add Asset
                </button>

                {showPicker && (
                  <div className="absolute right-0 mt-2 w-60 bg-card border border-border shadow-2xl p-2 z-[60] animate-fade-scale-in">
                    <button
                      onClick={() => handleOpenCreate('text')}
                      className="w-full flex items-center gap-4 p-3.5 hover:bg-secondary text-left transition-all group"
                    >
                      <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 group-hover:bg-blue-500 text-blue-500 group-hover:text-white transition-all">
                        <FileText size={18} />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-foreground block">Document</span>
                        <span className="text-[10px] text-muted-foreground font-semibold">Collaborative writing</span>
                      </div>
                    </button>
                    <button
                      onClick={() => handleOpenCreate('sheet')}
                      className="w-full flex items-center gap-4 p-3.5 hover:bg-secondary text-left transition-all group mt-1"
                    >
                      <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 group-hover:bg-emerald-500 text-emerald-500 group-hover:text-white transition-all">
                        <Table size={18} />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-foreground block">Spreadsheet</span>
                        <span className="text-[10px] text-muted-foreground font-semibold">Data & finance</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── HUB VIEW ── */}
      {activeView === 'hub' && (
        <main className="max-w-7xl mx-auto px-6 lg:px-10 py-10 relative z-10">
          {/* Search + Filter bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search assets..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-card border border-border focus:ring-2 focus:ring-primary/15 focus:border-primary outline-none text-sm font-medium transition-all"
              />
            </div>

            <div className="flex items-center gap-2">
              {(['all', 'text', 'sheet'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border ${
                    filterType === type
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-card border-border text-muted-foreground hover:border-primary hover:text-primary'
                  }`}
                >
                  {type === 'all' ? 'All' : type === 'text' ? 'Docs' : 'Sheets'}
                </button>
              ))}
            </div>

            {isViewer && (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 dark:bg-amber-900/15 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-xs font-bold">
                <Eye size={14} /> Read Only
              </div>
            )}
          </div>

          {/* Doc Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredDocs.map((doc: any, idx: number) => {
              const preview = getDocPreview(doc);
              const isSheet = doc.type === 'sheet';

              return (
                <Link
                  key={doc.id}
                  href={`/document/${doc.id}?w=${id}`}
                  className="premium-card p-6 flex flex-col justify-between min-h-[220px] relative overflow-hidden group animate-slide-up"
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  {/* Top accent bar */}
                  <div className={`absolute top-0 left-0 right-0 h-0.5 ${isSheet ? 'bg-emerald-500' : 'bg-blue-500'} group-hover:h-1 transition-all duration-300`} />

                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-3 transition-all duration-300 ${
                        isSheet
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white'
                          : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 group-hover:bg-blue-500 group-hover:text-white'
                      }`}>
                        {isSheet ? <Table size={24} /> : <FileText size={24} />}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 ${
                          isSheet
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
                            : 'bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
                        }`}>
                          {isSheet ? 'Sheet' : 'Doc'}
                        </div>
                      </div>
                    </div>

                    <h3 className="text-lg font-black text-foreground tracking-tight group-hover:translate-x-1 transition-transform duration-300 line-clamp-2">
                      {doc.title}
                    </h3>

                    {preview && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed font-medium">
                        {preview}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground">
                      <Clock size={11} />
                      {formatDate(doc.updatedAt)}
                    </div>
                    <div className={`opacity-0 group-hover:opacity-100 transition-all duration-300 text-xs font-bold flex items-center gap-1 ${isSheet ? 'text-emerald-500' : 'text-blue-500'}`}>
                      Open <ChevronRight size={12} />
                    </div>
                  </div>

                  {/* Background glow */}
                  <div className={`absolute -right-8 -bottom-8 w-32 h-32 opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-700 ${isSheet ? 'bg-emerald-500/10' : 'bg-blue-500/10'}`} style={{ borderRadius: '50% !important' }} />
                </Link>
              );
            })}

            {filteredDocs.length === 0 && !loading && (
              <div className="col-span-full py-28 text-center border-2 border-dashed border-border flex flex-col items-center animate-fade-scale-in">
                <div className="w-20 h-20 bg-secondary text-muted-foreground flex items-center justify-center mb-6 animate-float">
                  {searchQuery ? <Search size={36} /> : <Layout size={36} />}
                </div>
                <h3 className="text-xl font-black text-foreground">
                  {searchQuery ? 'No assets match your search' : 'Workspace is Empty'}
                </h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                  {searchQuery
                    ? `No results for "${searchQuery}".`
                    : 'Create your first document or spreadsheet to begin collaborating.'
                  }
                </p>
                {!isViewer && !searchQuery && (
                  <button
                    onClick={() => setShowPicker(true)}
                    className="mt-8 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold hover:opacity-90 transition-all flex items-center gap-2"
                  >
                    <Plus size={16} className="stroke-[3]" /> Create Asset
                  </button>
                )}
              </div>
            )}

            {/* Trailing "add" card */}
            {!isViewer && !searchQuery && filteredDocs.length > 0 && (
              <button
                onClick={() => setShowPicker(true)}
                className="group border-2 border-dashed border-border hover:border-primary p-6 min-h-[220px] flex flex-col items-center justify-center gap-3 transition-all hover:bg-primary/3"
              >
                <div className="w-12 h-12 bg-secondary group-hover:bg-primary/10 flex items-center justify-center transition-all">
                  <Plus size={24} className="text-muted-foreground group-hover:text-primary stroke-2 transition-colors group-hover:rotate-90 duration-300" />
                </div>
                <p className="text-sm font-bold text-muted-foreground group-hover:text-primary transition-colors">Add Asset</p>
              </button>
            )}
          </div>
        </main>
      )}

      {/* ── ANALYTICS VIEW ── */}
      {activeView === 'analytics' && (
        <main className="max-w-7xl mx-auto px-6 lg:px-10 py-10 animate-fade-scale-in relative z-10">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-black tracking-tight gradient-text">Intelligence Deck</h2>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1">Real-time Workspace Metadata Analysis</p>
            </div>
            <div className="flex items-center gap-3">
              <select className="bg-card border border-border px-4 py-2.5 text-xs font-bold uppercase tracking-widest outline-none transition-all text-foreground">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>
          </div>

          {analLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="premium-card p-8 h-80 animate-pulse">
                  <div className="skeleton h-4 w-40 mb-6 rounded" />
                  <div className="skeleton h-full w-full rounded-lg" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {/* Asset Distribution Pie */}
              <div className="premium-card p-7 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 orb-1 -mr-16 -mt-16" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-6 flex items-center gap-2">
                  <PieIcon size={14} className="text-primary" /> Asset Distribution
                </h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analData?.workspaceAnalytics?.assetDistribution || []}
                        cx="50%" cy="50%"
                        innerRadius={55} outerRadius={80}
                        paddingAngle={6} dataKey="value" nameKey="label"
                        animationBegin={0} animationDuration={1200}
                      >
                        {(analData?.workspaceAnalytics?.assetDistribution || []).map((entry: any, i: number) => (
                          <Cell key={i} fill={entry.color} className="hover:opacity-80 transition-opacity cursor-pointer" />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Team Radar */}
              <div className="premium-card p-7">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-6 flex items-center gap-2">
                  <Users size={14} className="text-primary" /> Team Engagement
                </h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={analData?.workspaceAnalytics?.memberEngagement || []}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="username" fontSize={9} fontWeight="bold" />
                      <PolarRadiusAxis domain={[0, 100]} fontSize={8} stroke="transparent" />
                      <Radar name="Updates" dataKey="updates" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.4} />
                      <Radar name="Chats" dataKey="chats" stroke="#F43F5E" fill="#F43F5E" fillOpacity={0.25} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: 'none', borderRadius: '6px', fontSize: '11px' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Productivity Trend */}
              <div className="premium-card p-7 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-32 h-32 orb-emerald -ml-16 -mt-16" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-6 flex items-center gap-2">
                  <TrendingUp size={14} className="text-emerald-500" /> Productivity Velocity
                </h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analData?.workspaceAnalytics?.productivityTrend || []}>
                      <defs>
                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="label" stroke="hsl(var(--border))" fontSize={9} fontWeight="bold" />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '6px', fontSize: '11px' }} />
                      <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2.5} fillOpacity={1} fill="url(#colorVal)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Update Scatter − full width */}
              <div className="premium-card p-7 md:col-span-2">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-6 flex items-center gap-2">
                  <Activity size={14} className="text-primary" /> Update Interaction Velocity
                </h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                      <XAxis type="category" dataKey="date" stroke="hsl(var(--border))" fontSize={9} />
                      <YAxis type="number" dataKey="count" stroke="hsl(var(--border))" fontSize={9} />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '6px', fontSize: '11px' }} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                      <Scatter name="Documents" data={analData?.workspaceAnalytics?.updateFrequency?.filter((f: any) => f.type === 'text') || []} fill="#3B82F6" />
                      <Scatter name="Sheets" data={analData?.workspaceAnalytics?.updateFrequency?.filter((f: any) => f.type === 'sheet') || []} fill="#10B981" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Communication Pie */}
              <div className="premium-card p-7">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-6 flex items-center gap-2">
                  <MessageSquare size={14} className="text-primary" /> Communication Intensity
                </h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={analData?.workspaceAnalytics?.chatIntensity || []} cx="50%" cy="50%" innerRadius={35} outerRadius={70} dataKey="value" stroke="none">
                        {(analData?.workspaceAnalytics?.chatIntensity || []).map((entry: any, i: number) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '6px', fontSize: '11px' }} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Talent Allocation Bar − full */}
              <div className="premium-card p-7 lg:col-span-3">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-6 flex items-center gap-2">
                  <BarIcon size={14} className="text-primary" /> Talent Allocation
                </h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analData?.workspaceAnalytics?.resourceAllocation || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="label" stroke="hsl(var(--border))" fontSize={10} fontWeight="bold" />
                      <YAxis stroke="hsl(var(--border))" fontSize={10} fontWeight="bold" />
                      <Tooltip cursor={{ fill: 'hsl(var(--secondary))' }} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '6px', fontSize: '11px' }} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={36}>
                        {(analData?.workspaceAnalytics?.resourceAllocation || []).map((entry: any, i: number) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </main>
      )}

      {/* ── MEMBERS VIEW ── */}
      {activeView === 'members' && (
        <main className="max-w-7xl mx-auto px-6 lg:px-10 py-10 animate-fade-scale-in relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-black gradient-text">Team Members</h2>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">{members.length} member{members.length !== 1 ? 's' : ''} collaborating</p>
            </div>
            {isAdmin && (
              <button
                onClick={() => router.push(`/workspace/${id}/settings`)}
                className="flex items-center gap-2 px-5 py-2.5 bg-card border border-border text-foreground font-bold hover:bg-secondary transition-all text-sm"
              >
                <Settings size={16} /> Manage Team
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((m: any, i: number) => (
              <div key={m.user.id} className="premium-card p-6 flex items-center gap-4 animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
                <div
                  className="w-12 h-12 flex items-center justify-center text-base text-white font-black shadow-lg shrink-0"
                  style={{
                    background: `hsl(${(i * 137) % 360}, 65%, 55%)`,
                    borderRadius: '50%'
                  }}
                >
                  {m.user.email[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground text-sm truncate">{m.user.email}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <MemberRoleBadge role={m.role} />
                    <span className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active
                    </span>
                  </div>
                </div>
                <div className="text-muted-foreground opacity-30">
                  {m.role === 'admin' ? <Shield size={18} /> : m.role === 'editor' ? <Edit3 size={18} /> : <Eye size={18} />}
                </div>
              </div>
            ))}
          </div>

          {members.length === 0 && (
            <div className="py-24 text-center border-2 border-dashed border-border flex flex-col items-center animate-fade-scale-in">
              <div className="w-16 h-16 bg-secondary text-muted-foreground flex items-center justify-center mb-4 animate-float">
                <Users size={28} />
              </div>
              <h3 className="text-xl font-black text-foreground">No Team Members Yet</h3>
              <p className="text-sm text-muted-foreground mt-2">Invite collaborators from the document editor.</p>
            </div>
          )}
        </main>
      )}

      {/* CREATE DOCUMENT MODAL */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/50 backdrop-blur-sm"
          onClick={e => e.target === e.currentTarget && setShowCreateModal(false)}
        >
          <div className="bg-card w-full max-w-md shadow-2xl border border-border animate-fade-scale-in">
            <div className="p-7 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 ${createType === 'sheet' ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-blue-50 dark:bg-blue-900/20'}`}>
                    {createType === 'sheet'
                      ? <Table size={20} className="text-emerald-500" />
                      : <FileText size={20} className="text-blue-500" />
                    }
                  </div>
                  <div>
                    <h3 className="text-lg font-black">New {createType === 'sheet' ? 'Spreadsheet' : 'Document'}</h3>
                    <p className="text-xs text-muted-foreground font-medium mt-0.5">Add a new collaborative asset</p>
                  </div>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-secondary text-muted-foreground transition-all">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-7 space-y-5">
              {/* Type selector */}
              <div className="grid grid-cols-2 gap-3">
                {(['text', 'sheet'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setCreateType(t)}
                    className={`p-4 border-2 text-left transition-all ${createType === t
                      ? t === 'sheet'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                        : 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-border hover:border-primary'
                    }`}
                  >
                    {t === 'sheet' ? <Table size={18} className="text-emerald-500 mb-2" /> : <FileText size={18} className="text-blue-500 mb-2" />}
                    <p className="text-xs font-bold">{t === 'sheet' ? 'Spreadsheet' : 'Document'}</p>
                    <p className="text-[11px] text-muted-foreground">{t === 'sheet' ? 'Data & analysis' : 'Collaborative text'}</p>
                  </button>
                ))}
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-2">
                  Asset Title
                </label>
                <input
                  ref={createInputRef}
                  type="text"
                  placeholder={createType === 'sheet' ? 'e.g. Q2 Revenue Sheet' : 'e.g. Product Roadmap'}
                  value={createTitle}
                  onChange={e => setCreateTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreateSubmit()}
                  className="w-full px-4 py-3.5 bg-secondary border border-border text-foreground outline-none focus:ring-2 ring-primary/15 focus:border-primary transition-all font-medium"
                />
              </div>

              <button
                disabled={creating || !createTitle.trim()}
                onClick={handleCreateSubmit}
                className={`w-full py-4 text-white font-bold shadow-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
                  createType === 'sheet'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-200 dark:shadow-emerald-900/30'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-500 shadow-blue-200 dark:shadow-blue-900/30'
                }`}
              >
                {creating ? (
                  <><RefreshCcw size={18} className="animate-spin" /> Creating...</>
                ) : (
                  <><Plus size={18} className="stroke-[3]" /> Create {createType === 'sheet' ? 'Spreadsheet' : 'Document'}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
