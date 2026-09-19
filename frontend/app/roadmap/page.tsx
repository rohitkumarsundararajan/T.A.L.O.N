'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { CheckCircle2, Clock, Circle, MapPin } from 'lucide-react';
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
  const [loading, setLoading] = useState(false);

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
    } catch (e) {}
  };

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="tactical-box p-8 bg-[#090E17] border-[#1A2638] gold-glow">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[11px] font-mono-hud font-bold px-2 py-0.5 bg-talonGold/20 text-talonGold border border-talonGold/40 uppercase tracking-widest">
            ACTIVE MOBILITY MISSION // ID: 001
          </span>
          <span className="text-[11px] font-mono-hud text-textMuted tracking-widest">PATH: DEVOPS SPECIALIST</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-hud font-black tracking-tight text-textPrimary uppercase">
          STRATEGIC ROADMAP
        </h1>
        <p className="text-xs font-mono-hud text-textMuted uppercase tracking-widest mt-2">
          GRAPH-SEQUENCED MILESTONES • TARGET: DEVOPS ENGINEER • TOTAL EFFORT: 12 WEEKS
        </p>
      </div>

      {/* Interactive Milestones */}
      <div className="tactical-box p-8 bg-[#090E17] border-[#1A2638]">
        <div className="relative border-l-2 border-[#1A2638] ml-6 pl-8 space-y-8">
          {roadmap?.steps?.map((step: any) => {
            const isDone = step.status === 'DONE';
            return (
              <div key={step.id} className="relative group">
                <button
                  onClick={() => toggleStatus(step.id, step.status)}
                  className={`absolute -left-[45px] top-1.5 w-8 h-8 rounded-none tactical-box flex items-center justify-center transition-all cursor-pointer ${
                    isDone
                      ? 'bg-talonGreen text-black border-talonGreen shadow-lg shadow-talonGreen/30'
                      : 'bg-[#0B111A] text-talonGold border-talonGold hover:scale-110'
                  }`}
                  title="Click to toggle status"
                >
                  {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-3 h-3 fill-current" />}
                </button>

                <div className="tactical-box p-6 bg-[#06090F] border-[#1A2638] group-hover:border-talonGold transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono-hud text-xs font-bold text-talonGold uppercase tracking-widest">
                      STAGE 0{step.seq} // OBJECTIVE CHECKPOINT
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-mono-hud text-textMuted uppercase">
                      <Clock className="w-3.5 h-3.5 text-talonCyan" /> {step.effortWeeks} WEEKS DURATION
                    </span>
                  </div>

                  <h3 className={`font-hud font-bold text-xl uppercase tracking-wide ${isDone ? 'line-through text-textMuted' : 'text-textPrimary'}`}>
                    {step.title}
                  </h3>

                  <div className="mt-4 pt-3 border-t border-[#1A2638] flex items-center justify-between text-xs font-mono-hud">
                    <span className={`px-2.5 py-1 uppercase tracking-widest font-bold ${isDone ? 'bg-talonGreen/20 text-talonGreen border border-talonGreen/40' : 'bg-[#111826] text-textMuted'}`}>
                      STATUS: {step.status}
                    </span>
                    <span className="text-talonCyan font-mono-hud text-[11px] uppercase tracking-wider">
                      CLICK ICON TO TOGGLE CHECKPOINT
                    </span>
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