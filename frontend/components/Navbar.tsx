'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Shield, Crosshair, Map, Activity, LogOut, Cpu, User } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);
  const [latency, setLatency] = useState<number | null>(42);

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
    <header className="border-b border-border bg-[#0A0E14]/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-lg bg-talonGold/10 border border-talonGold/40 flex items-center justify-center text-talonGold group-hover:scale-105 transition-transform">
            <Shield className="w-5 h-5 text-talonGold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold tracking-wider text-textPrimary text-lg">T.A.L.O.N.</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-talonGold/20 text-talonGold font-mono font-semibold">AI 🦅</span>
            </div>
            <p className="text-[11px] text-textMuted tracking-tight">Latent Opportunity Network</p>
          </div>
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  active
                    ? 'bg-surface text-talonGold border border-border'
                    : 'text-textMuted hover:text-textPrimary hover:bg-surface/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-talonGold' : ''}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          {latency !== null && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface border border-border text-[11px] font-mono text-talonCyan">
              <Activity className="w-3.5 h-3.5 animate-pulse text-talonCyan" />
              <span>api {latency}ms</span>
            </div>
          )}

          {user && (
            <div className="flex items-center gap-3 pl-3 border-l border-border">
              <div className="text-right">
                <p className="text-xs font-medium text-textPrimary">{user.email}</p>
                <p className="text-[10px] font-mono text-talonGold uppercase tracking-wider">{user.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded hover:bg-surface border border-transparent hover:border-border text-textMuted hover:text-talonRed transition-colors"
                title="Logout"
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