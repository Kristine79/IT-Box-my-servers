'use client';

import { useMemo } from 'react';
import { FolderKanban, Server, Network, KeyRound, Lock, MousePointer2, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Stats {
  projects: number;
  servers: number;
  services: number;
  credentials: number;
}

interface DashboardStatsProps {
  stats: Stats;
  planLimits: { projects: number; servers: number; services: number; credentials: number };
}

export function DashboardStats({ stats, planLimits }: DashboardStatsProps) {
  const statItems = useMemo(() => [
    { key: 'projects', label: 'Projects', icon: FolderKanban, count: stats.projects, limit: planLimits.projects, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
    { key: 'servers', label: 'Servers', icon: Server, count: stats.servers, limit: planLimits.servers, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' },
    { key: 'services', label: 'Services', icon: Network, count: stats.services, limit: planLimits.services, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
    { key: 'credentials', label: 'Credentials', icon: KeyRound, count: stats.credentials, limit: planLimits.credentials, color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
  ], [stats, planLimits]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {statItems.map((s) => (
        <div
          key={s.key}
          className="neu-panel p-4 flex flex-col items-center text-center cursor-pointer hover:scale-105 transition-transform"
          onClick={() => {
            const links: Record<string, string> = { projects: '/projects', servers: '/servers', services: '/services', credentials: '/credentials' };
            window.location.href = links[s.key];
          }}
        >
          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center mb-2", s.bgColor)}>
            <s.icon className={cn("w-5 h-5", s.color)} />
          </div>
          <div className="text-2xl font-bold">{s.count}</div>
          <div className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider">
            {s.label}
          </div>
          <div className="text-[10px] text-[var(--muted-foreground)] mt-1">
            {s.count >= (s.limit * 0.8) ? (
              <span className="text-amber-500">{s.count}/{s.limit === Infinity ? '∞' : s.limit}</span>
            ) : (
              <span>limit {s.limit === Infinity ? '∞' : s.limit}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
