import { cn } from "@/lib/utils";

interface SubjectChipProps {
  name: string;
  color: string;
  className?: string;
}

export function SubjectChip({ name, color, className }: SubjectChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold shadow-sm border border-black/5",
        className
      )}
      style={{
        backgroundColor: color + '20', // 20 hex = ~12% opacity
        color: color,
        borderColor: color + '40'
      }}
    >
      <span 
        className="w-1.5 h-1.5 rounded-full mr-1.5"
        style={{ backgroundColor: color }}
      />
      {name}
    </span>
  );
}
