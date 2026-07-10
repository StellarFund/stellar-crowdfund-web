import { formatMilestoneStatus, milestoneStatusBadgeClasses } from "@/lib/format";
import type { MilestoneStatus as MilestoneStatusType } from "@/types";

interface MilestoneStatusProps {
  status: MilestoneStatusType;
}

export function MilestoneStatus({ status }: MilestoneStatusProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${milestoneStatusBadgeClasses(
        status
      )}`}
    >
      {formatMilestoneStatus(status)}
    </span>
  );
}
