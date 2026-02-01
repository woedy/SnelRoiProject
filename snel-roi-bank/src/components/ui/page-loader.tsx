import { LoadingScreen } from "./loading-screen"

interface PageLoaderProps {
  message?: string
}

export function PageLoader({ message }: PageLoaderProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <LoadingScreen 
        message={message || "Loading your banking dashboard..."}
        fullScreen
      />
    </div>
  )
}