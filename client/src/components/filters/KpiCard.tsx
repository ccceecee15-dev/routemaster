import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: ReactNode;
  variant?: "default" | "success" | "warning" | "info";
  className?: string;
  compact?: boolean;
}

export function KpiCard({ 
  title, 
  value, 
  change, 
  changeLabel = "vs LY",
  icon,
  variant = "default",
  className,
  compact = false
}: KpiCardProps) {
  const isPositive = change !== undefined && change >= 0;
  
  const variantStyles = {
    default: "from-white/90 to-white/70 dark:from-slate-900/90 dark:to-slate-800/70",
    success: "from-emerald-50/90 to-emerald-50/50 dark:from-emerald-950/40 dark:to-emerald-900/20",
    warning: "from-amber-50/90 to-amber-50/50 dark:from-amber-950/40 dark:to-amber-900/20",
    info: "from-blue-50/90 to-blue-50/50 dark:from-blue-950/40 dark:to-blue-900/20",
  };

  const accentStyles = {
    default: "from-primary/10 to-primary/5",
    success: "from-emerald-500/10 to-emerald-500/5",
    warning: "from-amber-500/10 to-amber-500/5",
    info: "from-blue-500/10 to-blue-500/5",
  };

  const accentColors = {
    default: "bg-primary/10 text-primary",
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    info: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  };

  if (compact) {
    return (
      <div className={cn(
        "relative overflow-hidden rounded-xl px-4 py-2.5",
        "bg-gradient-to-r",
        variantStyles[variant],
        "backdrop-blur-xl border border-white/20 dark:border-slate-700/50",
        "shadow-sm hover:shadow-md transition-all duration-200",
        "group",
        className
      )}>
        <div className="flex items-center gap-3">
          {icon && (
            <div className={cn(
              "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
              accentColors[variant]
            )}>
              {icon}
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
                {title}
              </span>
              {change !== undefined && (
                <div className={cn(
                  "flex items-center gap-1 text-[10px] font-medium flex-shrink-0",
                  isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                )}>
                  {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  <span>{isPositive ? '+' : ''}{change.toFixed(1)}% {changeLabel}</span>
                </div>
              )}
            </div>
            <div className="text-lg font-bold text-foreground tracking-tight leading-tight">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl px-4 py-3",
      "bg-gradient-to-r",
      variantStyles[variant],
      "backdrop-blur-xl border border-white/20 dark:border-slate-700/50",
      "shadow-sm hover:shadow-md transition-all duration-200",
      "group",
      className
    )}>
      <div className={cn(
        "absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-50 -translate-y-1/2 translate-x-1/2",
        "bg-gradient-to-br",
        accentStyles[variant]
      )} />
      
      <div className="relative flex items-center gap-3">
        {icon && (
          <div className={cn(
            "flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center",
            accentColors[variant]
          )}>
            {icon}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            {title}
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-xl font-bold text-foreground tracking-tight">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </span>
            {change !== undefined && (
              <div className={cn(
                "flex items-center gap-1 text-xs font-medium",
                isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
              )}>
                {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                <span>{isPositive ? '+' : ''}{change.toFixed(1)}% {changeLabel}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
