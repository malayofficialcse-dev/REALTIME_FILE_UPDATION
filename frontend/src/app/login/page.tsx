'use client';

import { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, ShieldCheck, Zap, Globe } from 'lucide-react';
import Image from 'next/image';

const REGISTER = gql`
  mutation Register($email: String!, $password: String!) {
    register(email: $email, password: $password) {
      token
    }
  }
`;

const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
    }
  }
`;

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const [register] = useMutation(REGISTER);
  const [login] = useMutation(LOGIN);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        const { data } = await login({ variables: { email, password } });
        localStorage.setItem('token', data.login.token);
      } else {
        const { data } = await register({ variables: { email, password } });
        localStorage.setItem('token', data.register.token);
      }
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    }
  };

  return (
    <div className="min-h-screen flex bg-background relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full -mr-64 -mt-64 blur-3xl opacity-50" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/10 rounded-full -ml-64 -mb-64 blur-3xl opacity-50" />

      {/* Left Branding Panel (Hidden on Mobile) */}
      <div className="hidden lg:flex flex-1 bg-primary relative items-center justify-center p-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10 font-black text-[20vw] leading-none pointer-events-none select-none tracking-tighter text-white">
          PROSYNC
        </div>
        <div className="relative z-10 space-y-12">
           <div className="flex items-center gap-3">
             <Image src="/logo.png" alt="ProSync Logo" width={60} height={60} className="h-auto invert brightness-0" />
             <span className="text-4xl font-black tracking-tighter text-white">ProSync</span>
           </div>
           
           <div className="space-y-6">
              <div className="flex items-center gap-4 group">
                 <div className="w-10 h-10 bg-white/10 flex items-center justify-center rounded-[3px] group-hover:bg-accent transition-all">
                    <ShieldCheck className="text-white" size={20} />
                 </div>
                 <div className="text-white">
                    <h4 className="font-bold text-lg">Enterprise Security</h4>
                    <p className="text-sm opacity-60">Military-grade protection for your data.</p>
                 </div>
              </div>
              <div className="flex items-center gap-4 group">
                 <div className="w-10 h-10 bg-white/10 flex items-center justify-center rounded-[3px] group-hover:bg-accent transition-all">
                    <Zap className="text-white" size={20} />
                 </div>
                 <div className="text-white">
                    <h4 className="font-bold text-lg">Real-Time Sync</h4>
                    <p className="text-sm opacity-60">Collaboration without boundaries.</p>
                 </div>
              </div>
              <div className="flex items-center gap-4 group">
                 <div className="w-10 h-10 bg-white/10 flex items-center justify-center rounded-[3px] group-hover:bg-accent transition-all">
                    <Globe className="text-white" size={20} />
                 </div>
                 <div className="text-white">
                    <h4 className="font-bold text-lg">Global High Availability</h4>
                    <p className="text-sm opacity-60">Access your work from anywhere.</p>
                 </div>
              </div>
           </div>
        </div>
        <div className="absolute bottom-10 left-10 text-[10px] uppercase font-bold tracking-[0.4em] text-white opacity-40">
           ProSync v4.0.2 Platform Early Access
        </div>
      </div>

      {/* Auth Panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background z-10">
        <div className="w-full max-w-md space-y-10">
          <div className="text-center lg:text-left">
            <h2 className="text-4xl font-black text-primary tracking-tight">
              {isLogin ? 'Welcome Back' : 'Create Space'}
            </h2>
            <p className="text-muted-foreground mt-3 text-lg font-medium">
              {isLogin ? 'Sign in to your professional workspace' : 'Join the next generation of collaboration'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 text-xs font-bold uppercase tracking-widest text-destructive bg-destructive/10 border border-destructive/20 rounded-[3px] shadow-sm animate-in slide-in-from-top-2 duration-300">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  placeholder="Official Email Address"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-card border border-border focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium text-lg rounded-[3px] shadow-sm"
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="password"
                  placeholder="Master Password"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-card border border-border focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium text-lg rounded-[3px] shadow-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full group py-4 bg-primary text-primary-foreground font-black text-lg uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-3 rounded-[3px] shadow-xl"
            >
              {isLogin ? 'Sign Into ProSync' : 'Create Professional Account'}
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <p className="text-center text-sm font-bold uppercase tracking-widest text-muted-foreground">
            {isLogin ? "Don't have an enterprise account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:underline underline-offset-4 decoration-primary decoration-2 transition-all"
            >
              {isLogin ? 'Sign Up Now' : 'Sign In Now'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
