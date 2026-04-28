import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-[var(--neu-bg)] shadow-[var(--neu-shadow-inset)]',
        className
      )}
    />
  );
}

export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={cn('neu-panel p-4 rounded-2xl', className)}>
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="flex-1">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-20 w-full rounded-xl" />
    </div>
  );
}

export function SkeletonStats({ className }: SkeletonProps) {
  return (
    <div className={cn('grid grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="neu-panel p-4 rounded-2xl">
          <Skeleton className="h-8 w-12 mb-2" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}
