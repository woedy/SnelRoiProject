import { cn } from "@/lib/utils"
import snelLogo from "@/assets/snel logo.png"

interface LoadingScreenProps {
  message?: string
  fullScreen?: boolean
  className?: string
}

export function LoadingScreen({ 
  message = "Loading...", 
  fullScreen = false,
  className 
}: LoadingScreenProps) {
  const containerClasses = fullScreen 
    ? "fixed inset-0 bg-white dark:bg-gray-900 z-50"
    : "w-full h-64"

  return (
    <div className={cn(
      "flex flex-col items-center justify-center",
      containerClasses,
      className
    )}>
      <div className="flex flex-col items-center space-y-4">
        {/* Animated Logo */}
        <div className="relative">
          <img 
            src={snelLogo} 
            alt="Snel ROI" 
            className="w-16 h-16 object-contain animate-pulse"
          />
          <div className="absolute inset-0 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        </div>
        
        {/* Loading Message */}
        <div className="text-center">
          <p className="text-lg font-medium text-gray-900 dark:text-white">
            {message}
          </p>
          <div className="flex justify-center mt-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function InlineLoader({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex items-center justify-center space-x-3 py-8">
      <img 
        src={snelLogo} 
        alt="Snel ROI" 
        className="w-8 h-8 object-contain animate-pulse"
      />
      <span className="text-gray-600 dark:text-gray-400">{message}</span>
    </div>
  )
}