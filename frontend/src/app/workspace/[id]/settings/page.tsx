'use client';

import { useQuery, useMutation, gql } from '@apollo/client';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, UserPlus, Shield, User, Trash2 } from 'lucide-react';
import { useState } from 'react';

const GET_MEMBERS = gql`
  query GetMembers($id: ID!) {
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
  }
`;

const UPDATE_ROLE = gql`
  mutation UpdateRole($workspaceId: ID!, $userId: ID!, $role: String!) {
    updateMemberRole(workspaceId: $workspaceId, userId: $userId, role: $role) {
      role
    }
  }
`;

const ADD_MEMBER = gql`
  mutation AddMember($workspaceId: ID!, $email: String!, $role: String) {
    addMember(workspaceId: $workspaceId, email: $email, role: $role) {
      id
    }
  }
`;

export default function WorkspaceSettings() {
  const { id } = useParams();
  const router = useRouter();
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const { data, loading, refetch } = useQuery(GET_MEMBERS, {
    variables: { id }
  });

  const [updateRole] = useMutation(UPDATE_ROLE);
  const [addMember] = useMutation(ADD_MEMBER);

  const isAdmin = data?.workspace?.currentUserRole === 'admin';

  const handleAddMember = async () => {
    if (!newMemberEmail) return;
    setErrorMessage('');
    try {
      await addMember({ 
        variables: { workspaceId: id, email: newMemberEmail, role: 'viewer' } 
      });
      setNewMemberEmail('');
      refetch();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error adding member');
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateRole({ variables: { workspaceId: id, userId, role: newRole } });
      refetch();
    } catch (err) {
      alert('Failed to update role');
    }
  };

  if (loading) return <div className="p-8 text-center text-sm font-bold uppercase tracking-widest animate-pulse mt-20">Refreshing Members...</div>;
  if (!isAdmin) return <div className="p-20 text-center font-bold text-destructive border border-destructive/20 bg-destructive/5 m-8">Unauthorized Access: Higher Clearance Required</div>;

  return (
    <div className="min-h-screen mesh-bg text-foreground">
      <header className="h-24 border-b border-border bg-card/40 backdrop-blur-xl sticky top-0 z-50 px-10">
        <div className="max-w-6xl mx-auto h-full flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => router.back()}
              className="p-3 bg-secondary/50 hover:bg-primary/10 border border-border/30 rounded-xl transition-all active:scale-95 group"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-1">Workspace Configuration</p>
              <h1 className="text-3xl font-black tracking-tighter text-foreground">{data?.workspace?.name || 'Loading Hub...'}</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2">
                <Shield size={14} className="text-emerald-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Security Clearance: Admin</span>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-12 space-y-16 animate-fade-in">
        
        {/* Add Member Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-muted-foreground/60 flex items-center gap-3">
              <UserPlus size={18} className="text-primary" />
              Recruit Collaborator
            </h2>
          </div>
          <div className="premium-card p-10 bg-gradient-to-br from-indigo-500/[0.03] to-purple-600/[0.03]">
            <div className="flex gap-4">
              <div className="flex-1 relative group">
                <input 
                  type="email" 
                  placeholder="Collaborator Email Address..." 
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="w-full pl-6 pr-4 py-4 bg-card border border-border rounded-xl focus:ring-4 ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/30 font-bold text-base"
                />
                {errorMessage && (
                  <p className="absolute -bottom-8 left-0 text-[10px] font-black text-rose-500 uppercase tracking-widest animate-shake">{errorMessage}</p>
                )}
              </div>
              <button 
                onClick={handleAddMember}
                disabled={!newMemberEmail}
                className="px-10 py-4 bg-primary text-white font-black uppercase tracking-widest rounded-xl shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 flex items-center gap-2 text-xs"
              >
                Launch Invite <ArrowLeft size={16} className="rotate-180" />
              </button>
            </div>
          </div>
        </section>

        {/* Member List */}
        <section className="space-y-8">
          <h2 className="text-xs font-black uppercase tracking-[0.4em] text-muted-foreground/60 flex items-center gap-3">
            <Shield size={18} className="text-primary" />
            Privilege Control Ledger
          </h2>
          <div className="premium-card overflow-hidden">
            <div className="divide-y divide-border/50">
              {data?.workspace?.members.map((member: any) => (
                <div key={member.user.id} className="flex items-center justify-between p-8 bg-card/30 hover:bg-primary/[0.02] transition-colors group">
                  <div className="flex items-center gap-6">
                    <div 
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl text-white font-black shadow-xl"
                      style={{ background: `hsl(${member.user.email.charCodeAt(0) * 8 % 360}, 65%, 55%)` }}
                    >
                      {member.user.email[0].toUpperCase()}
                    </div>
                    <div className="space-y-1">
                      <div className="font-black text-xl text-foreground tracking-tight">{member.user.email.split('@')[0]}</div>
                      <div className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">{member.user.email}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <select 
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.user.id, e.target.value)}
                        className="appearance-none px-6 py-3 bg-secondary border border-border text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary/20 transition-all rounded-xl pr-12 cursor-pointer hover:border-primary"
                      >
                        <option value="admin">Admin</option>
                        <option value="editor">Editor</option>
                        <option value="viewer">Viewer</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                        <ArrowLeft size={12} className="-rotate-90" />
                      </div>
                    </div>
                    <button className="p-3 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/5 transition-all rounded-xl border border-transparent hover:border-rose-500/10">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="pt-12 border-t border-border">
           <div className="p-10 bg-rose-500/5 border border-rose-500/20 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-2 text-center md:text-left">
                 <h3 className="text-xl font-black text-rose-600 dark:text-rose-400 uppercase tracking-tight">Decommission Hub</h3>
                 <p className="text-sm text-muted-foreground font-medium max-w-md leading-relaxed">Permanently purge this workspace and all associated strategic assets. This action is immutable.</p>
              </div>
              <button className="px-8 py-4 bg-rose-500 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-xl shadow-rose-500/20 hover:scale-105 active:scale-95 transition-all whitespace-nowrap">
                 Destroy Workspace
              </button>
           </div>
        </section>
      </main>
    </div>
  );
}
