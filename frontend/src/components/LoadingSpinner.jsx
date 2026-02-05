import { memo } from 'react';

const LoadingSpinner = memo(({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-12 h-12 border-4',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/50 z-50">
      <div
        className={`spinner ${sizeClasses[size]}`}
        role="status"
        aria-label="Загрузка"
      >
        <span className="sr-only">Загрузка...</span>
      </div>
    </div>
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner;
