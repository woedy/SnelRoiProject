import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Shield, TrendingUp } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', variant = 'dark' }) => {
  const sizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const containerSizes = {
    sm: 'h-7 w-7',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const textColor = variant === 'light' ? 'text-primary-foreground' : 'text-primary';
  const containerBg = variant === 'light' 
    ? 'bg-gradient-to-br from-primary-foreground to-primary-foreground/80' 
    : 'bg-gradient-to-br from-primary to-primary/80';
  const iconColor = variant === 'light' ? 'text-primary' : 'text-primary-foreground';

  return (
    <Link to="/" className="flex items-center gap-2 group">
      <div className={`${containerBg} ${containerSizes[size]} rounded-xl flex items-center justify-center transition-all group-hover:scale-105 shadow-sm group-hover:shadow-md`}>
        <Building2 className={`${iconSizes[size]} ${iconColor}`} />
      </div>
      <div className="flex flex-col leading-none">
        <span className={`font-display font-bold ${sizes[size]} ${textColor} transition-colors group-hover:text-accent`}>
          Snel Roi
        </span>
        <span className={`text-sm ${textColor} opacity-70 transition-opacity group-hover:opacity-90 mt-1`}>
          Banking
        </span>
      </div>
    </Link>
  );
};
