import React from 'react';
import { Shield, Lock, Eye, Fingerprint, Server, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const Security = () => {
  const { t } = useLanguage();

  const features = [
    { icon: Lock, title: t('security.encryptionTitle'), desc: t('security.encryptionDesc') },
    { icon: Fingerprint, title: t('security.biometricTitle'), desc: t('security.biometricDesc') },
    { icon: Eye, title: t('security.fraudTitle'), desc: t('security.fraudDesc') },
    { icon: Server, title: t('security.infrastructureTitle'), desc: t('security.infrastructureDesc') },
  ];

  return (
    <div className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="h-10 w-10 text-accent" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-4">{t('security.pageTitle')}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('security.pageDesc')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {features.map((feature, i) => (
            <div key={i} className="flex gap-4 p-6 rounded-2xl bg-card shadow-card">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Security;
