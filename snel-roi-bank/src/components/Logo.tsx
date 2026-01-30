import React from 'react';
import { Link } from 'react-router-dom';
import SnelLogo from '@/assets/snel logo.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', variant = 'dark' }) => {
  const sizes = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const textColor = variant === 'light' ? 'text-primary-foreground' : 'text-primary';

  return (
    <Link to="/" className="flex items-center gap-3 group">
      <img 
        src={SnelLogo} 
        alt="Snel ROI Logo" 
        className={`${sizes[size]} w-auto object-contain transition-all group-hover:scale-105`}
      />
      <div className="flex flex-col leading-none">
        <span className={`font-display font-bold ${textSizes[size]} ${textColor} transition-colors group-hover:text-accent`}>
          Snel ROI
        </span>
        <span className={`text-sm ${textColor} opacity-70 transition-opacity group-hover:opacity-90 mt-1`}>
          Banking
        </span>
      </div>
    </Link>
  );
};
