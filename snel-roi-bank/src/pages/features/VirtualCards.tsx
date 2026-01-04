import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { CreditCard, ArrowLeft, CheckCircle, Star, Shield, ShoppingBag, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

const VirtualCardsFeature = () => {
  const benefits = [
    { icon: CheckCircle, text: 'Instant card creation' },
    { icon: CheckCircle, text: 'Enhanced security features' },
    { icon: CheckCircle, text: 'Custom spending limits' },
    { icon: CheckCircle, text: 'Virtual card numbers' },
    { icon: CheckCircle, text: 'Easy card management' },
    { icon: CheckCircle, text: 'Transaction notifications' },
  ];

  const features = [
    { icon: Shield, label: 'Secure Shopping', desc: 'Protected online purchases with advanced security' },
    { icon: ShoppingBag, label: 'Online Ready', desc: 'Perfect for digital and e-commerce transactions' },
    { icon: Smartphone, label: 'Mobile Control', desc: 'Manage cards instantly from your phone' },
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
            <CreditCard className="h-10 w-10 text-accent" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-4">
            Virtual Cards
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Create virtual cards for secure online shopping
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-6 rounded-2xl bg-card shadow-card">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-3">{feature.label}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-16 mb-16">
          <div>
            <h2 className="text-2xl font-display font-semibold mb-6">Digital Payment Solution</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Shop online with confidence using virtual cards designed for the digital age. 
              Create multiple cards for different purposes, set spending limits, and enjoy 
              enhanced security features that keep your transactions safe.
            </p>
            
            <h3 className="text-xl font-semibold mb-4">Key Features</h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <Star className="h-5 w-5 text-accent mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">Instant virtual card creation</span>
              </li>
              <li className="flex items-start">
                <Star className="h-5 w-5 text-accent mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">Custom spending limits and controls</span>
              </li>
              <li className="flex items-start">
                <Star className="h-5 w-5 text-accent mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">Real-time transaction alerts</span>
              </li>
              <li className="flex items-start">
                <Star className="h-5 w-5 text-accent mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">Freeze/unfreeze cards instantly</span>
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
          <h2 className="text-2xl font-display font-semibold mb-6">Shop smarter, safer</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Create your first virtual card today and experience secure online shopping 
            with complete control over your digital payments.
          </p>
          <Button size="lg" className="px-8">
            Create Virtual Card
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VirtualCardsFeature;
