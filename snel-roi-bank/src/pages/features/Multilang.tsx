import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { Languages, ArrowLeft, CheckCircle, Star, Globe, MessageSquare, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MultilangFeature = () => {
  const { t } = useLanguage();
  const benefits = [
    { icon: CheckCircle, text: t('features.support15Plus') },
    { icon: CheckCircle, text: t('features.realtimeSwitching') },
    { icon: CheckCircle, text: t('features.localizedCurrency') },
    { icon: CheckCircle, text: t('features.regionalDates') },
    { icon: CheckCircle, text: t('features.multilangCustomerSupport') },
    { icon: CheckCircle, text: t('features.culturalAdaptation') },
  ];

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
  ];

  return (
    <div className="py-20">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <Link to="/features" className="flex items-center text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('features.backToFeatures')}
          </Link>
        </nav>

        {/* Header */}
        <div className="text-center mb-16">
          <div className="w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
            <Languages className="h-10 w-10 text-accent" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-4">
            {t('features.multilang.title')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {t('features.multilang.desc')}
          </p>
        </div>

        {/* Languages Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          {languages.map((lang, index) => (
            <div key={index} className="text-center p-6 rounded-2xl bg-card shadow-card hover:shadow-xl transition-all">
              <div className="text-3xl mb-3">{lang.flag}</div>
              <div className="font-semibold mb-1">{lang.name}</div>
              <div className="text-sm text-muted-foreground">{lang.code}</div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-16 mb-16">
          <div>
            <h2 className="text-2xl font-display font-semibold mb-6">{t('features.globalAccessibility')}</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              {t('features.multilangOverview')}
            </p>
            
            <h3 className="text-xl font-semibold mb-4">{t('features.languageFeatures')}</h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <Star className="h-5 w-5 text-accent mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{t('features.completeTranslation')}</span>
              </li>
              <li className="flex items-start">
                <Star className="h-5 w-5 text-accent mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{t('features.localizedFormats')}</span>
              </li>
              <li className="flex items-start">
                <Star className="h-5 w-5 text-accent mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{t('features.multilangSupport')}</span>
              </li>
              <li className="flex items-start">
                <Star className="h-5 w-5 text-accent mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{t('features.culturalAwareness')}</span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-display font-semibold mb-6">{t('features.benefits')}</h2>
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start">
                  <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center mr-4 flex-shrink-0">
                    <benefit.icon className="h-4 w-4 text-success" />
                  </div>
                  <span className="text-muted-foreground">{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-display font-semibold mb-6">{t('features.bankInYourLanguage')}</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t('features.bankInYourLanguageDesc')}
          </p>
          <Button size="lg" className="px-8">
            {t('features.getStarted')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MultilangFeature;
