import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { Lock, ArrowLeft, CheckCircle, Star, Shield, Fingerprint, Eye, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SecurityFeature = () => {
  const { t } = useLanguage();

  const benefits = [
    { icon: CheckCircle, text: t('features.encryption256') },
    { icon: CheckCircle, text: t('features.biometricAuth') },
    { icon: CheckCircle, text: t('features.twoFactorAuth') },
    { icon: CheckCircle, text: t('features.fraudDetection') },
    { icon: CheckCircle, text: t('features.secureLogin') },
    { icon: CheckCircle, text: t('features.accountProtection') },
  ];

  const features = [
    { icon: Shield, label: t('features.bankGradeSecurity'), desc: t('features.militaryGrade') },
    { icon: Fingerprint, label: t('features.biometricLogin'), desc: t('features.faceIdFingerprint') },
    { icon: Eye, label: t('features.transactionMonitoring'), desc: t('features.realtimeFraud') },
    { icon: Key, label: t('features.secureAccess'), desc: t('features.multiFactorAuth') },
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
            <Lock className="h-10 w-10 text-accent" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-4">
            {t('features.security.title')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {t('features.security.desc')}
          </p>
        </div>

        {/* Security Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="p-8 rounded-2xl bg-card shadow-card hover:shadow-xl transition-all">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <feature.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-3">{feature.label}</h3>
              <p className="text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-16 mb-16">
          <div>
            <h2 className="text-2xl font-display font-semibold mb-6">{t('features.advancedProtection')}</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              {t('features.securityOverview')}
            </p>
            
            <h3 className="text-xl font-semibold mb-4">{t('features.securityMeasures')}</h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <Star className="h-5 w-5 text-accent mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{t('features.endToEndEncryption')}</span>
              </li>
              <li className="flex items-start">
                <Star className="h-5 w-5 text-accent mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{t('features.fraudMonitoring')}</span>
              </li>
              <li className="flex items-start">
                <Star className="h-5 w-5 text-accent mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{t('features.sessionTimeout')}</span>
              </li>
              <li className="flex items-start">
                <Star className="h-5 w-5 text-accent mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{t('features.fdicInsurance')}</span>
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
          <h2 className="text-2xl font-display font-semibold mb-6">{t('features.bankWithConfidence')}</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t('features.bankWithConfidenceDesc')}
          </p>
          <Button size="lg" className="px-8">
            {t('features.openSecureAccount')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SecurityFeature;
