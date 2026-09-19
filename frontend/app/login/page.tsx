'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('priya@talon.ai');
  const [password, setPassword] = useState('Demo@1234');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        throw new Error('Invalid email or password');
      }

      const data = await res.json();
      localStorage.setItem('talon_token', data.accessToken);
      localStorage.setItem('talon_email', data.email);
      localStorage.setItem('talon_role', data.role);
      localStorage.setItem('talon_empId', data.employeeId || '');

      router.push(data.role === 'HR_ADMIN' ? '/hr' : '/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const setPersona = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Demo@1234');
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md bg-surface border border-border rounded-xl p-8 shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-talonGold/10 rounded-full blur-2xl" />

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-talonGold/10 border border-talonGold/40 flex items-center justify-center text-talonGold">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-mono font-bold text-textPrimary tracking-tight">T.A.L.O.N. AI</h1>
            <p className="text-xs text-textMuted font-mono">Defense-Grade Talent Network</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-talonRed/10 border border-talonRed/30 text-talonRed text-xs font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase text-textMuted mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-textMuted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0A0E14] border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-textPrimary focus:outline-none focus:border-talonGold font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-textMuted mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-textMuted" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0A0E14] border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-textPrimary focus:outline-none focus:border-talonGold font-mono"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-talonGold hover:bg-talonGold/90 text-black font-semibold text-sm flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
          >
            {loading ? 'Authenticating...' : 'Access Intelligence Terminal'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Persona Fast-Chips */}
        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-xs font-mono uppercase text-textMuted mb-3 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-talonGold" /> Fast Login as Demo Persona:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setPersona('priya@talon.ai')}
              className={p-2 rounded border text-left text-xs transition-colors }
            >
              <div className="font-semibold">Priya Raman</div>
              <div className="text-[10px] opacity-75">Support $\rightarrow$ DevOps</div>
            </button>

            <button
              onClick={() => setPersona('hr@talon.ai')}
              className={p-2 rounded border text-left text-xs transition-colors }
            >
              <div className="font-semibold">HR Admin</div>
              <div className="text-[10px] opacity-75">Workforce Radar</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}