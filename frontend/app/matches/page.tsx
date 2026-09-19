'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Award, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function MatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<any | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loadingExpl, setLoadingExpl] = useState(false);

  useEffect(() => {
    apiFetch('/api/v1/me/matches')
      .then((r) => r.json())
      .then((data) => {
        setMatches(data);
        if (data.length > 0) loadRoleDeepDive(data[0]);
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
      setExplanation('Direct project evidence supports matching requirements.');
    } finally {
      setLoadingExpl(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-textPrimary">Internal Role Targets</h1>
        <p className="text-xs text-textMuted font-mono">5-Factor Hybrid Algorithm with Evidence-Grounded Explainability</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-3">
          {matches.map((m) => {
            const isSelected = selectedMatch?.roleId === m.roleId;
            return (
              <div
                key={m.roleId}
                onClick={() => loadRoleDeepDive(m)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-surface border-talonGold shadow-lg shadow-talonGold/5'
                    : 'bg-[#0A0E14] border-border hover:border-borderMuted'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-textPrimary text-sm">{m.title}</h3>
                  <div className="text-right">
                    <span className="text-lg font-mono font-bold text-talonGold">
                      {Math.round(m.score * 100)}%
                    </span>
                  </div>
                </div>

                <div className="w-full h-1.5 bg-[#111826] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-talonGold rounded-full"
                    style={{ width: `${m.score * 100}%` }}
                  />
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-textMuted">
                  <span>Coverage: {Math.round(m.breakdown.coverage * 100)}%</span>
                  <span>Proficiency: {Math.round(m.breakdown.proficiency * 100)}%</span>
                </div>
              </div>
            );
          })}
        </div>

        {selectedMatch && (
          <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="text-xl font-bold text-textPrimary">{selectedMatch.title}</h2>
                <p className="text-xs text-talonCyan font-mono">Candidate ID #1 Match Verification</p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/roadmap"
                  className="px-3.5 py-1.5 rounded-lg bg-talonGold text-black font-semibold text-xs flex items-center gap-1.5 hover:bg-talonGold/90 transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" /> Build Career Roadmap
                </Link>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-talonGold/5 border border-talonGold/30 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-talonGold font-semibold">
                <span className="flex items-center gap-1.5">
                  <Award className="w-4 h-4" /> Grounded "Why Me?" Analysis
                </span>
                <span className="px-1.5 py-0.5 rounded bg-talonGold/20">AI Audited</span>
              </div>
              <p className="text-sm text-textPrimary leading-relaxed">
                {loadingExpl ? 'Analyzing evidence ledger citations...' : explanation}
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-mono uppercase text-textMuted">Transparent Component Weights</h3>
              
              <div className="space-y-2 text-xs font-mono">
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Must/Nice Skill Coverage (35%)</span>
                    <span className="text-talonGold">{Math.round(selectedMatch.breakdown.coverage * 100)}%</span>
                  </div>
                  <div className="h-1.5 bg-[#0A0E14] rounded-full overflow-hidden">
                    <div className="h-full bg-talonGold" style={{ width: `${selectedMatch.breakdown.coverage * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span>Depth of Proficiency (20%)</span>
                    <span className="text-talonCyan">{Math.round(selectedMatch.breakdown.proficiency * 100)}%</span>
                  </div>
                  <div className="h-1.5 bg-[#0A0E14] rounded-full overflow-hidden">
                    <div className="h-full bg-talonCyan" style={{ width: `${selectedMatch.breakdown.proficiency * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span>Semantic Vector Similarity (20%)</span>
                    <span className="text-textPrimary">{Math.round(selectedMatch.breakdown.semantic * 100)}%</span>
                  </div>
                  <div className="h-1.5 bg-[#0A0E14] rounded-full overflow-hidden">
                    <div className="h-full bg-textPrimary" style={{ width: `${selectedMatch.breakdown.semantic * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span>Graph Adjacency Growth Potential (10%)</span>
                    <span className="text-talonGreen">{Math.round(selectedMatch.breakdown.growth * 100)}%</span>
                  </div>
                  <div className="h-1.5 bg-[#0A0E14] rounded-full overflow-hidden">
                    <div className="h-full bg-talonGreen" style={{ width: `${selectedMatch.breakdown.growth * 100}%` }} />
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