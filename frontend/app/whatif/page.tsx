'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Cpu, TrendingUp, Sliders } from 'lucide-react';

export default function WhatIfPage() {
  const [level, setLevel] = useState<number>(3);
  const [results, setResults] = useState<any[]>([]);

  const runSimulation = async (targetLevel: number) => {
    try {
      const res = await apiFetch('/api/v1/me/whatif', {
        method: 'POST',
        body: JSON.stringify({
          addSkills: [{ skillId: 18, level: targetLevel }],
        }),
      });
      if (res.ok) {
        setResults(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    runSimulation(level);
  }, [level]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-textPrimary flex items-center gap-2">
          <Cpu className="w-6 h-6 text-talonGold" /> Real-Time Career Simulator
        </h1>
        <p className="text-xs text-textMuted font-mono">
          Sub-150ms In-Memory Simulation • Zero Database Writes • Pure Graph Computation
        </p>
      </div>

      <div className="bg-surface border border-border rounded-xl p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg bg-[#0A0E14] border border-border">
          <div>
            <span className="text-xs font-mono uppercase text-talonGold font-semibold flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" /> Simulated Acquisition
            </span>
            <h3 className="text-lg font-bold text-textPrimary">Kubernetes Orchestration</h3>
            <p className="text-xs text-textMuted">Simulate closing the primary gap for DevOps and Cloud roles.</p>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm font-mono text-textMuted">Proficiency Level:</span>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setLevel(lvl)}
                  className={`w-9 h-9 rounded-lg font-mono font-bold text-sm transition-all ${
                    level === lvl
                      ? 'bg-talonGold text-black scale-105'
                      : 'bg-surface border border-border text-textMuted hover:text-textPrimary'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm font-mono">
            <thead className="border-b border-border text-xs text-textMuted uppercase">
              <tr>
                <th className="pb-3">Role Target</th>
                <th className="pb-3 text-right">Current Score</th>
                <th className="pb-3 text-right">Simulated Score</th>
                <th className="pb-3 text-right">Instant Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {results.map((r) => {
                const hasJump = r.delta > 0;
                return (
                  <tr key={r.roleId} className="hover:bg-[#0A0E14]/50">
                    <td className="py-3 font-semibold text-textPrimary">{r.title}</td>
                    <td className="py-3 text-right text-textMuted">{Math.round(r.currentScore * 100)}%</td>
                    <td className="py-3 text-right font-bold text-talonGold">{Math.round(r.newScore * 100)}%</td>
                    <td className="py-3 text-right">
                      {hasJump ? (
                        <span className="px-2 py-1 rounded bg-talonGreen/10 text-talonGreen border border-talonGreen/30 font-bold inline-flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" /> +{(r.delta * 100).toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-textMuted/40">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}