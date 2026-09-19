'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { MapPin, CheckCircle2, Clock, Circle } from 'lucide-react';

export default function RoadmapPage() {
  const [roadmap, setRoadmap] = useState<any | null>(null);

  useEffect(() => {
    apiFetch('/api/v1/me/roadmap', {
      method: 'POST',
      body: JSON.stringify({ roleId: 1 }),
    })
      .then((r) => r.json())
      .then((data) => setRoadmap(data));
  }, []);

  const toggleStatus = async (stepId: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'DONE' ? 'TODO' : 'DONE';
    const res = await apiFetch(`/api/v1/me/roadmap/steps/${stepId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: nextStatus }),
    });
    if (res.ok) {
      setRoadmap((prev: any) => ({
        ...prev,
        steps: prev.steps.map((s: any) => (s.id === stepId ? { ...s, status: nextStatus } : s)),
      }));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-textPrimary flex items-center gap-2">
          <MapPin className="w-6 h-6 text-talonGold" /> Personalized Mobility Roadmap
        </h1>
        <p className="text-xs text-textMuted font-mono">Target Role: DevOps Engineer • Sequenced by Prerequisite Graph Edges</p>
      </div>

      <div className="bg-surface border border-border rounded-xl p-6">
        <div className="relative border-l-2 border-border ml-4 pl-6 space-y-8">
          {roadmap?.steps?.map((step: any) => {
            const isDone = step.status === 'DONE';
            return (
              <div key={step.id} className="relative group">
                <button
                  onClick={() => toggleStatus(step.id, step.status)}
                  className={`absolute -left-[35px] top-1 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                    isDone ? 'bg-talonGreen text-black' : 'bg-surface border-2 border-talonGold text-talonGold'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-2.5 h-2.5 fill-current" />}
                </button>

                <div className="bg-[#0A0E14] border border-border group-hover:border-talonGold/50 rounded-xl p-4 transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-semibold text-talonGold">STAGE 0{step.seq}</span>
                    <span className="flex items-center gap-1 text-[11px] font-mono text-textMuted">
                      <Clock className="w-3 h-3" /> {step.effortWeeks} Weeks Estimated
                    </span>
                  </div>
                  <h3 className={`font-semibold text-sm ${isDone ? 'line-through text-textMuted' : 'text-textPrimary'}`}>
                    {step.title}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}