import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "whitespace-nowrap inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-200",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-lg glow-primary",
        secondary:
          "border-transparent bg-secondary/80 text-secondary-foreground backdrop-blur-sm",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow-lg",
        outline: 
          "text-foreground border-border/60 bg-background/50 backdrop-blur-sm",
        success:
          "border-transparent bg-emerald-500/90 text-white shadow-lg shadow-emerald-500/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
