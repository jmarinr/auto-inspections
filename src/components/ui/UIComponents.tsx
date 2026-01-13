import React from 'react';

// Card Component
interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  onClick,
}) => {
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-xl ${paddingStyles[padding]} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

// Badge Component
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'error' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
}) => {
  const variantStyles = {
    info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    error: 'bg-red-500/20 text-red-400 border-red-500/30',
    neutral: 'bg-dark-600/50 text-dark-300 border-dark-500',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};

// Progress Bar Component
interface ProgressBarProps {
  progress: number;
  showLabel?: boolean;
  size?: 'sm' | 'md';
  color?: 'primary' | 'success' | 'warning';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  showLabel = false,
  size = 'sm',
  color = 'primary',
}) => {
  const sizeStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
  };

  const colorStyles = {
    primary: 'from-primary-600 to-primary-400',
    success: 'from-emerald-600 to-emerald-400',
    warning: 'from-amber-600 to-amber-400',
  };

  return (
    <div className="w-full">
      <div className={`${sizeStyles[size]} bg-dark-700 rounded-full overflow-hidden`}>
        <div
          className={`h-full bg-gradient-to-r ${colorStyles[color]} transition-all duration-500`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-sm text-dark-400 mt-1 text-right">
          {Math.round(progress)}%
        </p>
      )}
    </div>
  );
};

// Alert Component
interface AlertProps {
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'error';
  icon?: React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  children,
  variant = 'info',
  icon,
  className = '',
}) => {
  const variantStyles = {
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
    error: 'bg-red-500/10 border-red-500/30 text-red-300',
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border ${variantStyles[variant]} ${className}`}
    >
      {icon && <span className="flex-shrink-0 mt-0.5">{icon}</span>}
      <div className="text-sm">{children}</div>
    </div>
  );
};

// Divider Component
interface DividerProps {
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({ className = '' }) => {
  return <hr className={`border-dark-700 ${className}`} />;
};

// Skeleton Component
interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
}) => {
  const variantStyles = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  return (
    <div
      className={`animate-pulse bg-dark-700 ${variantStyles[variant]} ${className}`}
    />
  );
};

// Loading Overlay
interface LoadingOverlayProps {
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  message = 'Procesando...',
}) => {
  return (
    <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white font-medium">{message}</p>
      </div>
    </div>
  );
};
