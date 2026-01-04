import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { BarChart3, ArrowLeft, CheckCircle, Star, TrendingUp, Shield, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DashboardFeature = () => {
  const { t } = useLanguage();

  const benefits = [
    { icon: CheckCircle, text: t('features.benefit1') },
    { icon: CheckCircle, text: t('features.benefit2') },
    { icon: CheckCircle, text: t('features.benefit3') },
    { icon: CheckCircle, text: t('features.benefit4') },
    { icon: CheckCircle, text: t('features.benefit5') },
    { icon: CheckCircle, text: t('features.benefit6') },
  ];

  const stats = [
    { icon: TrendingUp, label: t('features.trackSpending'), value: '95%' },
    { icon: Shield, label: t('features.securityScore'), value: 'A+' },
    { icon: Users, label: t('features.userSatisfaction'), value: '4.9/5' },
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
            <BarChart3 className="h-10 w-10 text-accent" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-4">
            {t('features.dashboard.title')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {t('features.dashboard.desc')}
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
              {t('features.dashboardOverview')}
            </p>
            
            <h3 className="text-xl font-semibold mb-4">{t('features.keyFeatures')}</h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <Star className="h-5 w-5 text-accent mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{t('features.realtimeBalance')}</span>
              </li>
              <li className="flex items-start">
                <Star className="h-5 w-5 text-accent mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{t('features.interactiveCharts')}</span>
              </li>
              <li className="flex items-start">
                <Star className="h-5 w-5 text-accent mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{t('features.customizableAlerts')}</span>
              </li>
              <li className="flex items-start">
                <Star className="h-5 w-5 text-accent mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{t('features.budgetTracking')}</span>
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
          <h2 className="text-2xl font-display font-semibold mb-6">{t('features.readyToStart')}</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t('features.readyToStartDesc')}
          </p>
          <Button size="lg" className="px-8">
            {t('features.openFreeAccount')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardFeature;
