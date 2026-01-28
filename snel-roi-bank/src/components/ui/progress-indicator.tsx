import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface Step {
  id: string;
  title: string;
  icon?: React.ReactNode;
}

interface ProgressIndicatorProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  steps,
  currentStep,
  className,
}) => {
  return (
    <div className={cn('flex items-center justify-between w-full', className)}>
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;
        const isUpcoming = stepNumber > currentStep;

        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              {/* Step Circle */}
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200',
                  {
                    'bg-primary text-primary-foreground': isCompleted,
                    'bg-primary text-primary-foreground ring-4 ring-primary/20': isCurrent,
                    'bg-muted text-muted-foreground': isUpcoming,
                  }
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  step.icon || stepNumber
                )}
              </div>
              
              {/* Step Title */}
              <span
                className={cn(
                  'mt-2 text-xs font-medium text-center',
                  {
                    'text-primary': isCompleted || isCurrent,
                    'text-muted-foreground': isUpcoming,
                  }
                )}
              >
                {step.title}
              </span>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-0.5 mx-4 transition-all duration-200',
                  {
                    'bg-primary': stepNumber < currentStep,
                    'bg-muted': stepNumber >= currentStep,
                  }
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};