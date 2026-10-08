import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterField {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  icon?: ReactNode;
}

interface FilterCardProps {
  title?: string;
  fields: FilterField[];
  onApply?: () => void;
  onClear?: () => void;
  className?: string;
  compact?: boolean;
}

export function FilterCard({ 
  title = "Filters", 
  fields, 
  onApply, 
  onClear,
  className,
  compact = false
}: FilterCardProps) {
  const hasActiveFilters = fields.some(f => f.value !== "all");
  const activeCount = fields.filter(f => f.value !== "all").length;

  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl",
      "bg-gradient-to-br from-white/90 via-white/80 to-white/70",
      "dark:from-slate-900/90 dark:via-slate-900/80 dark:to-slate-800/70",
      "backdrop-blur-xl border border-white/20 dark:border-slate-700/50",
      "shadow-[0_8px_32px_-8px_rgba(0,0,0,0.12)]",
      "dark:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.4)]",
      className
    )}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-primary/[0.03] pointer-events-none" />
      
      <div className="relative">
        <div className={cn(
          "flex items-center justify-between gap-4",
          compact ? "px-4 py-3" : "px-5 py-4",
          "border-b border-slate-200/60 dark:border-slate-700/40"
        )}>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10">
              <Filter size={16} className="text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">{title}</h3>
              {hasActiveFilters && (
                <p className="text-[10px] text-primary font-medium mt-0.5">
                  {activeCount} filter{activeCount !== 1 ? 's' : ''} active
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {hasActiveFilters && onClear && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onClear}
                className="h-8 px-3 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
              >
                <X size={14} className="mr-1.5" />
                Clear
              </Button>
            )}
            {onApply && (
              <Button 
                size="sm"
                onClick={onApply}
                className="h-8 px-4 text-xs font-medium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground rounded-lg shadow-md shadow-primary/20 transition-all"
              >
                Apply
              </Button>
            )}
          </div>
        </div>

        <div className={cn(
          "grid gap-4",
          compact ? "p-4" : "p-5",
          fields.length <= 3 ? "grid-cols-1 sm:grid-cols-3" :
          fields.length === 4 ? "grid-cols-2 lg:grid-cols-4" :
          "grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
        )}>
          {fields.map((field) => (
            <div key={field.id} className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                {field.icon}
                {field.label}
              </label>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className={cn(
                  "h-10 text-sm font-medium rounded-xl transition-all duration-200",
                  "bg-white/60 dark:bg-slate-800/60",
                  "border-slate-200/80 dark:border-slate-600/50",
                  "hover:bg-white dark:hover:bg-slate-800",
                  "hover:border-primary/30 dark:hover:border-primary/40",
                  "focus:ring-2 focus:ring-primary/20 focus:border-primary/50",
                  "shadow-sm hover:shadow-md",
                  field.value !== "all" && "border-primary/40 bg-primary/5 dark:bg-primary/10"
                )}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200/80 dark:border-slate-600/50 shadow-xl">
                  {field.options.map((option) => (
                    <SelectItem 
                      key={option.value} 
                      value={option.value}
                      className="rounded-lg focus:bg-primary/10 focus:text-primary"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface ToolbarFilterProps {
  icon?: ReactNode;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  className?: string;
}

export function ToolbarFilter({ icon, label, value, onChange, options, className }: ToolbarFilterProps) {
  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-2 rounded-xl",
      "bg-white/70 dark:bg-slate-800/70",
      "border border-slate-200/60 dark:border-slate-600/40",
      "shadow-sm backdrop-blur-sm",
      className
    )}>
      {icon && <span className="text-muted-foreground">{icon}</span>}
      {label && <span className="text-xs text-muted-foreground font-medium">{label}</span>}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-7 min-w-[80px] border-0 bg-transparent focus:ring-0 text-xs font-medium p-0 gap-1">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="rounded-xl shadow-xl">
          {options.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value}
              className="rounded-lg text-xs"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

interface ToggleGroupProps {
  options: { value: string; label: string; icon?: ReactNode }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  showLabel?: boolean;
}

export function ToggleGroup({ options, value, onChange, className, showLabel = false }: ToggleGroupProps) {
  return (
    <div className="flex items-center gap-2">
      {showLabel && (
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
          Aggregate by
        </span>
      )}
      <div className={cn(
        "flex items-center p-1 rounded-xl",
        "bg-slate-100/80 dark:bg-slate-800/80",
        "border border-slate-200/60 dark:border-slate-600/40",
        className
      )}>
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200",
              value === option.value
                ? "bg-white dark:bg-slate-700 text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-slate-700/50"
            )}
          >
            {option.icon}
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
