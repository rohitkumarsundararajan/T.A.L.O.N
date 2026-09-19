'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Sparkles, Upload, FileText, ChevronRight, Info, CheckCircle2, Shield, Brain, Layers, Filter } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvidence, setSelectedEvidence] = useState<any | null>(null);
  const [filterType, setFilterType] = useState<'ALL' | 'EXPLICIT' | 'INFERRED'>('ALL');

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStage, setUploadStage] = useState('');
  const [uploadPercent, setUploadPercent] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        const [pRes, mRes] = await Promise.all([
          apiFetch('/api/v1/me/profile'),
          apiFetch('/api/v1/me/matches'),
        ]);

        if (pRes.ok) setProfile(await pRes.json());
        if (mRes.ok) setMatches(await mRes.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const triggerUpload = async () => {
    setUploading(true);
    setUploadPercent(10);
    setUploadStage('PARSING RESUME WITH APACHE TIKA...');

    const evtSource = new EventSource('/api/v1/jobs/sample/events');
    evtSource.addEventListener('progress', (e) => {
      const data = JSON.parse(e.data);
      setUploadStage(data.stage);
      setUploadPercent(data.percent);
    });

    evtSource.addEventListener('done', async () => {
      setUploadStage('EXTRACTION COMPLETE');
      setUploadPercent(100);
      evtSource.close();
      setTimeout(async () => {
        setUploading(false);
        setUploadOpen(false);
        const pRes = await apiFetch('/api/v1/me/profile');
        if (pRes.ok) setProfile(await pRes.json());
      }, 1000);
    });
  };

  if (loading) {
    return (
      <div className="py-28 text-center space-y-4 font-mono">
        <div className="w-12 h-12 border-2 border-talonGold border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-textMuted text-sm">Locating workforce signature & evidence ledger...</p>
      </div>
    );
  }

  const allSkills = profile?.skills || [];
  const filteredSkills = allSkills.filter((s: any) => {
    if (filterType === 'EXPLICIT') return s.origin === 'EXPLICIT';
    if (filterType === 'INFERRED') return s.origin === 'INFERRED';
    return true;
  });

  const explicitCount = allSkills.filter((s: any) => s.origin === 'EXPLICIT').length;
  const inferredCount = allSkills.filter((s: any) => s.origin === 'INFERRED').length;
  const topMatch = matches.length > 0 ? Math.round(matches[0].score * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Profile Banner */}
      <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-talonGold/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-3 z-10">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold text-textPrimary tracking-tight">
              {profile?.employee?.fullName}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-talonGold/20 text-talonGold border border-talonGold/40 shadow-sm">
              v{profile?.profileVersion}.0 Living Profile
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-textMuted">
            <span className="text-textPrimary font-medium">{profile?.employee?.title}</span>
            <span>•</span>
            <span className="px-2 py-0.5 rounded bg-talonCyan/10 text-talonCyan border border-talonCyan/20">
              {profile?.employee?.department} Department
            </span>
            <span>•</span>
            <span>{profile?.employee?.yearsExperience} Years Industry Experience</span>
          </div>

          <p className="text-xs text-textMuted leading-relaxed max-w-3xl">
            {profile?.employee?.summary}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setUploadOpen(true)}
          className="px-5 py-3 rounded-xl bg-talonGold text-black font-semibold text-xs font-mono tracking-wide flex items-center gap-2 self-start md:self-auto hover:bg-talonGold/90 transition-all shadow-lg shadow-talonGold/20 active:scale-[0.98] shrink-0"
        >
          <Upload className="w-4 h-4" />
          Ingest Resume / Artifact
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface/80 border border-border rounded-xl p-4 space-y-1">
          <p className="text-[11px] font-mono uppercase text-textMuted font-semibold">Total Verified Skills</p>
          <p className="text-2xl font-mono font-bold text-textPrimary">{allSkills.length}</p>
        </div>

        <div className="bg-surface/80 border border-border rounded-xl p-4 space-y-1">
          <p className="text-[11px] font-mono uppercase text-textMuted font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-talonCyan" /> Explicit Evidence
          </p>
          <p className="text-2xl font-mono font-bold text-talonCyan">{explicitCount}</p>
        </div>

        <div className="bg-surface/80 border border-border rounded-xl p-4 space-y-1">
          <p className="text-[11px] font-mono uppercase text-textMuted font-semibold flex items-center gap-1">
            <Brain className="w-3.5 h-3.5 text-talonGold" /> AI Hidden Latent
          </p>
          <p className="text-2xl font-mono font-bold text-talonGold">{inferredCount}</p>
        </div>

        <div className="bg-surface/80 border border-border rounded-xl p-4 space-y-1">
          <p className="text-[11px] font-mono uppercase text-textMuted font-semibold">Top Target Fit</p>
          <p className="text-2xl font-mono font-bold text-talonGreen">{topMatch}%</p>
        </div>
      </div>

      {/* Main Grid: Skill Ledger + Target Lock Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Skill Ledger */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-2xl p-6 space-y-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <h2 className="text-lg font-mono font-bold text-textPrimary flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-talonGold" /> Verified & Hidden Skill Ledger
              </h2>
              <p className="text-xs text-textMuted">Click any skill card to open full evidence citations</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-[#06090F] p-1 rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setFilterType('ALL')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                  filterType === 'ALL'
                    ? 'bg-surface text-talonGold border border-talonGold/40'
                    : 'text-textMuted hover:text-textPrimary'
                }`}
              >
                All ({allSkills.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('EXPLICIT')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                  filterType === 'EXPLICIT'
                    ? 'bg-surface text-talonCyan border border-talonCyan/40'
                    : 'text-textMuted hover:text-textPrimary'
                }`}
              >
                Explicit ({explicitCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('INFERRED')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                  filterType === 'INFERRED'
                    ? 'bg-surface text-talonGold border border-talonGold/40'
                    : 'text-textMuted hover:text-textPrimary'
                }`}
              >
                AI Inferred ({inferredCount})
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filteredSkills.map((skill: any) => {
              const isInferred = skill.origin === 'INFERRED';
              return (
                <div
                  key={skill.skillId}
                  onClick={() => setSelectedEvidence(skill)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.01] hover:shadow-lg ${
                    isInferred
                      ? 'bg-talonGold/5 border-talonGold/30 hover:border-talonGold'
                      : 'bg-[#06090F] border-border hover:border-talonCyan'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm text-textPrimary tracking-tight">{skill.name}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold ${
                        isInferred
                          ? 'bg-talonGold/20 text-talonGold border border-talonGold/30'
                          : 'bg-talonCyan/20 text-talonCyan border border-talonCyan/30'
                      }`}
                    >
                      {isInferred ? 'AI INFERRED' : 'EXPLICIT'}
                    </span>
                  </div>

                  {/* Level meter bar */}
                  <div className="space-y-1 mb-2.5">
                    <div className="flex items-center justify-between text-[11px] text-textMuted font-mono">
                      <span>Proficiency Level {skill.level}/5</span>
                      <span>{Math.round(skill.confidence * 100)}% Confidence</span>
                    </div>
                    <div className="grid grid-cols-5 gap-1 h-1.5">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <div
                          key={lvl}
                          className={`rounded-full transition-all ${
                            lvl <= skill.level
                              ? isInferred
                                ? 'bg-talonGold'
                                : 'bg-talonCyan'
                              : 'bg-surface border border-border'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {skill.evidence?.length > 0 && (
                    <div className="text-[11px] text-textMuted/80 flex items-center gap-1.5 pt-2 border-t border-border/50">
                      <FileText className="w-3.5 h-3.5 text-talonGold shrink-0" />
                      <span className="truncate">{skill.evidence[0]?.snippet}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Target Role Lock */}
        <div className="bg-surface border border-border rounded-2xl p-6 space-y-5 shadow-xl h-fit">
          <div className="border-b border-border pb-3">
            <h2 className="text-lg font-mono font-bold text-textPrimary">Target Role Lock</h2>
            <p className="text-xs text-textMuted">Algorithmically computed career targets</p>
          </div>

          <div className="space-y-3.5">
            {matches.slice(0, 4).map((match: any) => (
              <Link
                key={match.roleId}
                href="/matches"
                className="p-4 rounded-xl bg-[#06090F] border border-border hover:border-talonGold transition-all block group hover:scale-[1.01]"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-sm text-textPrimary group-hover:text-talonGold transition-colors">
                    {match.title}
                  </span>
                  <span className="font-mono font-bold text-base text-talonGold">
                    {Math.round(match.score * 100)}%
                  </span>
                </div>

                <div className="w-full h-2 bg-surface rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-gradient-to-r from-talonGold to-talonCyan rounded-full transition-all duration-500"
                    style={{ width: `${match.score * 100}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-textMuted">
                  <span>Coverage: {Math.round(match.breakdown.coverage * 100)}%</span>
                  <span className="flex items-center text-talonGold group-hover:translate-x-0.5 transition-transform">
                    Audit Breakdown <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Evidence Drawer Modal */}
      {selectedEvidence && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border max-w-lg w-full rounded-2xl p-6 space-y-5 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="font-bold text-lg text-textPrimary flex items-center gap-2">
                <Info className="w-5 h-5 text-talonCyan" /> Evidence Provenance: {selectedEvidence.name}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedEvidence(null)}
                className="text-textMuted hover:text-textPrimary text-xs font-mono px-2 py-1 rounded hover:bg-surface"
              >
                [CLOSE]
              </button>
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-textMuted bg-[#06090F] p-3 rounded-xl border border-border">
              <span>Origin Type: <strong className="text-textPrimary">{selectedEvidence.origin}</strong></span>
              <span>Level: <strong className="text-talonGold">{selectedEvidence.level}/5</strong></span>
              <span>Confidence: <strong className="text-talonCyan">{Math.round(selectedEvidence.confidence * 100)}%</strong></span>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {selectedEvidence.evidence?.map((ev: any) => (
                <div key={ev.id} className="p-3.5 rounded-xl bg-[#06090F] border border-border space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono text-talonGold font-semibold">
                    <span>Source: {ev.sourceType}</span>
                    <span className="text-textMuted">{ev.observedAt}</span>
                  </div>
                  <p className="text-xs text-textPrimary leading-relaxed">{ev.snippet}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Resume Extraction Modal */}
      {uploadOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border max-w-md w-full rounded-2xl p-6 space-y-5 shadow-2xl relative overflow-hidden">
            <h3 className="font-bold text-base text-textPrimary flex items-center gap-2 font-mono">
              <Upload className="w-5 h-5 text-talonGold" /> Autonomous Ingestion Pipeline
            </h3>

            {!uploading ? (
              <div className="space-y-4">
                <div className="p-8 border-2 border-dashed border-border rounded-xl text-center space-y-2 bg-[#06090F]">
                  <FileText className="w-10 h-10 text-talonGold mx-auto animate-bounce" />
                  <p className="text-xs text-textPrimary font-semibold">Sample Technical Resume / Work Artifact</p>
                  <p className="text-[11px] text-textMuted">Tika Engine • Entity Scrubbing • Vector Graph Extraction</p>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setUploadOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-mono text-textMuted hover:text-textPrimary"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={triggerUpload}
                    className="px-5 py-2.5 rounded-xl bg-talonGold text-black font-semibold text-xs font-mono hover:bg-talonGold/90 transition-all shadow-lg shadow-talonGold/20"
                  >
                    Run Extraction Pipeline
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-talonGold font-semibold">{uploadStage}</span>
                  <span className="text-textPrimary font-bold">{uploadPercent}%</span>
                </div>
                <div className="w-full h-3 bg-[#06090F] rounded-full overflow-hidden border border-border p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-talonGold to-talonCyan rounded-full transition-all duration-300"
                    style={{ width: `${uploadPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}