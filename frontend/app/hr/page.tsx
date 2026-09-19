'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Shield, AlertTriangle } from 'lucide-react';

export default function HrRadarPage() {
  const [busFactor, setBusFactor] = useState<any[]>([]);
  const [heatmap, setHeatmap] = useState<any | null>(null);

  useEffect(() => {
    apiFetch('/api/v1/hr/bus-factor')
      .then((r) => (r.ok ? r.json() : []))
      .then(setBusFactor);

    apiFetch('/api/v1/hr/heatmap')
      .then((r) => (r.ok ? r.json() : null))
      .then(setHeatmap);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-textPrimary flex items-center gap-2">
          <Shield className="w-6 h-6 text-talonCyan" /> HR Workforce Defense Radar
        </h1>
        <p className="text-xs text-textMuted font-mono">Organizational Capability Heatmaps & Fragility Detection</p>
      </div>

      <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
        <h2 className="text-base font-mono font-semibold text-talonRed flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> Critical Bus-Factor Risks (≤ 2 Proficient Holders)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {busFactor.map((b: any) => (
            <div key={b.skill_id} className="p-3.5 rounded-lg bg-talonRed/5 border border-talonRed/30 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-textPrimary">{b.name}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-talonRed/20 text-talonRed font-bold">
                  FRAGILE ({b.proficient_holders} HOLDERS)
                </span>
              </div>
              <p className="text-xs text-textMuted font-mono">Active Demand: {b.open_role_demand} Open Roles</p>
            </div>
          ))}
        </div>
      </div>

      {heatmap && (
        <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <h2 className="text-base font-mono font-semibold text-textPrimary">Department × Skill Category Density</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="text-left border-b border-border text-textMuted">
                  <th className="pb-3">Department</th>
                  {heatmap.categories?.map((cat: string) => (
                    <th key={cat} className="pb-3 text-center">{cat}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {heatmap.departments?.map((dept: string) => (
                  <tr key={dept} className="hover:bg-[#0A0E14]/40">
                    <td className="py-3 font-semibold text-textPrimary">{dept}</td>
                    {heatmap.categories?.map((cat: string) => {
                      const cell = heatmap.cells?.find((c: any) => c.department === dept && c.category === cat);
                      const level = cell ? cell.avg_level : 0;
                      return (
                        <td key={cat} className="py-3 text-center">
                          <span
                            className={`px-2 py-1 rounded font-bold ${
                              level >= 3
                                ? 'bg-talonGreen/20 text-talonGreen'
                                : level > 0
                                ? 'bg-talonGold/10 text-talonGold'
                                : 'text-textMuted/30'
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