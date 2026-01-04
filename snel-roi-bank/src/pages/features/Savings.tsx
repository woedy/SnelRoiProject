import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { PiggyBank, ArrowLeft, CheckCircle, Star, TrendingUp, Shield, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SavingsFeature = () => {
  const { t } = useLanguage();

  const benefits = [
    { icon: CheckCircle, text: t('features.automatedPlans') },
    { icon: CheckCircle, text: t('features.goalBasedSaving') },
    { icon: CheckCircle, text: t('features.roundupPurchases') },
    { icon: CheckCircle, text: t('features.interestAccounts') },
    { icon: CheckCircle, text: t('features.savingsAnalytics') },
    { icon: CheckCircle, text: t('features.withdrawalFlexibility') },
  ];

  const stats = [
    { icon: Target, label: t('features.successRate'), value: '87%' },
    { icon: TrendingUp, label: t('features.avgReturn'), value: '2.5%' },
    { icon: Shield, label: t('features.protection'), value: 'FDIC' },
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
            <PiggyBank className="h-10 w-10 text-accent" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-4">
            {t('features.savings.title')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {t('features.savings.desc')}
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center p-6 rounded-2xl bg-card shadow-card">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="text-2xl font-bold text-primary mb-2">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-16 mb-16">
          <div>
            <h2 className="text-2xl font-display font-semibold mb-6">{t('features.overview')}</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              {t('features.savingsOverview')}
            </p>
            
            <h3 className="text-xl font-semibold mb-4">{t('features.keyFeatures')}</h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <Star className="h-5 w-5 text-accent mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{t('features.customGoals')}</span>
              </li>
              <li className="flex items-start">
                <Star className="h-5 w-5 text-accent mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{t('features.roundupSavings')}</span>
              </li>
              <li className="flex items-start">
                <Star className="h-5 w-5 text-accent mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{t('features.progressTracking')}</span>
              </li>
              <li className="flex items-start">
                <Star className="h-5 w-5 text-accent mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{t('features.flexibleTerms')}</span>
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
          <h2 className="text-2xl font-display font-semibold mb-6">{t('features.startSavingSmarter')}</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t('features.startSavingSmarterDesc')}
          </p>
          <Button size="lg" className="px-8">
            {t('features.startSaving')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SavingsFeature;
