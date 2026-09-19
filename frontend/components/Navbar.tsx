'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Shield, Crosshair, Map, Activity, LogOut, Cpu, User, Sparkles } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);
  const [latency, setLatency] = useState<number | null>(38);

  useEffect(() => {
    const email = localStorage.getItem('talon_email');
    const role = localStorage.getItem('talon_role');
    if (email) setUser({ email, role: role || 'EMPLOYEE' });

    const handleLatency = (e: any) => setLatency(e.detail);
    window.addEventListener('talon-latency', handleLatency);
    return () => window.removeEventListener('talon-latency', handleLatency);
  }, [pathname]);

  if (pathname === '/login') return null;

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  const navItems = [
    { label: 'Living Profile', href: '/dashboard', icon: User },
    { label: 'Role Matches', href: '/matches', icon: Crosshair },
    { label: 'What-If Simulator', href: '/whatif', icon: Cpu },
    { label: 'Career Roadmap', href: '/roadmap', icon: Map },
  ];

  if (user?.role === 'HR_ADMIN') {
    navItems.push({ label: 'HR Radar', href: '/hr', icon: Shield });
  }

  return (
    <header className="border-b border-border/80 bg-[#06090F]/90 backdrop-blur-md sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-3 group shrink-0">
          <div className="w-10 h-10 rounded-xl bg-talonGold/10 border border-talonGold/40 flex items-center justify-center text-talonGold group-hover:scale-105 group-hover:border-talonGold transition-all shadow-md shadow-talonGold/5">
            <Shield className="w-5 h-5 text-talonGold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-extrabold tracking-wider text-textPrimary text-lg">T.A.L.O.N.</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-talonGold/20 text-talonGold font-mono font-bold border border-talonGold/30">
                AI 🦅
              </span>
            </div>
            <p className="text-[10px] text-textMuted font-mono tracking-tight">Latent Opportunity Network</p>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="hidden md:flex items-center gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-all ${
                  active
                    ? 'bg-surface text-talonGold border border-talonGold/40 shadow-sm shadow-talonGold/10'
                    : 'text-textMuted hover:text-textPrimary hover:bg-surface/60 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-talonGold' : 'text-textMuted'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Status Pill & User Menu */}
        <div className="flex items-center gap-3 shrink-0">
          {latency !== null && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface/80 border border-border text-[11px] font-mono text-talonCyan">
              <Activity className="w-3.5 h-3.5 animate-pulse text-talonCyan" />
              <span>{latency}ms</span>
            </div>
          )}

          {user && (
            <div className="flex items-center gap-3 pl-3 border-l border-border">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-textPrimary">{user.email}</p>
                <span className="inline-block text-[9px] font-mono text-talonGold uppercase tracking-wider px-1.5 py-0.2 rounded bg-talonGold/10 border border-talonGold/20 font-bold">
                  {user.role}
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="p-2 rounded-xl bg-surface/50 border border-border hover:border-talonRed/40 text-textMuted hover:text-talonRed hover:bg-talonRed/10 transition-all"
                title="Logout Session"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}