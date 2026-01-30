import * as React from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface Step {
  id: string
  title: string
  icon: React.ReactNode
}

interface StepProgressIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  steps: Step[]
  currentStep: number
}

interface ProgressIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  showLabel?: boolean
  size?: "sm" | "md" | "lg"
}

const StepProgressIndicator = React.forwardRef<HTMLDivElement, StepProgressIndicatorProps>(
  ({ className, steps, currentStep, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const stepNumber = index + 1
            const isCompleted = stepNumber < currentStep
            const isCurrent = stepNumber === currentStep
            const isUpcoming = stepNumber > currentStep

            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200",
                      {
                        "bg-primary text-primary-foreground": isCompleted,
                        "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2": isCurrent,
                        "bg-muted text-muted-foreground": isUpcoming,
                      }
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      step.icon
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-xs mt-2 font-medium transition-colors duration-200",
                      {
                        "text-primary": isCompleted || isCurrent,
                        "text-muted-foreground": isUpcoming,
                      }
                    )}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-0.5 mx-4 transition-colors duration-200",
                      {
                        "bg-primary": stepNumber < currentStep,
                        "bg-muted": stepNumber >= currentStep,
                      }
                    )}
                  />
                )}
              </React.Fragment>
            )
          })}
        </div>
      </div>
    )
  }
)
StepProgressIndicator.displayName = "StepProgressIndicator"

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

export { ProgressIndicator, StepProgressIndicator }