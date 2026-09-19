'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Mail, ArrowRight, Sparkles, CheckCircle, Zap } from 'lucide-react';

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
        throw new Error('Invalid authentication credentials');
      }

      const data = await res.json();
      localStorage.setItem('talon_token', data.accessToken);
      localStorage.setItem('talon_email', data.email);
      localStorage.setItem('talon_role', data.role);
      localStorage.setItem('talon_empId', data.employeeId || '');

      router.push(data.role === 'HR_ADMIN' ? '/hr' : '/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication request failed');
    } finally {
      setLoading(false);
    }
  };

  const setPersona = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Demo@1234');
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-8 relative">
      {/* Dynamic Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-talonGold/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-talonCyan/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-surface/90 backdrop-blur-md border border-border rounded-2xl p-8 shadow-2xl relative overflow-hidden z-10">
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-talonGold via-talonCyan to-talonGold" />

        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-xl bg-talonGold/10 border border-talonGold/40 flex items-center justify-center text-talonGold shadow-lg shadow-talonGold/10">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-mono font-bold text-textPrimary tracking-tight">T.A.L.O.N.</h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-talonGold/20 text-talonGold font-bold border border-talonGold/30">
                AI 🦅
              </span>
            </div>
            <p className="text-xs text-textMuted font-mono">Defense-Grade Talent Network</p>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-talonRed/10 border border-talonRed/30 text-talonRed text-xs font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-talonRed animate-ping" />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase text-textMuted mb-1.5 font-semibold tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-textMuted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#06090F] border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-textPrimary focus:outline-none focus:border-talonGold font-mono transition-colors"
                placeholder="name@talon.ai"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-textMuted mb-1.5 font-semibold tracking-wider">
              Security Key / Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-textMuted" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#06090F] border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-textPrimary focus:outline-none focus:border-talonGold font-mono transition-colors"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-talonGold hover:bg-talonGold/90 text-black font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-talonGold/20 active:scale-[0.99] font-mono tracking-wide"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Authenticating Session...
              </span>
            ) : (
              <>
                <span>Access Intelligence Terminal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Fast Persona Chips */}
        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-[11px] font-mono uppercase text-textMuted mb-3 flex items-center gap-1.5 font-semibold tracking-wider">
            <Zap className="w-3.5 h-3.5 text-talonGold" /> Fast Login Demo Personas:
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setPersona('priya@talon.ai')}
              className={`p-3 rounded-xl border text-left text-xs transition-all ${
                email === 'priya@talon.ai'
                  ? 'bg-talonGold/10 border-talonGold text-textPrimary shadow-sm'
                  : 'bg-[#06090F] border-border hover:border-textMuted text-textMuted hover:text-textPrimary'
              }`}
            >
              <div className="font-semibold text-textPrimary flex items-center gap-1">
                Priya Raman
                {email === 'priya@talon.ai' && <CheckCircle className="w-3 h-3 text-talonGold ml-auto" />}
              </div>
              <div className="text-[10px] font-mono text-talonCyan mt-0.5">Support → DevOps</div>
            </button>

            <button
              type="button"
              onClick={() => setPersona('hr@talon.ai')}
              className={`p-3 rounded-xl border text-left text-xs transition-all ${
                email === 'hr@talon.ai'
                  ? 'bg-talonGold/10 border-talonGold text-textPrimary shadow-sm'
                  : 'bg-[#06090F] border-border hover:border-textMuted text-textMuted hover:text-textPrimary'
              }`}
            >
              <div className="font-semibold text-textPrimary flex items-center gap-1">
                HR Admin
                {email === 'hr@talon.ai' && <CheckCircle className="w-3 h-3 text-talonGold ml-auto" />}
              </div>
              <div className="text-[10px] font-mono text-talonGold mt-0.5">Workforce Radar</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}