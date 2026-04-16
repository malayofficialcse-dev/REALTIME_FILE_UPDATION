'use client';

import { useQuery, useMutation, useSubscription, gql } from '@apollo/client';
import { useParams, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import {
  Plus, FileText, LayoutGrid, Search, ArrowLeft, Users, Table, MoreVertical,
  PieChart as PieIcon, LineChart as LineIcon, BarChart as BarIcon, Activity,
  Filter, Clock, Layout, Sparkles, MessageSquare, X, RefreshCcw, Shield,
  ChevronRight, Zap, Star, Eye, Edit3, Trash2, Copy, Globe, Lock, CheckCircle2,
  TrendingUp, FileSpreadsheet, AlignLeft, Settings, Trello, Calendar, AlertCircle,
  Timer, History, BarChart3, ChevronDown, Bell, Check
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
    getTasks(workspaceId: $id) {
      id
      title
      description
      status
      priority
      totalMinutesLogged
      assignee {
        id
        email
      }
      createdAt
      updatedAt
    }
    myNotifications {
      id
      type
      status
      message
      createdAt
      sender { email }
    }
  }
`;

const NOTIFICATION_SUB = gql`
  subscription OnNotificationAdded {
    notificationAdded {
      id
      type
      message
      status
      createdAt
      sender { email }
    }
  }
`;

const MARK_READ = gql`
  mutation MarkAsRead($notificationId: ID!) {
    markAsRead(notificationId: $notificationId)
  }
`;

const GET_TIME_LOGS = gql`
  query GetTimeLogs($workspaceId: ID!) {
    getTimeLogs(workspaceId: $workspaceId) {
      id
      durationMinutes
      description
      logDate
      user { email }
      task { title }
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

const CREATE_TASK = gql`
  mutation CreateTask($workspaceId: ID!, $title: String!, $status: String, $priority: String, $assigneeId: ID) {
    createTask(workspaceId: $workspaceId, title: $title, status: $status, priority: $priority, assigneeId: $assigneeId) {
      id
      title
    }
  }
`;

const UPDATE_TASK = gql`
  mutation UpdateTask($id: ID!, $status: String, $priority: String, $title: String, $description: String) {
    updateTask(id: $id, status: $status, priority: $priority, title: $title, description: $description) {
      id
      status
    }
  }
`;

const LOG_TIME = gql`
  mutation LogTime($taskId: ID!, $durationMinutes: Int!, $description: String) {
    logTime(taskId: $taskId, durationMinutes: $durationMinutes, description: $description) {
      id
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

export default function WorkspacePage() {
  const { id } = useParams();
  const router = useRouter();
  const [showPicker, setShowPicker] = useState(false);
  const [activeView, setActiveView] = useState<'hub' | 'board' | 'timesheets' | 'analytics' | 'members'>('hub');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'text' | 'sheet'>('all');
  const [showNotifications, setShowNotifications] = useState(false);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState<'text' | 'sheet' | 'task' | 'log'>('text');
  const [createTitle, setCreateTitle] = useState('');
  const [logTask, setLogTask] = useState<string | null>(null);
  const [logDuration, setLogDuration] = useState('60');
  const [logDesc, setLogDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const createInputRef = useRef<HTMLInputElement>(null);

  // Notifications state for Toasts
  const [toasts, setToasts] = useState<any[]>([]);

  const { data, loading, refetch } = useQuery(GET_WORKSPACE_DETAILS, {
    variables: { id }
  });

  const { data: logsData, loading: logsLoading, refetch: refetchLogs } = useQuery(GET_TIME_LOGS, {
    variables: { workspaceId: id },
    skip: activeView !== 'timesheets'
  });

  const { data: analData, loading: analLoading } = useQuery(GET_WORKSPACE_ANALYTICS, {
    variables: { id },
    skip: activeView !== 'analytics'
  });

  const [createDocument] = useMutation(CREATE_DOCUMENT);
  const [createTask] = useMutation(CREATE_TASK);
  const [updateTaskMutation] = useMutation(UPDATE_TASK);
  const [logTimeMutation] = useMutation(LOG_TIME);
  const [markRead] = useMutation(MARK_READ);

  // Real-time Notifications Subscription
  useSubscription(NOTIFICATION_SUB, {
    onData: ({ data: subData }) => {
      const newNotif = subData.data?.notificationAdded;
      if (newNotif) {
        setToasts(prev => [...prev, newNotif]);
        refetch(); // Refresh list
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== newNotif.id));
        }, 5000);
      }
    }
  });

  useEffect(() => {
    if (showCreateModal) setTimeout(() => createInputRef.current?.focus(), 100);
  }, [showCreateModal]);

  const role = data?.workspace?.currentUserRole;
  const isViewer = role === 'viewer';
  const isAdmin = role === 'admin';
  const notifications = data?.myNotifications || [];
  const unreadCount = notifications.filter((n: any) => n.status === 'unread').length;

  const handleMarkRead = async (nid: string) => {
    await markRead({ variables: { notificationId: nid } });
    refetch();
  };

  const handleOpenCreate = (type: 'text' | 'sheet' | 'task') => {
    setCreateType(type);
    setCreateTitle('');
    setShowCreateModal(true);
    setShowPicker(false);
  };

  const handleOpenLog = (taskId: string) => {
    setLogTask(taskId);
    setCreateType('log');
    setShowCreateModal(true);
  };

  const handleCreateSubmit = async () => {
    setCreating(true);
    try {
      if (createType === 'log') {
        if (!logTask) return;
        await logTimeMutation({ variables: { taskId: logTask, durationMinutes: parseInt(logDuration), description: logDesc } });
        refetch();
        refetchLogs();
      } else {
        if (!createTitle.trim()) return;
        if (createType === 'task') {
          await createTask({ variables: { title: createTitle.trim(), workspaceId: id, status: 'TODO' } });
        } else {
          await createDocument({ variables: { title: createTitle.trim(), workspaceId: id, type: createType } });
        }
      }
      setShowCreateModal(false);
      setCreateTitle('');
      setLogDesc('');
      refetch();
    } catch (err) {
      alert('Error processing request');
    } finally {
      setCreating(false);
    }
  };

  const handleDragUpdate = async (taskId: string, newStatus: string) => {
    try {
      await updateTaskMutation({ variables: { id: taskId, status: newStatus } });
      refetch();
    } catch (err) {
      console.error('Board Update Error:', err);
    }
  };

  const docs = data?.documents || [];
  const tasks = data?.getTasks || [];
  const logs = logsData?.getTimeLogs || [];
  
  const filteredDocs = docs.filter((d: any) => {
    const matchType = filterType === 'all' || d.type === filterType;
    const matchSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchSearch;
  });

  const members = data?.workspace?.members || [];

  const viewTabs = [
    { id: 'hub', label: 'Assets', icon: LayoutGrid },
    { id: 'board', label: 'Board', icon: Trello },
    { id: 'timesheets', label: 'Timesheets', icon: Timer },
    { id: 'analytics', label: 'Analytics', icon: Activity },
    { id: 'members', label: 'Team', icon: Users },
  ] as const;

  const kanbanColumns = [
    { id: 'TODO', label: 'To Do', color: 'bg-slate-500' },
    { id: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-500' },
    { id: 'REVIEW', label: 'Review', color: 'bg-purple-500' },
    { id: 'DONE', label: 'Done', color: 'bg-emerald-500' },
  ];

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

  const formatMinutes = (m: number) => {
     if (m < 60) return `${m}m`;
     const h = Math.floor(m / 60);
     const rem = m % 60;
     return rem > 0 ? `${h}h ${rem}m` : `${h}h`;
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4"><div className="w-12 h-12 border-4 border-primary border-t-transparent animate-spin" style={{ borderRadius: '50%' }} /><p className="text-sm font-semibold text-muted-foreground">Loading workspace...</p></div>
    </div>
  );

  return (
    <div className="min-h-screen mesh-bg text-foreground">
      {/* Real-time Toasts */}
      <div className="fixed top-24 right-8 z-[200] space-y-3 pointer-events-none">
         {toasts.map(toast => (
           <div key={toast.id} className="bg-white dark:bg-slate-900 border-l-4 border-primary shadow-[0_20px_60px_rgba(0,0,0,0.15)] p-5 w-80 animate-slide-in pointer-events-auto flex items-start gap-4 ring-1 ring-border">
              <div className="p-2 bg-primary/10 text-primary">
                 <Bell size={18} />
              </div>
              <div className="flex-1">
                 <h4 className="text-xs font-black uppercase tracking-widest text-primary mb-1">{toast.type.replace('_', ' ')}</h4>
                 <p className="text-sm font-bold text-foreground leading-tight">{toast.message}</p>
                 <span className="text-[10px] text-muted-foreground mt-2 block font-medium">Just Now</span>
              </div>
              <button 
                onClick={() => setToasts(t => t.filter(x => x.id !== toast.id))}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={14} />
              </button>
           </div>
         ))}
      </div>

      {/* Header */}
      <header className="glass-header px-6 lg:px-10 py-3.5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-5">
            <button onClick={() => router.push('/dashboard')} className="p-2.5 hover:bg-secondary text-muted-foreground transition-all border border-transparent hover:border-border"><ArrowLeft size={18} /></button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black tracking-tight gradient-text">{data?.workspace?.name}</h1>
                <MemberRoleBadge role={role || 'viewer'} />
              </div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse inline-block" />
                {docs.length} assets · {tasks.length} tasks · {members.length} team
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex bg-secondary p-1 border border-border gap-0.5">
              {viewTabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveView(tab.id)} className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold transition-all ${activeView === tab.id ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}><tab.icon size={14} />{tab.label}</button>
              ))}
            </div>

            {/* Notification Bell */}
            <div className="relative">
               <button 
                 onClick={() => setShowNotifications(!showNotifications)}
                 className={`p-2.5 transition-all text-muted-foreground hover:text-primary relative ${showNotifications ? 'bg-secondary' : ''}`}
               >
                 <Bell size={20} />
                 {unreadCount > 0 && (
                   <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-pulse-subtle">
                      {unreadCount}
                   </span>
                 )}
               </button>

               {showNotifications && (
                 <div className="absolute right-0 mt-3 w-96 bg-card border border-border shadow-2xl z-[100] animate-fade-scale-in">
                    <div className="p-5 border-b border-border flex items-center justify-between">
                       <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Activity Stream</h3>
                       <button onClick={async () => { /* Mark all Read */ }} className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">Mark all read</button>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                       {notifications.map((n: any) => (
                         <div key={n.id} className={`p-5 flex gap-4 hover:bg-secondary/30 transition-all border-b border-border last:border-0 relative ${n.status === 'unread' ? 'bg-primary/3' : ''}`}>
                            <div className={`w-10 h-10 shrink-0 flex items-center justify-center bg-card border border-border shadow-sm`}>
                               {n.type === 'TASK_ASSIGNED' ? <Zap size={18} className="text-indigo-500" /> : <Shield size={18} className="text-blue-500" />}
                            </div>
                            <div className="flex-1 min-w-0">
                               <p className="text-xs font-bold text-foreground leading-snug">{n.message}</p>
                               <span className="text-[10px] font-medium text-muted-foreground mt-2 block">{formatDate(n.createdAt)}</span>
                            </div>
                            {n.status === 'unread' && (
                               <button onClick={() => handleMarkRead(n.id)} className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all">
                                  <Check size={12} />
                               </button>
                            )}
                         </div>
                       ))}
                       {notifications.length === 0 && (
                          <div className="py-12 text-center text-muted-foreground py-10">
                             <Bell size={24} className="mx-auto opacity-10 mb-3" />
                             <p className="text-[10px] font-black uppercase tracking-widest">System Silent</p>
                          </div>
                       )}
                    </div>
                    <div className="p-4 bg-secondary/30 border-t border-border text-center">
                       <Link href="/notifications" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">View All Alerts</Link>
                    </div>
                 </div>
               )}
            </div>

            {!isViewer && (
              <div className="relative">
                <button onClick={() => setShowPicker(!showPicker)} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold hover:opacity-90 transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 text-sm"><Plus size={16} className="stroke-[3]" />Add Asset</button>
                {showPicker && (
                  <div className="absolute right-0 mt-2 w-60 bg-card border border-border shadow-2xl p-2 z-[60] animate-fade-scale-in">
                    <button onClick={() => handleOpenCreate('task')} className="w-full flex items-center gap-4 p-3.5 hover:bg-secondary text-left transition-all group"><div className="p-2.5 bg-purple-50 dark:bg-purple-900/20 group-hover:bg-purple-500 text-purple-500 group-hover:text-white transition-all"><Trello size={18} /></div><div><span className="text-sm font-bold text-foreground block">Task Item</span><span className="text-[10px] text-muted-foreground font-semibold">Workflow tracking</span></div></button>
                    <button onClick={() => handleOpenCreate('text')} className="w-full flex items-center gap-4 p-3.5 hover:bg-secondary text-left transition-all group mt-1"><div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 group-hover:bg-blue-500 text-blue-500 group-hover:text-white transition-all"><FileText size={18} /></div><div><span className="text-sm font-bold text-foreground block">Document</span><span className="text-[10px] text-muted-foreground font-semibold">Collaborative writing</span></div></button>
                    <button onClick={() => handleOpenCreate('sheet')} className="w-full flex items-center gap-4 p-3.5 hover:bg-secondary text-left transition-all group mt-1"><div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 group-hover:bg-emerald-500 text-emerald-500 group-hover:text-white transition-all"><Table size={18} /></div><div><span className="text-sm font-bold text-foreground block">Spreadsheet</span><span className="text-[10px] text-muted-foreground font-semibold">Data & finance</span></div></button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* HUB VIEW */}
      {activeView === 'hub' && (
        <main className="max-w-7xl mx-auto px-6 lg:px-10 py-10 relative z-10">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8">
            <div className="relative flex-1 max-w-md"><Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><input type="text" placeholder="Search assets..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-card border border-border focus:ring-2 focus:ring-primary/15 focus:border-primary outline-none text-sm font-medium transition-all" /></div>
            <div className="flex items-center gap-2">{(['all', 'text', 'sheet'] as const).map(type => <button key={type} onClick={() => setFilterType(type)} className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border ${filterType === type ? 'bg-primary text-white border-primary shadow-sm' : 'bg-card border-border text-muted-foreground hover:border-primary hover:text-primary'}`}>{type === 'all' ? 'All' : type === 'text' ? 'Docs' : 'Sheets'}</button>)}</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredDocs.map((doc: any, idx: number) => {
              const preview = getDocPreview(doc);
              const isSheet = doc.type === 'sheet';
              return (
                <Link key={doc.id} href={`/document/${doc.id}?w=${id}`} className="premium-card p-6 flex flex-col justify-between min-h-[220px] relative overflow-hidden group animate-slide-up" style={{ animationDelay: `${idx * 60}ms` }}>
                  <div className={`absolute top-0 left-0 right-0 h-0.5 ${isSheet ? 'bg-emerald-500' : 'bg-blue-500'} group-hover:h-1 transition-all duration-300`} />
                  <div><div className="flex justify-between items-start mb-4"><div className={`p-3 transition-all duration-300 ${isSheet ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 group-hover:bg-blue-500 group-hover:text-white'}`}>{isSheet ? <Table size={24} /> : <FileText size={24} />}</div><div className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-secondary border border-border">{isSheet ? 'Sheet' : 'Doc'}</div></div><h3 className="text-lg font-black text-foreground tracking-tight group-hover:translate-x-1 transition-transform duration-300 line-clamp-2">{doc.title}</h3>{preview && <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed font-medium">{preview}</p>}</div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border"><div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground"><Clock size={11} /> {formatDate(doc.updatedAt)}</div><div className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-xs font-bold flex items-center gap-1 text-primary">Open <ChevronRight size={12} /></div></div>
                </Link>
              );
            })}
          </div>
        </main>
      )}

      {/* BOARD VIEW */}
      {activeView === 'board' && (
        <main className="max-w-[100vw] px-6 lg:px-10 py-10 overflow-x-auto custom-scrollbar relative z-10">
          <div className="flex gap-6 min-w-[1000px] h-[calc(100vh-220px)]">
            {kanbanColumns.map(column => {
              const columnTasks = tasks.filter((t: any) => t.status === column.id);
              return (
                <div key={column.id} className="flex-1 flex flex-col min-w-[280px] bg-secondary/50 border border-border p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-4 px-2"><div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${column.color}`} /><h3 className="text-sm font-black uppercase tracking-widest text-foreground">{column.label}</h3><span className="text-[10px] font-bold text-muted-foreground px-2 py-0.5 bg-card border border-border rounded-full">{columnTasks.length}</span></div>{!isViewer && <button onClick={() => { handleOpenCreate('task'); setCreateTitle(''); }} className="p-1 hover:bg-card text-muted-foreground hover:text-primary transition-colors"><Plus size={16} /></button>}</div>
                  <div className="flex-1 space-y-3 overflow-y-auto no-scrollbar pb-10">
                    {columnTasks.map((task: any) => (
                      <div key={task.id} className="premium-card p-4 hover:border-primary group cursor-grab transition-all hover:translate-y-[-2px] hover:shadow-xl shadow-sm bg-card">
                        <div className="flex items-start justify-between gap-3 mb-2"><h4 className="text-sm font-bold text-foreground leading-tight group-hover:text-primary transition-colors">{task.title}</h4><div className={`mt-1 shrink-0 px-2 py-0.5 text-[9px] font-black uppercase tracking-tighter border ${task.priority === 'HIGH' || task.priority === 'CRITICAL' ? 'bg-rose-50 text-rose-600 border-rose-200' : task.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>{task.priority}</div></div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground mb-4"><Timer size={12} className={task.totalMinutesLogged > 0 ? "text-emerald-500" : ""} /><span className={task.totalMinutesLogged > 0 ? "text-foreground" : "opacity-50"}>{task.totalMinutesLogged > 0 ? formatMinutes(task.totalMinutesLogged) : '0h'} tracked</span></div>
                        <div className="flex items-center justify-between"><div className="flex items-center gap-3">{task.assignee ? <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[8px] font-black text-white shadow-sm">{task.assignee.email[0].toUpperCase()}</div> : <div className="w-6 h-6 rounded-full border border-dashed border-border flex items-center justify-center text-muted-foreground"><Users size={10} /></div>}</div>{!isViewer && <button onClick={() => handleOpenLog(task.id)} className="p-1.5 bg-secondary text-primary hover:bg-primary hover:text-white transition-all rounded-[3px] flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest"><Plus size={10} /> Log Time</button>}</div>
                        {!isViewer && <div className="mt-4 pt-4 border-t border-border flex items-center justify-between gap-1 opacity-0 group-hover:opacity-100 transition-opacity"><div className="flex gap-1">{kanbanColumns.filter(c => c.id !== column.id).map(target => <button key={target.id} onClick={() => handleDragUpdate(task.id, target.id)} className="p-1 text-[8px] font-black uppercase border border-border hover:border-primary transition-all hover:bg-primary/10">{target.label.split(' ')[0]}</button>)}</div></div>}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      )}

      {/* TIMESHEETS VIEW */}
      {activeView === 'timesheets' && (
        <main className="max-w-7xl mx-auto px-6 lg:px-10 py-10 animate-fade-scale-in relative z-10">
          <div className="bg-card border border-border relative overflow-hidden"><div className="p-8 border-b border-border flex items-center justify-between"><div><h2 className="text-3xl font-black gradient-text">Resource Ledger</h2><p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Audit trail of workspace execution hours</p></div><button onClick={() => refetchLogs()} className="p-2.5 bg-secondary hover:bg-primary hover:text-white transition-all border border-border"><RefreshCcw size={18} /></button></div>
             <div className="overflow-x-auto"><table className="w-full text-left border-collapse"><thead><tr className="bg-secondary/50 border-b border-border"><th className="p-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Team Member</th><th className="p-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Task Item</th><th className="p-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Duration</th><th className="p-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Statement</th><th className="p-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Execution Date</th></tr></thead><tbody>{logs.map((log: any) => (<tr key={log.id} className="border-b border-border hover:bg-secondary/20 transition-colors"><td className="p-5 flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] text-white font-black">{log.user.email[0].toUpperCase()}</div><span className="text-sm font-bold text-foreground">{log.user.email.split('@')[0]}</span></td><td className="p-5"><span className="text-xs font-black uppercase tracking-tighter text-muted-foreground truncate max-w-[200px] inline-block">{log.task.title}</span></td><td className="p-5"><div className="flex items-center gap-2"><Timer size={14} className="text-primary" /><span className="text-sm font-black text-foreground">{formatMinutes(log.durationMinutes)}</span></div></td><td className="p-5"><p className="text-xs text-muted-foreground font-medium italic truncate max-w-[250px]">{log.description || "System automatic log"}</p></td><td className="p-5"><span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{new Date(log.logDate).toLocaleDateString()}</span></td></tr>))}</tbody></table>{logs.length === 0 && !logsLoading && <div className="py-20 text-center flex flex-col items-center gap-4"><Timer size={48} className="text-muted-foreground opacity-20" /><p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">No hours logged in this workspace yet.</p></div>}</div>
          </div>
        </main>
      )}

      {/* ANALYTICS VIEW */}
      {activeView === 'analytics' && (
        <main className="max-w-7xl mx-auto px-6 lg:px-10 py-10 animate-fade-scale-in relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="premium-card p-7"><h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-6 flex items-center gap-2"><PieIcon size={14} className="text-primary" /> Asset Distribution</h3><div className="h-56"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={analData?.workspaceAnalytics?.assetDistribution || []} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={6} dataKey="value" nameKey="label">{(analData?.workspaceAnalytics?.assetDistribution || []).map((entry: any, i: number) => <Cell key={i} fill={entry.color} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div></div>
              <div className="premium-card p-7"><h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-6 flex items-center gap-2"><BarChart3 size={14} className="text-emerald-500" /> Resource Expenditure</h3><div className="h-56 flex flex-col justify-center"><div className="space-y-4">{kanbanColumns.map(col => { const mins = tasks.filter((t: any) => t.status === col.id).reduce((acc: number, t: any) => acc + (t.totalMinutesLogged || 0), 0); const totalMins = tasks.reduce((acc: number, t: any) => acc + (t.totalMinutesLogged || 0), 0); const percentage = totalMins > 0 ? (mins / totalMins) * 100 : 0; return ( <div key={col.id}><div className="flex justify-between items-center mb-1.5 px-1"><span className="text-[10px] font-black uppercase tracking-widest text-foreground">{col.label}</span><span className="text-[10px] font-black text-muted-foreground">{formatMinutes(mins)}</span></div><div className="h-2 bg-secondary overflow-hidden"><div className={`h-full transition-all duration-1000 ${col.color}`} style={{ width: `${percentage}%` }} /></div></div> ) })}</div></div></div>
              <div className="premium-card p-7"><h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-6 flex items-center gap-2"><TrendingUp size={14} className="text-emerald-500" /> Productivity Velocity</h3><div className="h-56"><ResponsiveContainer width="100%" height="100%"><AreaChart data={analData?.workspaceAnalytics?.productivityTrend || []}><Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fillOpacity={0.2} fill="hsl(var(--primary))" /></AreaChart></ResponsiveContainer></div></div>
          </div>
        </main>
      )}

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/50 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && setShowCreateModal(false)}>
          <div className="bg-card w-full max-w-md shadow-2xl border border-border animate-fade-scale-in p-7">
            {createType === 'log' ? (
               <>
                 <div className="flex items-center gap-3 mb-8"><div className="p-3 bg-emerald-50"><Timer size={20} className="text-emerald-500" /></div><h3 className="text-lg font-black uppercase tracking-tight">Log Working Hours</h3></div>
                 <div className="space-y-6"><div><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">Duration (Minutes)</label><div className="flex items-center gap-3"><input type="number" value={logDuration} onChange={e => setLogDuration(e.target.value)} className="flex-1 px-4 py-4 bg-secondary border border-border text-foreground outline-none font-bold" /><div className="bg-secondary px-4 py-4 border border-border font-bold text-xs">MINS</div></div></div><div><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">Internal Statement</label><textarea value={logDesc} onChange={e => setLogDesc(e.target.value)} className="w-full h-24 px-4 py-4 bg-secondary border border-border text-foreground outline-none font-bold resize-none" placeholder="Describe your activity..."></textarea></div><button onClick={handleCreateSubmit} disabled={creating} className="w-full py-4 bg-emerald-600 text-white font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 dark:shadow-emerald-900/20">{creating ? 'Processing...' : 'Secure Log Entry'}</button></div>
               </>
            ) : (
               <>
                 <div className="flex items-center gap-3 mb-8"><div className={`p-3 ${createType === 'sheet' ? 'bg-emerald-50' : createType === 'task' ? 'bg-purple-50' : 'bg-blue-50'}`}>{createType === 'sheet' ? <Table size={20} className="text-emerald-500" /> : createType === 'task' ? <Trello size={20} className="text-purple-500" /> : <FileText size={20} className="text-blue-500" />}</div><h3 className="text-lg font-black uppercase tracking-tight">New {createType === 'task' ? 'Kanban Task' : createType === 'sheet' ? 'Spreadsheet' : 'Document'}</h3></div>
                 <input ref={createInputRef} type="text" placeholder="Internal Asset Title..." value={createTitle} onChange={e => setCreateTitle(e.target.value)} className="w-full px-4 py-4 bg-secondary border border-border text-foreground outline-none mb-6 font-bold" />
                 <button disabled={creating || !createTitle.trim()} onClick={handleCreateSubmit} className={`w-full py-4 text-white font-black uppercase tracking-widest transition-all ${createType === 'task' ? 'bg-purple-600' : createType === 'sheet' ? 'bg-emerald-600' : 'bg-blue-600'}`}>{creating ? 'Syncing...' : 'Deploy Asset'}</button>
               </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
