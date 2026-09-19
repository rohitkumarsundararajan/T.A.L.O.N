'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Cpu, TrendingUp, Sliders, Zap, CheckCircle2, RefreshCw } from 'lucide-react';

const SKILL_OPTIONS = [
  { id: 18, name: 'Kubernetes Orchestration', category: 'Cloud & DevOps' },
  { id: 10, name: 'Cloud Architecture & AWS', category: 'Cloud & DevOps' },
  { id: 3, name: 'Python Data Pipeline', category: 'Data & AI' },
  { id: 12, name: 'PostgreSQL & pgvector', category: 'Backend' },
];

export default function WhatIfPage() {
  const [selectedSkill, setSelectedSkill] = useState<any>(SKILL_OPTIONS[0]);
  const [level, setLevel] = useState<number>(3);
  const [results, setResults] = useState<any[]>([]);
  const [simulating, setSimulating] = useState<boolean>(false);

  const runSimulation = async (skillId: number, targetLevel: number) => {
    setSimulating(true);
    try {
      const res = await apiFetch('/api/v1/me/whatif', {
        method: 'POST',
        body: JSON.stringify({
          addSkills: [{ skillId: skillId, level: targetLevel }],
        }),
      });
      if (res.ok) {
        setResults(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSimulating(false);
    }
  };

  useEffect(() => {
    runSimulation(selectedSkill.id, level);
  }, [selectedSkill, level]);

  return (
    <div className="space-y-8">
      {/* Cockpit Header */}
      <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 space-y-2 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-talonGold/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-2 text-xs font-mono text-talonGold font-bold">
          <Zap className="w-4 h-4" /> IN-MEMORY GRAPH COMPUTATION ENGINE
        </div>
        <h1 className="text-3xl font-bold text-textPrimary tracking-tight flex items-center gap-3">
          <Cpu className="w-8 h-8 text-talonGold" /> Real-Time Career Simulator
        </h1>
        <p className="text-xs text-textMuted font-mono">
          Sub-150ms In-Memory Vector & Adjacency Re-scoring • Zero Database Mutations • Instant Skill Impact Analysis
        </p>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        {/* Simulation Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 rounded-2xl bg-[#06090F] border border-border">
          {/* Skill Selector */}
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase text-talonGold font-bold flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" /> 1. Select Hypothetical Skill Acquisition
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SKILL_OPTIONS.map((sk) => (
                <button
                  key={sk.id}
                  type="button"
                  onClick={() => setSelectedSkill(sk)}
                  className={`p-3 rounded-xl border text-left text-xs font-mono transition-all ${
                    selectedSkill.id === sk.id
                      ? 'bg-talonGold/10 border-talonGold text-textPrimary font-bold shadow-sm'
                      : 'bg-surface border-border text-textMuted hover:text-textPrimary hover:border-border'
                  }`}
                >
                  <div className="text-textPrimary font-semibold">{sk.name}</div>
                  <div className="text-[10px] text-talonCyan mt-0.5">{sk.category}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Level Selector */}
          <div className="space-y-3 flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono uppercase text-talonGold font-bold flex items-center gap-1.5 mb-2">
                <Zap className="w-3.5 h-3.5" /> 2. Target Proficiency Level
              </span>
              <p className="text-xs text-textMuted font-sans mb-3">
                Simulate acquiring <strong className="text-textPrimary">{selectedSkill.name}</strong> at level 1 to 5.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setLevel(lvl)}
                  className={`flex-1 py-3 rounded-xl font-mono font-bold text-sm transition-all ${
                    level === lvl
                      ? 'bg-talonGold text-black scale-105 shadow-lg shadow-talonGold/20'
                      : 'bg-surface border border-border text-textMuted hover:text-textPrimary'
                  }`}
                >
                  L{lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono uppercase text-textMuted font-bold tracking-wider">
              Simulated Role Impact Matrix
            </h2>
            {simulating && (
              <span className="text-xs font-mono text-talonGold flex items-center gap-1.5 animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Recalculating Graph...
              </span>
            )}
          </div>

          <div className="overflow-x-auto rounded-xl border border-border bg-[#06090F]">
            <table className="w-full text-left text-sm font-mono">
              <thead className="border-b border-border text-xs text-textMuted uppercase bg-surface/50">
                <tr>
                  <th className="p-4 font-semibold">Target Role</th>
                  <th className="p-4 font-semibold text-right">Baseline Match</th>
                  <th className="p-4 font-semibold text-right">Simulated Match</th>
                  <th className="p-4 font-semibold text-right">Instant Delta (+%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {results.map((r) => {
                  const hasJump = r.delta > 0;
                  const currentPct = Math.round(r.currentScore * 100);
                  const newPct = Math.round(r.newScore * 100);
                  return (
                    <tr key={r.roleId} className="hover:bg-surface/40 transition-colors">
                      <td className="p-4 font-semibold text-textPrimary font-sans">{r.title}</td>
                      <td className="p-4 text-right text-textMuted font-mono">{currentPct}%</td>
                      <td className="p-4 text-right font-bold text-talonGold font-mono text-base">
                        {newPct}%
                      </td>
                      <td className="p-4 text-right">
                        {hasJump ? (
                          <span className="px-3 py-1 rounded-lg bg-talonGreen/10 text-talonGreen border border-talonGreen/30 font-bold inline-flex items-center gap-1 text-xs">
                            <TrendingUp className="w-3.5 h-3.5" /> +{(r.delta * 100).toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-textMuted/40 text-xs">—</span>
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
    </div>
  );
}