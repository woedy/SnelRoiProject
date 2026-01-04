import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { Smartphone, ArrowLeft, CheckCircle, Star, Monitor, Tablet, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MobileFeature = () => {
  const { t } = useLanguage();

  const benefits = [
    { icon: CheckCircle, text: t('features.responsiveDesign') },
    { icon: CheckCircle, text: t('features.nativeMobile') },
    { icon: CheckCircle, text: t('features.touchOptimized') },
    { icon: CheckCircle, text: t('features.offlineFunctionality') },
    { icon: CheckCircle, text: t('features.mobilePushNotifications') },
    { icon: CheckCircle, text: t('features.biometricMobile') },
  ];

  const devices = [
    { icon: Smartphone, label: t('features.mobilePhones'), desc: t('features.mobilePhonesDesc') },
    { icon: Tablet, label: t('features.tablets'), desc: t('features.tabletsDesc') },
    { icon: Monitor, label: t('features.desktop'), desc: t('features.desktopDesc') },
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
            <Smartphone className="h-10 w-10 text-accent" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-4">
            {t('features.mobile.title')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {t('features.mobile.desc')}
          </p>
        </div>

        {/* Devices Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {devices.map((device, index) => (
            <div key={index} className="text-center p-6 rounded-2xl bg-card shadow-card">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <device.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-3">{device.label}</h3>
              <p className="text-sm text-muted-foreground">{device.desc}</p>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-16 mb-16">
          <div>
            <h2 className="text-2xl font-display font-semibold mb-6">{t('features.bankAnywhere')}</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              {t('features.mobileOverview')}
            </p>
            
            <h3 className="text-xl font-semibold mb-4">{t('features.mobileFeatures')}</h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <Star className="h-5 w-5 text-accent mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{t('features.nativeApps')}</span>
              </li>
              <li className="flex items-start">
                <Star className="h-5 w-5 text-accent mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{t('features.biometricSupport')}</span>
              </li>
              <li className="flex items-start">
                <Star className="h-5 w-5 text-accent mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{t('features.pushNotifications')}</span>
              </li>
              <li className="flex items-start">
                <Star className="h-5 w-5 text-accent mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{t('features.offlineViewing')}</span>
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
          <h2 className="text-2xl font-display font-semibold mb-6">{t('features.bankOnGo')}</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t('features.bankOnGoDesc')}
          </p>
          <Button size="lg" className="px-8">
            {t('features.downloadApp')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileFeature;
