import React from 'react';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  CreditCard, 
  ShoppingBag, 
  ShoppingCart,
  Banknote,
  Briefcase
} from 'lucide-react';

interface TransactionIconProps {
  type: string;
  size?: 'sm' | 'md' | 'lg';
}

export const TransactionIcon: React.FC<TransactionIconProps> = ({ type, size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const getIconConfig = () => {
    switch (type.toLowerCase()) {
      case 'deposit':
      case 'salary':
        return { icon: ArrowDownLeft, bg: 'bg-success/10', color: 'text-success' };
      case 'transfer':
      case 'withdrawal':
      case 'withdraw':
        return { icon: ArrowUpRight, bg: 'bg-info/10', color: 'text-info' };
      case 'payment':
      case 'utilities':
        return { icon: CreditCard, bg: 'bg-warning/10', color: 'text-warning' };
      case 'shopping':
        return { icon: ShoppingBag, bg: 'bg-accent/10', color: 'text-accent' };
      case 'groceries':
        return { icon: ShoppingCart, bg: 'bg-primary/10', color: 'text-primary' };
      case 'atm':
        return { icon: Banknote, bg: 'bg-muted', color: 'text-muted-foreground' };
      default:
        return { icon: CreditCard, bg: 'bg-secondary', color: 'text-secondary-foreground' };
    }
  };

  const config = getIconConfig();
  const Icon = config.icon;

  return (
    <div className={`${sizeClasses[size]} ${config.bg} rounded-xl flex items-center justify-center`}>
      <Icon className={`${iconSizes[size]} ${config.color}`} />
    </div>
  );
};
