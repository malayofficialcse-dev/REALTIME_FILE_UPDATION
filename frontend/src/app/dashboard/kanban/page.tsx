'use client';

import { useQuery, useMutation, gql } from '@apollo/client';
import { 
  Layers, Plus, MoreVertical, GripVertical, 
  ChevronRight, Sparkles, Filter, Search,
  AlertCircle, CheckCircle2, Clock, Zap
} from 'lucide-react';
import { useState, useEffect } from 'react';

const GET_WORKSPACES = gql`
  query GetWorkspaces {
    workspaces {
      id
      name
    }
  }
`;

const GET_TASKS = gql`
  query GetTasks($workspaceId: ID!) {
    getTasks(workspaceId: $workspaceId) {
      id
      title
      description
      status
      priority
      assignee {
        id
        email
      }
    }
  }
`;

const UPDATE_TASK = gql`
  mutation UpdateTask($id: ID!, $status: String, $priority: String) {
    updateTask(id: $id, status: $status, priority: $priority) {
      id
      status
      priority
    }
  }
`;

const CREATE_TASK = gql`
  mutation CreateTask($workspaceId: ID!, $title: String!, $status: String, $priority: String) {
    createTask(workspaceId: $workspaceId, title: $title, status: $status, priority: $priority) {
      id
      title
    }
  }
`;

const STATUSES = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];
const PRIORITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

const PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: 'bg-rose-500 text-white border-rose-600 shadow-rose-500/20',
  HIGH: 'bg-amber-500 text-white border-amber-600 shadow-amber-500/20',
  MEDIUM: 'bg-indigo-500 text-white border-indigo-600 shadow-indigo-500/20',
  LOW: 'bg-emerald-500 text-white border-emerald-600 shadow-emerald-500/20',
};

