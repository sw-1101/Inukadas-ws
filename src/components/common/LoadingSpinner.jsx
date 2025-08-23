// ローディング表示コンポーネント
import React from 'react'


const LoadingSpinner= ({ 
  message = 'Loading...', 
  size = 40 
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-48 gap-4">
      <div 
        className="animate-spin rounded-full border-4 border-main-light border-t-main-primary"
        style={{ width: size, height: size }}
      />
      {message && (
        <p className="text-base-text-secondary text-sm">
          {message}
        </p>
      )}
    </div>
  )
}

export default LoadingSpinner