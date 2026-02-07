import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useLanguage } from '@/context/LanguageContext';
import { Logo } from '@/components/Logo';
import { LanguageSwitch } from '@/components/LanguageSwitch';

const NotFound = () => {
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted relative">
      <div className="absolute top-4 right-4">
        <LanguageSwitch />
      </div>
      <div className="text-center">
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>
        <h1 className="mb-4 text-4xl font-bold">{t('notfound.title')}</h1>
        <p className="mb-4 text-xl text-muted-foreground">{t('notfound.message')}</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          {t('notfound.returnHome')}
        </a>
      </div>
    </div>
  );
};

export default NotFound;
