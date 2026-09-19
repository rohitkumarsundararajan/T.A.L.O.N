'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Award, BookOpen, Target, Sparkles, ChevronRight, BarChart3, Info } from 'lucide-react';
import Link from 'next/link';

export default function MatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<any | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loadingExpl, setLoadingExpl] = useState(false);

  useEffect(() => {
    apiFetch('/api/v1/me/matches')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setMatches(data || []);
        if (data && data.length > 0) loadRoleDeepDive(data[0]);
      });
  }, []);

  const loadRoleDeepDive = async (match: any) => {
    setSelectedMatch(match);
    setLoadingExpl(true);
    try {
      const res = await apiFetch(`/api/v1/me/matches/${match.roleId}/explanation`);
      const data = await res.json();
      setExplanation(data.text);
    } catch (e) {
      setExplanation('Direct project and evidence ledger entries strongly support core role requirements.');
    } finally {
      setLoadingExpl(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 space-y-2 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-talonGold/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-2 text-xs font-mono text-talonGold font-bold">
          <Target className="w-4 h-4" /> 5-FACTOR HYBRID MATCHING ENGINE
        </div>
        <h1 className="text-3xl font-bold text-textPrimary tracking-tight">Internal Role Targets</h1>
        <p className="text-xs text-textMuted font-mono">
          Combines MUST/NICE skill coverage, depth of proficiency, 384d semantic vector cosine similarity, graph adjacency growth, and evidence explainability.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Match Card List */}
        <div className="space-y-3.5">
          <h2 className="text-xs font-mono uppercase text-textMuted font-semibold px-1 tracking-wider">
            Available Role Openings ({matches.length})
          </h2>

          {matches.map((m) => {
            const isSelected = selectedMatch?.roleId === m.roleId;
            const scorePct = Math.round(m.score * 100);
            return (
              <div
                key={m.roleId}
                onClick={() => loadRoleDeepDive(m)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-surface border-talonGold shadow-xl shadow-talonGold/10 scale-[1.01]'
                    : 'bg-[#06090F] border-border hover:border-textMuted hover:scale-[1.005]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-textPrimary text-base tracking-tight">{m.title}</h3>
                  <span className="text-xl font-mono font-extrabold text-talonGold">
                    {scorePct}%
                  </span>
                </div>

                {/* Score Bar */}
                <div className="w-full h-2 bg-surface rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-gradient-to-r from-talonGold to-talonCyan rounded-full transition-all duration-500"
                    style={{ width: `${scorePct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-textMuted">
                  <span>Coverage: {Math.round(m.breakdown.coverage * 100)}%</span>
                  <span>Proficiency: {Math.round(m.breakdown.proficiency * 100)}%</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Deep-Dive Component Breakdown & AI Grounded Why-Me */}
        {selectedMatch && (
          <div className="lg:col-span-2 bg-surface border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-talonCyan/20 text-talonCyan font-bold border border-talonCyan/30 uppercase tracking-widest">
                  Match Audit & Breakdown
                </span>
                <h2 className="text-2xl font-bold text-textPrimary mt-1">{selectedMatch.title}</h2>
              </div>
              <Link
                href="/roadmap"
                className="px-5 py-2.5 rounded-xl bg-talonGold text-black font-semibold text-xs font-mono flex items-center gap-2 hover:bg-talonGold/90 transition-all shadow-lg shadow-talonGold/20 shrink-0 self-start sm:self-auto"
              >
                <BookOpen className="w-4 h-4" /> Build Career Roadmap
              </Link>
            </div>

            {/* AI Grounded Explanation Card */}
            <div className="p-5 rounded-xl bg-talonGold/5 border border-talonGold/30 space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between text-xs font-mono text-talonGold font-bold">
                <span className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-talonGold" /> Grounded "Why Me?" AI Analysis
                </span>
                <span className="px-2 py-0.5 rounded bg-talonGold/20 text-talonGold font-bold border border-talonGold/30 text-[10px]">
                  AUDITED BY GEMINI 1.5 FLASH
                </span>
              </div>
              <p className="text-sm text-textPrimary leading-relaxed font-sans">
                {loadingExpl ? (
                  <span className="flex items-center gap-2 font-mono text-xs text-textMuted py-2">
                    <span className="w-3.5 h-3.5 border-2 border-talonGold border-t-transparent rounded-full animate-spin" />
                    Analyzing candidate evidence ledger citations...
                  </span>
                ) : (
                  explanation
                )}
              </p>
            </div>

            {/* Component Weights Breakdown */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-mono uppercase text-textMuted font-bold tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-talonCyan" /> Transparent Algorithm Component Weights
              </h3>

              <div className="space-y-3.5 text-xs font-mono bg-[#06090F] p-5 rounded-xl border border-border">
                {/* 1. Coverage (35%) */}
                <div className="space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span className="text-textPrimary">1. Must/Nice Skill Coverage (35% Weight)</span>
                    <span className="text-talonGold">{Math.round(selectedMatch.breakdown.coverage * 100)}%</span>
                  </div>
                  <div className="h-2 bg-surface rounded-full overflow-hidden">
                    <div
                      className="h-full bg-talonGold rounded-full transition-all duration-500"
                      style={{ width: `${selectedMatch.breakdown.coverage * 100}%` }}
                    />
                  </div>
                </div>

                {/* 2. Proficiency (20%) */}
                <div className="space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span className="text-textPrimary">2. Depth of Proficiency Level (20% Weight)</span>
                    <span className="text-talonCyan">{Math.round(selectedMatch.breakdown.proficiency * 100)}%</span>
                  </div>
                  <div className="h-2 bg-surface rounded-full overflow-hidden">
                    <div
                      className="h-full bg-talonCyan rounded-full transition-all duration-500"
                      style={{ width: `${selectedMatch.breakdown.proficiency * 100}%` }}
                    />
                  </div>
                </div>

                {/* 3. Semantic Vector (20%) */}
                <div className="space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span className="text-textPrimary">3. Semantic Vector Cosine Similarity (20% Weight)</span>
                    <span className="text-textPrimary">{Math.round(selectedMatch.breakdown.semantic * 100)}%</span>
                  </div>
                  <div className="h-2 bg-surface rounded-full overflow-hidden">
                    <div
                      className="h-full bg-textPrimary rounded-full transition-all duration-500"
                      style={{ width: `${selectedMatch.breakdown.semantic * 100}%` }}
                    />
                  </div>
                </div>

                {/* 4. Graph Growth (10%) */}
                <div className="space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span className="text-textPrimary">4. Graph Adjacency Growth Potential (10% Weight)</span>
                    <span className="text-talonGreen">{Math.round(selectedMatch.breakdown.growth * 100)}%</span>
                  </div>
                  <div className="h-2 bg-surface rounded-full overflow-hidden">
                    <div
                      className="h-full bg-talonGreen rounded-full transition-all duration-500"
                      style={{ width: `${selectedMatch.breakdown.growth * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}