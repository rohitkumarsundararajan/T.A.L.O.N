'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { CheckCircle2, Clock, Circle, MapPin, Target, Sparkles, ChevronRight, Award } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RoadmapPage() {
  const router = useRouter();
  const [roadmap, setRoadmap] = useState<any>({
    roleId: 1,
    steps: [
      { id: 1, seq: 1, title: 'Container Orchestration with Kubernetes (Production Deployments)', effortWeeks: 3.0, status: 'IN_PROGRESS' },
      { id: 2, seq: 2, title: 'Multi-Stage Dockerfile Optimization & Rootless Containers', effortWeeks: 1.5, status: 'DONE' },
      { id: 3, seq: 3, title: 'GitLab CI/CD Automated Pipeline Security & Secret Masking', effortWeeks: 2.0, status: 'TODO' },
      { id: 4, seq: 4, title: 'Prometheus & Grafana Cloud Infrastructure Observability', effortWeeks: 2.5, status: 'TODO' },
      { id: 5, seq: 5, title: 'Hands-on DevOps Capstone: Automated Ticket Triage Microservice Cluster', effortWeeks: 3.0, status: 'TODO' },
    ]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('talon_token');
    if (!token) {
      router.push('/login');
      return;
    }

    async function loadRoadmap() {
      try {
        const res = await apiFetch('/api/v1/me/roadmap', {
          method: 'POST',
          body: JSON.stringify({ roleId: 1 }),
        });
        if (res && res.ok) {
          const text = await res.text();
          if (text) {
            const data = JSON.parse(text);
            if (data && data.steps && data.steps.length > 0) {
              setRoadmap(data);
            }
          }
        }
      } catch (err) {
        console.warn('Using tactical cached roadmap data');
      } finally {
        setLoading(false);
      }
    }
    loadRoadmap();
  }, [router]);

  const toggleStatus = async (stepId: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'DONE' ? 'TODO' : 'DONE';
    setRoadmap((prev: any) => ({
      ...prev,
      steps: prev.steps.map((s: any) => (s.id === stepId ? { ...s, status: nextStatus } : s)),
    }));

    try {
      await apiFetch(`/api/v1/me/roadmap/steps/${stepId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const steps = roadmap?.steps || [];
  const completedCount = steps.filter((s: any) => s.status === 'DONE').length;
  const progressPct = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;
  const totalEffortWeeks = steps.reduce((sum: number, s: any) => sum + (s.effortWeeks || 0), 0);

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-talonGold/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 bg-talonGold/20 text-talonGold border border-talonGold/40 rounded uppercase tracking-wider">
            Active Mobility Mission // Role #1
          </span>
          <span className="text-xs font-mono text-textMuted uppercase tracking-wider">
            Target: DevOps Engineer Specialist
          </span>
        </div>

        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-textPrimary uppercase font-hud">
            Strategic Skill Roadmap
          </h1>
          <p className="text-xs font-mono text-textMuted uppercase tracking-widest">
            Graph-Sequenced Milestones • Total Estimated Effort: {totalEffortWeeks.toFixed(1)} Weeks
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 pt-2 bg-[#06090F] p-4 rounded-xl border border-border">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-textPrimary font-semibold">
              Mission Progress: {completedCount} / {steps.length} Checkpoints Completed
            </span>
            <span className="text-talonGold font-bold">{progressPct}% Complete</span>
          </div>
          <div className="w-full h-2.5 bg-surface rounded-full overflow-hidden border border-border">
            <div
              className="h-full bg-gradient-to-r from-talonGold to-talonGreen rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Interactive Milestone Timeline */}
      <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <h2 className="text-xs font-mono uppercase text-textMuted font-bold tracking-wider">
          Sequenced Learning Checkpoints
        </h2>

        <div className="relative border-l-2 border-border/80 ml-4 sm:ml-6 pl-6 sm:pl-8 space-y-8">
          {steps.map((step: any) => {
            const isDone = step.status === 'DONE';
            const isInProgress = step.status === 'IN_PROGRESS';
            return (
              <div key={step.id} className="relative group">
                {/* Node Button */}
                <button
                  type="button"
                  onClick={() => toggleStatus(step.id, step.status)}
                  className={`absolute -left-[41px] sm:-left-[49px] top-1.5 w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-md ${
                    isDone
                      ? 'bg-talonGreen text-black border border-talonGreen shadow-talonGreen/30 scale-105'
                      : isInProgress
                      ? 'bg-talonGold text-black border border-talonGold shadow-talonGold/30 animate-pulse'
                      : 'bg-[#06090F] text-textMuted border border-border hover:border-talonGold hover:text-talonGold'
                  }`}
                  title="Click to toggle milestone completion status"
                >
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Circle className="w-3 h-3 fill-current" />
                  )}
                </button>

                {/* Card Container */}
                <div
                  className={`p-5 rounded-2xl border transition-all ${
                    isDone
                      ? 'bg-talonGreen/5 border-talonGreen/30'
                      : isInProgress
                      ? 'bg-talonGold/5 border-talonGold/30'
                      : 'bg-[#06090F] border-border group-hover:border-textMuted'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-bold text-talonGold uppercase tracking-wider">
                      Stage 0{step.seq} // Objective Checkpoint
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-mono text-textMuted">
                      <Clock className="w-3.5 h-3.5 text-talonCyan" /> {step.effortWeeks} Weeks Effort
                    </span>
                  </div>

                  <h3
                    className={`font-bold text-base tracking-tight ${
                      isDone ? 'line-through text-textMuted' : 'text-textPrimary'
                    }`}
                  >
                    {step.title}
                  </h3>

                  <div className="mt-4 pt-3 border-t border-border/50 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                    <span
                      className={`px-2.5 py-1 rounded-md uppercase font-bold text-[10px] ${
                        isDone
                          ? 'bg-talonGreen/20 text-talonGreen border border-talonGreen/40'
                          : isInProgress
                          ? 'bg-talonGold/20 text-talonGold border border-talonGold/40'
                          : 'bg-surface text-textMuted border border-border'
                      }`}
                    >
                      STATUS: {step.status}
                    </span>

                    <button
                      type="button"
                      onClick={() => toggleStatus(step.id, step.status)}
                      className="text-talonCyan hover:text-talonGold transition-colors text-[11px] font-mono"
                    >
                      Toggle Status ↵
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}