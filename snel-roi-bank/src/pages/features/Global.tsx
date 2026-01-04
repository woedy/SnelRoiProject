import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { Globe, ArrowLeft, CheckCircle, Star, Clock, Shield, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

const GlobalFeature = () => {
  const benefits = [
    { icon: CheckCircle, text: '24/7 worldwide access' },
    { icon: CheckCircle, text: '150+ countries supported' },
    { icon: CheckCircle, text: 'Multi-currency accounts' },
    { icon: CheckCircle, text: 'Global ATM network' },
    { icon: CheckCircle, text: 'International transfers' },
    { icon: CheckCircle, text: 'Localized banking services' },
  ];

  const regions = [
    { region: 'North America', countries: 'USA, Canada, Mexico', flag: '🌎' },
    { region: 'Europe', countries: 'UK, Germany, France, Spain', flag: '🌍' },
    { region: 'Asia Pacific', countries: 'Japan, Australia, Singapore', flag: '🌏' },
    { region: 'Latin America', countries: 'Brazil, Argentina, Chile', flag: '🌎' },
  ];

  return (
    <div className="py-20">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <Link to="/features" className="flex items-center text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Features
          </Link>
        </nav>

        {/* Header */}
        <div className="text-center mb-16">
          <div className="w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
            <Globe className="h-10 w-10 text-accent" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-4">
            Global Access
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Bank from anywhere in the world, 24/7
          </p>
        </div>

        {/* Regions Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {regions.map((region, index) => (
            <div key={index} className="text-center p-6 rounded-2xl bg-card shadow-card">
              <div className="text-3xl mb-3">{region.flag}</div>
              <h3 className="font-semibold mb-2">{region.region}</h3>
              <p className="text-sm text-muted-foreground">{region.countries}</p>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-16 mb-16">
          <div>
            <h2 className="text-2xl font-display font-semibold mb-6">Worldwide Banking</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Your financial life doesn't stop at borders. Neither should your banking. 
              Snel Roi provides seamless global access to your accounts, ensuring you can 
              manage your money wherever life takes you.
            </p>
            
            <h3 className="text-xl font-semibold mb-4">Global Features</h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <Star className="h-5 w-5 text-accent mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">Access in 150+ countries</span>
              </li>
              <li className="flex items-start">
                <Star className="h-5 w-5 text-accent mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">Multi-currency support</span>
              </li>
              <li className="flex items-start">
                <Star className="h-5 w-5 text-accent mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">International ATM network</span>
              </li>
              <li className="flex items-start">
                <Star className="h-5 w-5 text-accent mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">24/7 global support</span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-display font-semibold mb-6">Benefits</h2>
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
          <h2 className="text-2xl font-display font-semibold mb-6">Go global with Snel Roi</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Experience true global banking. Join millions who access their accounts 
            from every corner of the world.
          </p>
          <Button size="lg" className="px-8">
            Start Global Banking
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GlobalFeature;
