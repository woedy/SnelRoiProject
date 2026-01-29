import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  showLabel?: boolean
  size?: "sm" | "md" | "lg"
}

const ProgressIndicator = React.forwardRef<HTMLDivElement, ProgressIndicatorProps>(
  ({ className, value, max = 100, showLabel = true, size = "md", ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
    
    const sizeClasses = {
      sm: "h-2",
      md: "h-3",
      lg: "h-4"
    }

    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        {showLabel && (
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Profile Completion</span>
            <span>{Math.round(percentage)}%</span>
          </div>
        )}
        <div className={cn("w-full bg-secondary rounded-full overflow-hidden", sizeClasses[size])}>
          <div
            className="h-full bg-primary transition-all duration-300 ease-in-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    )
  }
)
ProgressIndicator.displayName = "ProgressIndicator"

export { ProgressIndicator }