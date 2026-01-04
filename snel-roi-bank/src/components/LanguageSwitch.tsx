import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { languages, Language } from '@/i18n/translations';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

interface LanguageSwitchProps {
  variant?: 'default' | 'compact';
}

export const LanguageSwitch: React.FC<LanguageSwitchProps> = ({ variant = 'default' }) => {
  const { language, setLanguage } = useLanguage();
  const currentLang = languages.find(l => l.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size={variant === 'compact' ? 'sm' : 'default'} className="gap-2">
          <Globe className="h-4 w-4" />
          {variant === 'default' && (
            <span className="hidden sm:inline">{currentLang?.flag} {currentLang?.code.toUpperCase()}</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-card border shadow-lg">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`cursor-pointer ${language === lang.code ? 'bg-secondary' : ''}`}
          >
            <span className="mr-2">{lang.flag}</span>
            <span>{lang.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
