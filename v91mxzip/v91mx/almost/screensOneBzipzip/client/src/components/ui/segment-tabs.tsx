import * as React from "react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface SegmentTab {
  id: string
  label: string
  count?: number
  icon?: React.ReactNode
  color?: "default" | "blue" | "green" | "amber" | "rose"
}

interface SegmentTabsProps {
  tabs: SegmentTab[]
  activeTab: string
  onChange: (tabId: string) => void
  size?: "sm" | "md"
  variant?: "pills" | "underline" | "chips"
  className?: string
}

const colorVariants = {
  default: {
    active: "bg-slate-900 text-white dark:bg-white dark:text-slate-900",
    inactive: "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100",
    count: "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
  },
  blue: {
    active: "bg-blue-600 text-white dark:bg-blue-500",
    inactive: "text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300",
    count: "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
  },
  green: {
    active: "bg-emerald-600 text-white dark:bg-emerald-500",
    inactive: "text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300",
    count: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300"
  },
  amber: {
    active: "bg-amber-500 text-white dark:bg-amber-500",
    inactive: "text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300",
    count: "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300"
  },
  rose: {
    active: "bg-rose-600 text-white dark:bg-rose-500",
    inactive: "text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300",
    count: "bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300"
  }
}

export function SegmentTabs({
  tabs,
  activeTab,
  onChange,
  size = "md",
  variant = "pills",
  className
}: SegmentTabsProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [indicatorStyle, setIndicatorStyle] = React.useState({ left: 0, width: 0 })

  React.useEffect(() => {
    const updateIndicator = () => {
      const container = containerRef.current
      if (!container) return
      
      const activeButton = container.querySelector(`[data-tab="${activeTab}"]`) as HTMLElement
      if (activeButton) {
        setIndicatorStyle({
          left: activeButton.offsetLeft,
          width: activeButton.offsetWidth
        })
      }
    }
    
    updateIndicator()
    window.addEventListener('resize', updateIndicator)
    return () => window.removeEventListener('resize', updateIndicator)
  }, [activeTab])

  if (variant === "pills") {
    return (
      <div 
        ref={containerRef}
        className={cn(
          "relative inline-flex items-center p-1 rounded-full",
          "bg-slate-100/80 dark:bg-slate-800/80",
          "backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60",
          className
        )}
      >
        <motion.div
          className="absolute h-[calc(100%-8px)] rounded-full bg-white dark:bg-slate-700 shadow-sm"
          initial={false}
          animate={{
            left: indicatorStyle.left,
            width: indicatorStyle.width
          }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          const colors = colorVariants[tab.color || "default"]
          
          return (
            <button
              key={tab.id}
              data-tab={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                "relative z-10 flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold transition-colors duration-150 uppercase tracking-tight",
                size === "sm" && "px-2.5 py-0.5 text-[10px]",
                isActive 
                  ? "text-slate-900 dark:text-slate-100" 
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={cn(
                  "ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold tabular-nums",
                  isActive 
                    ? "bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200"
                    : "bg-slate-200/60 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400"
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          )
        })}
      </div>
    )
  }

  if (variant === "chips") {
    return (
      <div className={cn("inline-flex items-center gap-2 flex-wrap", className)}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          const colors = colorVariants[tab.color || "default"]
          
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium",
                "border-2 transition-all duration-150",
                size === "sm" && "px-2.5 py-1 text-xs",
                isActive 
                  ? cn(colors.active, "border-transparent shadow-sm")
                  : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
              )}
            >
              {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={cn(
                  "ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold tabular-nums",
                  isActive 
                    ? "bg-white/20 text-white"
                    : colors.count
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className={cn("relative inline-flex items-center border-b border-slate-200 dark:border-slate-700", className)}
    >
      <motion.div
        className="absolute bottom-0 h-0.5 bg-slate-900 dark:bg-white rounded-full"
        initial={false}
        animate={{
          left: indicatorStyle.left,
          width: indicatorStyle.width
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      />
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        
        return (
          <button
            key={tab.id}
            data-tab={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors duration-150",
              size === "sm" && "px-3 py-1.5 text-xs",
              isActive 
                ? "text-slate-900 dark:text-white" 
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            )}
          >
            {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={cn(
                "ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold tabular-nums",
                isActive 
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
              )}>
                {tab.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export { type SegmentTab, type SegmentTabsProps }
