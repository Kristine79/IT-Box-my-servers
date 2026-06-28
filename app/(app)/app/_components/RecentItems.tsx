'use client';

import Link from 'next/link';
import { FolderKanban, Server, Network } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Project {
  id: string;
  name?: string;
  description?: string;
  status?: string;
}

interface ServerItem {
  id: string;
  name?: string;
  ipAddress?: string;
}

interface RecentItemsProps {
  recentProjects: Project[];
  recentServers: ServerItem[];
}

export function RecentItems({ recentProjects, recentServers }: RecentItemsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Recent Projects */}
      <div className="neu-panel p-4">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <FolderKanban className="w-4 h-4" /> Recent Projects
        </h3>
        {recentProjects.length === 0 ? (
          <p className="text-xs text-[var(--muted-foreground)]">No projects yet</p>
        ) : (
          <ul className="space-y-2">
            {recentProjects.slice(0, 5).map((p) => (
              <li key={p.id}>
                <Link
                  href={`/projects?id=${p.id}`}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-[var(--neu-surface)] transition-colors"
                >
                  <FolderKanban className="w-4 h-4 text-blue-500" />
                  <span className="text-sm truncate">{p.name || 'Untitled'}</span>
                  <Badge variant="outline" className="ml-auto text-[10px] capitalize">
                    {p.status || 'active'}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Recent Servers */}
      <div className="neu-panel p-4">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Server className="w-4 h-4" /> Recent Servers
        </h3>
        {recentServers.length === 0 ? (
          <p className="text-xs text-[var(--muted-foreground)]">No servers yet</p>
        ) : (
          <ul className="space-y-2">
            {recentServers.slice(0, 5).map((s) => (
              <li key={s.id}>
                <Link
                  href={`/servers?id=${s.id}`}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-[var(--neu-surface)] transition-colors"
                >
                  <Server className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm truncate">{s.name || s.ipAddress || 'Untitled'}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
