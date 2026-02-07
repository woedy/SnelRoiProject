import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { BarChart3, Send, PiggyBank, Lock, FileText, Languages, Smartphone, Globe, CreditCard, ArrowRight } from 'lucide-react';

const Features = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: BarChart3,
      title: t('features.dashboard.title'),
      desc: t('features.dashboard.desc'),
      link: '/features/dashboard'
    },
    {
      icon: Send,
      title: t('features.transfers.title'),
      desc: t('features.transfers.desc'),
      link: '/features/transfers'
    },
    {
      icon: PiggyBank,
      title: t('features.savings.title'),
      desc: t('features.savings.desc'),
      link: '/features/savings'
    },
    {
      icon: Lock,
      title: t('features.security.title'),
      desc: t('features.security.desc'),
      link: '/features/security'
    },
    {
      icon: FileText,
      title: t('features.statements.title'),
      desc: t('features.statements.desc'),
      link: '/features/statements'
    },
    {
      icon: Languages,
      title: t('features.multilang.title'),
      desc: t('features.multilang.desc'),
      link: '/features/multilang'
    },
    {
      icon: Smartphone,
      title: t('features.mobile.title'),
      desc: t('features.mobile.desc'),
      link: '/features/mobile'
    },
    {
      icon: Globe,
      title: t('features.global.title'),
      desc: t('features.global.desc'),
      link: '/features/global'
    },
    {
      icon: CreditCard,
      title: t('features.virtual.title'),
      desc: t('features.virtual.desc'),
      link: '/features/virtual-cards'
    },
  ];

  return (
    <div className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-4">
            {t('features.title')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('features.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Link
              key={index}
              to={feature.link}
              className="group p-8 rounded-2xl bg-card shadow-card hover:shadow-xl transition-all block hover:scale-105"
            >
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
                <feature.icon className="h-7 w-7 text-accent" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-3 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-muted-foreground mb-4">{feature.desc}</p>
              <div className="flex items-center text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-sm font-medium">{t('features.learnMore')}</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;
