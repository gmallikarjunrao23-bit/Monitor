export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton animate-shimmer rounded-md ${className}`} />;
}

export function CardSkeleton() {
  return (
    <div className="rounded-card border border-border bg-surface p-5">
      <div className="flex items-center gap-2">
        <Skeleton className="h-2 w-2 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="mt-2 h-3 w-24" />
      <Skeleton className="mt-4 h-8 w-full" />
      <Skeleton className="mt-3 h-3 w-full" />
    </div>
  );
}
