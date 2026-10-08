import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, X, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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

interface CompactFilterBarProps {
  fields: FilterField[];
  onApply?: () => void;
  onClear?: () => void;
  className?: string;
  maxVisibleFilters?: number;
}

export function CompactFilterBar({ 
  fields, 
  onApply, 
  onClear,
  className,
  maxVisibleFilters = 6
}: CompactFilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasActiveFilters = fields.some(f => f.value !== "all");
  const activeCount = fields.filter(f => f.value !== "all").length;
  
  const visibleFields = isExpanded ? fields : fields.slice(0, maxVisibleFilters);
  const hasMoreFilters = fields.length > maxVisibleFilters;

  return (
    <div className={cn(
      "rounded-xl border bg-card/50 backdrop-blur-sm",
      "shadow-sm",
      className
    )}>
      <div className="flex items-center gap-3 px-4 py-2.5">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Filter size={14} />
          <span className="text-xs font-medium hidden sm:inline">Filters</span>
        </div>
        
        <div className="h-4 w-px bg-border" />
        
        <div className="flex-1 flex items-center gap-2 flex-wrap">
          {visibleFields.map((field) => (
            <div key={field.id} className="flex items-center">
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className={cn(
                  "h-7 text-xs font-medium rounded-lg border-dashed transition-all min-w-[100px] max-w-[160px]",
                  "bg-background/60 hover:bg-background",
                  field.value !== "all" 
                    ? "border-primary/50 bg-primary/5 text-primary" 
                    : "border-muted-foreground/30"
                )}>
                  <span className="truncate flex items-center gap-1.5">
                    {field.icon && <span className="opacity-60">{field.icon}</span>}
                    <span className="text-muted-foreground/70">{field.label}:</span>
                    <span className={field.value !== "all" ? "text-foreground font-semibold" : ""}>
                      {field.options.find(o => o.value === field.value)?.label || field.value}
                    </span>
                  </span>
                </SelectTrigger>
                <SelectContent className="rounded-lg shadow-lg">
                  {field.options.map((option) => (
                    <SelectItem 
                      key={option.value} 
                      value={option.value}
                      className="rounded-md text-xs"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
          
          {hasMoreFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              {isExpanded ? (
                <>
                  <ChevronUp size={12} className="mr-1" />
                  Less
                </>
              ) : (
                <>
                  <ChevronDown size={12} className="mr-1" />
                  +{fields.length - maxVisibleFilters} more
                </>
              )}
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Badge variant="secondary" className="h-5 px-2 text-[10px] font-medium">
              {activeCount} active
            </Badge>
          )}
          
          {hasActiveFilters && onClear && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onClear}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <X size={12} className="mr-1" />
              Clear
            </Button>
          )}
          
          {onApply && (
            <Button 
              size="sm"
              onClick={onApply}
              className="h-7 px-3 text-xs font-medium"
            >
              Apply
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

interface InlineFilterGroupProps {
  title?: string;
  fields: FilterField[];
  onApply?: () => void;
  onClear?: () => void;
  className?: string;
  actions?: ReactNode;
}

export function InlineFilterGroup({ 
  title,
  fields, 
  onApply, 
  onClear,
  className,
  actions
}: InlineFilterGroupProps) {
  const hasActiveFilters = fields.some(f => f.value !== "all");
  const activeCount = fields.filter(f => f.value !== "all").length;

  return (
    <div className={cn(
      "flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl",
      "bg-gradient-to-r from-slate-50/80 to-slate-100/50",
      "dark:from-slate-900/50 dark:to-slate-800/30",
      "border border-slate-200/60 dark:border-slate-700/40",
      className
    )}>
      {title && (
        <div className="flex items-center gap-2 shrink-0">
          <Filter size={14} className="text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {title}
          </span>
          {hasActiveFilters && (
            <Badge variant="secondary" className="h-4 px-1.5 text-[9px]">
              {activeCount}
            </Badge>
          )}
          <div className="h-4 w-px bg-border hidden sm:block" />
        </div>
      )}
      
      <div className="flex-1 flex items-center gap-2 flex-wrap">
        {fields.map((field) => (
          <Select key={field.id} value={field.value} onValueChange={field.onChange}>
            <SelectTrigger className={cn(
              "h-8 text-xs font-medium rounded-lg transition-all",
              "min-w-[110px] max-w-[180px]",
              "bg-white dark:bg-slate-800",
              "border-slate-200 dark:border-slate-600",
              "hover:border-slate-300 dark:hover:border-slate-500",
              field.value !== "all" && "border-primary/40 ring-1 ring-primary/20"
            )}>
              <span className="truncate">
                <span className="text-muted-foreground">{field.label}: </span>
                <span className={cn(
                  field.value !== "all" && "text-primary font-semibold"
                )}>
                  {field.options.find(o => o.value === field.value)?.label || "All"}
                </span>
              </span>
            </SelectTrigger>
            <SelectContent>
              {field.options.map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                  className="text-xs"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {hasActiveFilters && onClear && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onClear}
            className="h-7 px-2 text-xs"
          >
            <X size={12} className="mr-1" />
            Clear
          </Button>
        )}
        {onApply && (
          <Button size="sm" onClick={onApply} className="h-7 px-3 text-xs">
            Apply
          </Button>
        )}
        {actions}
      </div>
    </div>
  );
}

interface ChipFilterBarProps {
  fields: FilterField[];
  onClear?: () => void;
  className?: string;
}

export function ChipFilterBar({ 
  fields, 
  onClear,
  className 
}: ChipFilterBarProps) {
  const hasActiveFilters = fields.some(f => f.value !== "all");

  return (
    <div className={cn(
      "flex items-center gap-2 flex-wrap",
      className
    )}>
      {fields.map((field) => (
        <Select key={field.id} value={field.value} onValueChange={field.onChange}>
          <SelectTrigger className={cn(
            "h-8 px-3 text-xs font-medium rounded-full border transition-all",
            "bg-white dark:bg-slate-800",
            field.value !== "all" 
              ? "border-primary bg-primary/5 text-primary shadow-sm" 
              : "border-slate-200 dark:border-slate-600 text-muted-foreground"
          )}>
            <span className="flex items-center gap-1.5">
              {field.icon}
              <span>{field.label}</span>
              {field.value !== "all" && (
                <Badge variant="secondary" className="h-4 px-1 text-[9px] ml-1">
                  {field.options.find(o => o.value === field.value)?.label}
                </Badge>
              )}
            </span>
          </SelectTrigger>
          <SelectContent>
            {field.options.map((option) => (
              <SelectItem 
                key={option.value} 
                value={option.value}
                className="text-xs"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
      
      {hasActiveFilters && onClear && (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onClear}
          className="h-8 px-2 text-xs rounded-full"
        >
          <X size={12} className="mr-1" />
          Clear all
        </Button>
      )}
    </div>
  );
}
