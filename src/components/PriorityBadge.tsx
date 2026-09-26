import { PRIORITY_COLOR, PRIORITY_LABEL } from "@/lib/constants";
import type { Priority } from "@/generated/prisma/enums";

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span
      className="shrink-0 whitespace-nowrap rounded-full px-2.5 py-[3px] text-[10px] font-bold text-white"
      style={{ background: PRIORITY_COLOR[priority] }}
    >
      {PRIORITY_LABEL[priority]}
    </span>
  );
}
