import { LoadingScreen } from "./loading-screen"

interface PageLoaderProps {
  message?: string
}

export function PageLoader({ message }: PageLoaderProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <LoadingScreen 
        message={message || "Loading admin dashboard..."}
        fullScreen
      />
    </div>
  )
}