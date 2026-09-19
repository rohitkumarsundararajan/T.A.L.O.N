'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Shield, AlertTriangle, Users, Layers, Activity } from 'lucide-react';

export default function HrRadarPage() {
  const [busFactor, setBusFactor] = useState<any[]>([]);
  const [heatmap, setHeatmap] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch('/api/v1/hr/bus-factor').then((r) => (r.ok ? r.json() : [])),
      apiFetch('/api/v1/hr/heatmap').then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([bfData, hmData]) => {
        setBusFactor(bfData || []);
        setHeatmap(hmData);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 space-y-2 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-talonCyan/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-2 text-xs font-mono text-talonCyan font-bold">
          <Shield className="w-4 h-4" /> HR ADMIN WORKFORCE RADAR
        </div>
        <h1 className="text-3xl font-bold text-textPrimary tracking-tight">Workforce Defense & Vulnerability Radar</h1>
        <p className="text-xs text-textMuted font-mono">
          Single-point-of-failure detection (Bus Factor ≤ 2 holders) & Department-wide capability density heatmaps.
        </p>
      </div>

      {/* Critical Bus-Factor Risk Section */}
      <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 space-y-5 shadow-xl">
        <div className="border-b border-border pb-4">
          <h2 className="text-lg font-mono font-bold text-talonRed flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> Critical Bus-Factor Vulnerabilities (≤ 2 Proficient Holders)
          </h2>
          <p className="text-xs text-textMuted">Skills essential to open role demands held by 2 or fewer employees at Level 3+</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {busFactor.map((b: any) => (
            <div
              key={b.skill_id}
              className="p-4 rounded-xl bg-talonRed/5 border border-talonRed/30 space-y-2 hover:border-talonRed transition-all shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-textPrimary">{b.name}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-talonRed/20 text-talonRed font-extrabold border border-talonRed/40">
                  FRAGILE ({b.proficient_holders} {b.proficient_holders === 1 ? 'HOLDER' : 'HOLDERS'})
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono text-textMuted pt-1">
                <span>Category: {b.category}</span>
                <span className="text-talonGold font-semibold">{b.open_role_demand} Open Roles</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Capability Heatmap Section */}
      {heatmap && (
        <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 space-y-5 shadow-xl">
          <div className="border-b border-border pb-4">
            <h2 className="text-lg font-mono font-bold text-textPrimary flex items-center gap-2">
              <Layers className="w-5 h-5 text-talonGold" /> Department × Skill Category Density Heatmap
            </h2>
            <p className="text-xs text-textMuted">Average proficiency level (1-5) across organizational units</p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border bg-[#06090F]">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="text-left border-b border-border text-textMuted bg-surface/50">
                  <th className="p-4 font-bold">Department</th>
                  {heatmap.categories?.map((cat: string) => (
                    <th key={cat} className="p-4 text-center font-bold">{cat}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {heatmap.departments?.map((dept: string) => (
                  <tr key={dept} className="hover:bg-surface/30 transition-colors">
                    <td className="p-4 font-bold text-textPrimary font-sans text-sm">{dept}</td>
                    {heatmap.categories?.map((cat: string) => {
                      const cell = heatmap.cells?.find((c: any) => c.department === dept && c.category === cat);
                      const level = cell ? cell.avg_level : 0;
                      return (
                        <td key={cat} className="p-4 text-center">
                          <span
                            className={`inline-block px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                              level >= 3.5
                                ? 'bg-talonGreen/20 text-talonGreen border border-talonGreen/40 shadow-sm'
                                : level >= 2.0
                                ? 'bg-talonGold/20 text-talonGold border border-talonGold/40'
                                : level > 0
                                ? 'bg-talonCyan/10 text-talonCyan border border-talonCyan/20'
                                : 'text-textMuted/20'
                            }`}
                          >
                            {level > 0 ? `${level}` : '—'}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}