'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Sparkles, Upload, FileText, ChevronRight, Info } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvidence, setSelectedEvidence] = useState<any | null>(null);

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
    return <div className="py-20 text-center font-mono text-textMuted">Locating workforce signature...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="bg-surface border border-border rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-textPrimary">{profile?.employee?.fullName}</h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-talonGold/20 text-talonGold border border-talonGold/30">
              v{profile?.profileVersion}.0 Living Profile
            </span>
          </div>
          <p className="text-sm text-textMuted">
            {profile?.employee?.title} • <span className="text-talonCyan">{profile?.employee?.department} Department</span> • {profile?.employee?.yearsExperience} years experience
          </p>
          <p className="text-xs text-textMuted/80 mt-2 max-w-2xl">{profile?.employee?.summary}</p>
        </div>

        <button
          onClick={() => setUploadOpen(true)}
          className="px-4 py-2.5 rounded-lg bg-talonGold/10 hover:bg-talonGold/20 text-talonGold border border-talonGold/40 font-semibold text-sm flex items-center gap-2 self-start md:self-auto transition-colors"
        >
          <Upload className="w-4 h-4" />
          Ingest New Resume / Artifact
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-mono font-semibold text-textPrimary flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-talonGold" /> Verified & Hidden Skill Ledger
            </h2>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="flex items-center gap-1.5 text-talonCyan">
                <span className="w-2 h-2 rounded-full bg-talonCyan" /> Explicit
              </span>
              <span className="flex items-center gap-1.5 text-talonGold">
                <span className="w-2 h-2 rounded-full bg-talonGold" /> Inferred by AI
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {profile?.skills?.map((skill: any) => {
              const isInferred = skill.origin === 'INFERRED';
              return (
                <div
                  key={skill.skillId}
                  onClick={() => setSelectedEvidence(skill)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all hover:scale-[1.01] ${
                    isInferred
                      ? 'bg-talonGold/5 border-talonGold/40 hover:border-talonGold'
                      : 'bg-[#0A0E14] border-border hover:border-talonCyan'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-sm text-textPrimary">{skill.name}</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                        isInferred
                          ? 'bg-talonGold/20 text-talonGold'
                          : 'bg-talonCyan/20 text-talonCyan'
                      }`}
                    >
                      {isInferred ? 'AI INFERRED' : 'EXPLICIT'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-textMuted font-mono">
                    <span>Level {skill.level} / 5</span>
                    <span>{Math.round(skill.confidence * 100)}% Confidence</span>
                  </div>

                  {skill.evidence?.length > 0 && (
                    <div className="mt-2 text-[11px] text-textMuted/90 flex items-center gap-1">
                      <FileText className="w-3 h-3 text-talonGold" />
                      <span className="truncate">{skill.evidence[0]?.snippet}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <h2 className="text-base font-mono font-semibold text-textPrimary">Target Role Lock</h2>
          <div className="space-y-3">
            {matches.slice(0, 3).map((match: any) => (
              <Link
                key={match.roleId}
                href="/matches"
                className="p-3.5 rounded-lg bg-[#0A0E14] border border-border hover:border-talonGold transition-colors block group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm text-textPrimary group-hover:text-talonGold transition-colors">
                    {match.title}
                  </span>
                  <span className="font-mono font-bold text-sm text-talonGold">
                    {Math.round(match.score * 100)}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-surfaceElevated rounded-full overflow-hidden">
                  <div
                    className="h-full bg-talonGold rounded-full transition-all"
                    style={{ width: `${match.score * 100}%` }}
                  />
                </div>
                <div className="mt-2 text-[11px] text-textMuted flex items-center justify-between font-mono">
                  <span>Coverage: {Math.round(match.breakdown.coverage * 100)}%</span>
                  <span className="flex items-center text-talonGold">
                    Details <ChevronRight className="w-3 h-3 ml-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {selectedEvidence && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border max-w-lg w-full rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-textPrimary flex items-center gap-2">
                <Info className="w-5 h-5 text-talonCyan" /> Evidence Ledger: {selectedEvidence.name}
              </h3>
              <button
                onClick={() => setSelectedEvidence(null)}
                className="text-textMuted hover:text-textPrimary text-sm font-mono"
              >
                [CLOSE]
              </button>
            </div>

            <p className="text-xs text-textMuted font-mono">
              Origin: {selectedEvidence.origin} • Verified Level: {selectedEvidence.level}/5
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {selectedEvidence.evidence?.map((ev: any) => (
                <div key={ev.id} className="p-3 rounded bg-[#0A0E14] border border-border space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono text-talonGold">
                    <span>Source: {ev.sourceType}</span>
                    <span>Observed: {ev.observedAt}</span>
                  </div>
                  <p className="text-xs text-textPrimary">{ev.snippet}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {uploadOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border max-w-md w-full rounded-xl p-6 space-y-5">
            <h3 className="font-bold text-base text-textPrimary flex items-center gap-2 font-mono">
              <Upload className="w-4 h-4 text-talonGold" /> Resume Extraction Pipeline
            </h3>

            {!uploading ? (
              <div className="space-y-4">
                <div className="p-6 border-2 border-dashed border-border rounded-xl text-center space-y-2">
                  <FileText className="w-8 h-8 text-talonGold mx-auto" />
                  <p className="text-xs text-textPrimary font-medium">Drop candidate PDF or DOCX</p>
                  <p className="text-[11px] text-textMuted">Tika parsing • PII Scrubbing • Graph Inference</p>
                </div>
                <button
                  onClick={triggerUpload}
                  className="w-full py-2.5 rounded-lg bg-talonGold text-black font-semibold text-sm hover:bg-talonGold/90"
                >
                  Start Autonomous Ingestion
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-talonGold">{uploadStage}</span>
                  <span>{uploadPercent}%</span>
                </div>
                <div className="w-full h-2 bg-[#0A0E14] rounded-full overflow-hidden border border-border">
                  <div
                    className="h-full bg-talonGold transition-all duration-300"
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