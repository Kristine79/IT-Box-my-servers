'use client';

import { cn } from '@/lib/utils';

interface SkeletonCardProps {
  className?: string;
  rows?: number;
}

export function SkeletonCard({ className, rows = 3 }: SkeletonCardProps) {
  return (
    <div className={cn("neu-panel p-6 animate-pulse", className)}>
      <div className="flex items-start justify-between mb-4">
        <div className="neu-panel-inset p-3 rounded-full w-12 h-12" />
        <div className="flex gap-2">
          <div className="neu-panel-inset w-8 h-8 rounded-lg" />
          <div className="neu-panel-inset w-8 h-8 rounded-lg" />
        </div>
      </div>
      <div className="neu-panel-inset h-6 w-3/4 rounded mb-4" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="neu-panel-inset h-4 w-full rounded mb-2" />
      ))}
    </div>
  );
}

interface SkeletonListProps {
  count?: number;
  className?: string;
}

export function SkeletonList({ count = 3, className }: SkeletonListProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="neu-panel p-4 flex items-center gap-4 animate-pulse">
          <div className="neu-panel-inset p-3 rounded-full w-10 h-10 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="neu-panel-inset h-5 w-1/3 rounded" />
            <div className="neu-panel-inset h-4 w-1/2 rounded" />
          </div>
          <div className="flex gap-2">
            <div className="neu-panel-inset w-10 h-10 rounded-lg" />
            <div className="neu-panel-inset w-10 h-10 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonGrid({ count = 3, className }: SkeletonListProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
