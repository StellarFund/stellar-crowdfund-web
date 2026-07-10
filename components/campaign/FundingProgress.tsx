import { formatPercentage } from "@/lib/format";

interface FundingProgressProps {
  raised: number;
  goal: number;
  className?: string;
  showLabel?: boolean;
}

export function FundingProgress({ raised, goal, className = "", showLabel = true }: FundingProgressProps) {
  const percentage = formatPercentage(raised, goal);

  return (
    <div className={className}>
      {showLabel && (
        <div className="mb-1.5 flex items-baseline justify-between text-sm">
          <span className="font-semibold text-foreground">{percentage}% funded</span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-surface-raised">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent transition-all duration-500"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