export default function KanbanMatrixPage() {
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const { data: wsData } = useQuery(GET_WORKSPACES);
  const { data: taskData, refetch } = useQuery(GET_TASKS, {
    variables: { workspaceId: selectedWorkspaceId },
    skip: !selectedWorkspaceId
  });

  const [updateTask] = useMutation(UPDATE_TASK);
  const [createTask] = useMutation(CREATE_TASK);

  useEffect(() => {
    if (wsData?.workspaces?.length > 0 && !selectedWorkspaceId) {
      setSelectedWorkspaceId(wsData.workspaces[0].id);
    }
  }, [wsData, selectedWorkspaceId]);

  const handleDragStart = (id: string) => {
    setDraggedTaskId(id);
  };

  const handleDrop = async (status: string, priority: string) => {
    if (!draggedTaskId) return;
    try {
      await updateTask({
        variables: { id: draggedTaskId, status, priority },
        optimisticResponse: {
          updateTask: {
            id: draggedTaskId,
            status,
            priority,
            __typename: 'Task'
          }
        }
      });
      setDraggedTaskId(null);
      refetch();
    } catch (err) {
      console.error('Failed to move task:', err);
    }
  };

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim() || !selectedWorkspaceId) return;
    try {
      await createTask({
        variables: { 
          workspaceId: selectedWorkspaceId, 
          title: newTaskTitle,
          status: 'TODO',
          priority: 'MEDIUM'
        }
      });
      setNewTaskTitle('');
      setIsCreating(false);
      refetch();
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const tasks = taskData?.getTasks || [];

  return (
    <div className="p-8 lg:p-12 animate-fade-in flex flex-col h-full overflow-hidden">
      <div className="max-w-full mx-auto w-full space-y-10 flex flex-col h-full">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0">
          <div className="space-y-2">
            <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-foreground">
              Strategic <span className="gradient-text">Matrix</span>
            </h1>
            <div className="flex items-center gap-4">
               <div className="relative">
                  <select 
                    value={selectedWorkspaceId || ''}
                    onChange={(e) => setSelectedWorkspaceId(e.target.value)}
                    className="appearance-none pl-10 pr-12 py-2.5 bg-card border border-border rounded-xl text-xs font-black uppercase tracking-widest outline-none focus:ring-4 ring-primary/10 transition-all cursor-pointer"
                  >
                    {wsData?.workspaces?.map((ws: any) => (
                      <option key={ws.id} value={ws.id}>{ws.name}</option>
                    ))}
                  </select>
                  <Layers size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                  <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground rotate-90" />
               </div>
               <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest hidden sm:block">
                 Active Nodes: {tasks.length}
               </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="flex items-center p-1 bg-secondary rounded-xl border border-border">
                <button className="p-2.5 bg-card border border-border text-foreground rounded-lg shadow-sm"><Layers size={18} /></button>
                <button className="p-2.5 text-muted-foreground hover:text-foreground transition-colors"><Filter size={18} /></button>
             </div>
             <button 
               onClick={() => setIsCreating(true)}
               className="flex items-center gap-2 px-6 py-3.5 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
             >
               <Plus size={18} className="stroke-[3]" /> Add Mission
             </button>
          </div>
        </div>

        {/* Strategic Matrix Table */}
        <div className="flex-1 overflow-auto custom-scrollbar -mx-4 px-4 pb-8">
          <div className="min-w-max">
            <table className="w-full border-separate border-spacing-4">
              <thead>
                <tr>
                  <th className="w-48"></th>
                  {STATUSES.map(status => (
                    <th key={status} className="px-6 py-4">
                      <div className="flex items-center gap-3 justify-center">
                        <div className={`w-2 h-2 rounded-full ${status === 'DONE' ? 'bg-emerald-500 shadow-glow-emerald' : status === 'TODO' ? 'bg-slate-500' : 'bg-primary shadow-glow'}`} />
                        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground">{status.replace('_', ' ')}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PRIORITIES.map(priority => (
                  <tr key={priority}>
                    <td className="pr-6 align-top pt-4">
                       <div className="flex items-center gap-3 p-4 bg-secondary/50 border border-border rounded-2xl">
                          <AlertCircle size={18} className={priority === 'CRITICAL' ? 'text-rose-500' : priority === 'HIGH' ? 'text-amber-500' : 'text-indigo-500'} />
                          <span className="text-[10px] font-black uppercase tracking-widest text-foreground">{priority}</span>
                       </div>
                    </td>
                    
                    {STATUSES.map(status => {
                      const cellTasks = tasks.filter((t: any) => t.status === status && t.priority === priority);
                      
                      return (
                        <td 
                          key={`${status}-${priority}`}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={() => handleDrop(status, priority)}
                          className={`min-w-[280px] min-h-[180px] p-4 bg-card/40 border-2 border-dashed border-border/30 rounded-3xl transition-all hover:border-primary/20 hover:bg-primary/[0.02] flex flex-col gap-4 align-top`}
                        >
                          {cellTasks.map((task: any) => (
                            <div 
                              key={task.id}
                              draggable
                              onDragStart={() => handleDragStart(task.id)}
                              className="bg-card border border-border p-5 rounded-2xl shadow-sm hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all group relative cursor-grab active:cursor-grabbing"
                            >
                               <div className="flex items-start justify-between gap-3 mb-3">
                                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${PRIORITY_COLORS[task.priority].split(' ')[0]}`} />
                                  <h4 className="flex-1 text-sm font-black text-foreground uppercase tracking-tight leading-tight">{task.title}</h4>
                                  <button className="text-muted-foreground opacity-20 group-hover:opacity-100 transition-opacity"><MoreVertical size={14} /></button>
                               </div>
                               
                               <div className="flex items-center justify-between pt-4 border-t border-border/50">
                                  <div className="flex items-center gap-2">
                                     <div className="w-7 h-7 bg-secondary rounded-lg flex items-center justify-center text-[9px] font-black border border-border">
                                        {task.assignee?.email[0].toUpperCase() || '?'}
                                     </div>
                                     <span className="text-[9px] font-bold text-muted-foreground uppercase">{task.assignee?.email.split('@')[0] || 'Unassigned'}</span>
                                  </div>
                                  <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-40">
                                     {status === 'DONE' ? <CheckCircle2 size={12} className="text-emerald-500" /> : <Clock size={12} />}
                                  </div>
                               </div>

                               <GripVertical size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground opacity-0 group-hover:opacity-10 transition-opacity" />
                            </div>
                          ))}
                          
                          {cellTasks.length === 0 && (
                            <div className="flex-1 flex items-center justify-center min-h-[100px] opacity-10">
                               <Sparkles size={24} />
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Quick Add Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-card w-full max-w-md shadow-2xl border border-border animate-fade-scale-in p-8 space-y-8">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-primary/10 text-primary rounded-xl"><Zap size={20} /></div>
               <div>
                  <h3 className="text-xl font-black text-foreground">New Strategic Mission</h3>
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Workspace: {wsData?.workspaces?.find((w: any) => w.id === selectedWorkspaceId)?.name}</p>
               </div>
            </div>
            
            <input 
              autoFocus
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateTask()}
              placeholder="Deploy asset v4..."
              className="w-full px-5 py-4 bg-secondary border border-border rounded-xl text-foreground font-black uppercase outline-none focus:ring-4 ring-primary/10 focus:border-primary transition-all"
            />
            
            <div className="flex gap-4">
               <button onClick={() => setIsCreating(false)} className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground hover:bg-secondary rounded-xl transition-all">Abort</button>
               <button 
                  onClick={handleCreateTask}
                  disabled={!newTaskTitle.trim()}
                  className="flex-1 py-4 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
               >
                 Authorize Mission
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
