import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { LanguageSwitch } from '@/components/LanguageSwitch';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { Menu, X } from 'lucide-react';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  const { t } = useLanguage();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { path: '/features', label: t('nav.features') },
    { path: '/security', label: t('nav.security') },
    { path: '/faq', label: t('nav.faq') },
    { path: '/contact', label: t('nav.contact') },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Logo />

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname === link.path
                      ? 'text-primary'
                      : 'text-muted-foreground'
                    }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <LanguageSwitch />
              <Link to="/login" className="hidden sm:block">
                <Button variant="ghost" size="sm">
                  {t('nav.login')}
                </Button>
              </Link>
              <Link to="/register" className="hidden sm:block">
                <Button size="sm">{t('nav.register')}</Button>
              </Link>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-background border-t border-border animate-slide-down">
            <nav className="container mx-auto px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === link.path
                      ? 'bg-secondary text-primary'
                      : 'text-muted-foreground hover:bg-secondary'
                    }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-border space-y-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    {t('nav.login')}
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full">{t('nav.register')}</Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <Logo variant="light" />
              <p className="mt-4 text-primary-foreground/70 text-sm">
                {t('footer.tagline')}
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">{t('footer.company')}</h4>
              <ul className="space-y-2 text-sm text-primary-foreground/70">
                <li><Link to="/about" className="hover:text-primary-foreground">{t('footer.about')}</Link></li>
                <li><Link to="/careers" className="hover:text-primary-foreground">{t('footer.careers')}</Link></li>
                <li><Link to="/press" className="hover:text-primary-foreground">{t('footer.press')}</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">{t('footer.legal')}</h4>
              <ul className="space-y-2 text-sm text-primary-foreground/70">
                <li><Link to="/terms" className="hover:text-primary-foreground">{t('footer.terms')}</Link></li>
                <li><Link to="/privacy" className="hover:text-primary-foreground">{t('footer.privacy')}</Link></li>
                <li><Link to="/cookies" className="hover:text-primary-foreground">{t('footer.cookies')}</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">{t('footer.support')}</h4>
              <ul className="space-y-2 text-sm text-primary-foreground/70">
                <li><Link to="/help" className="hover:text-primary-foreground">{t('footer.help')}</Link></li>
                <li><Link to="/contact" className="hover:text-primary-foreground">{t('footer.contactUs')}</Link></li>
                <li><Link to="/status" className="hover:text-primary-foreground">{t('footer.status')}</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-primary-foreground/10 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-primary-foreground/50">
              {t('footer.rights')}
            </p>
            <div className="flex gap-4">
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
