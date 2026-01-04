import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import {
  Shield,
  Lock,
  Globe,
  Headphones,
  BarChart3,
  Send,
  PiggyBank,
  FileText,
  CreditCard,
  Building2,
  TrendingUp,
  Wallet,
  ArrowRight,
  ChevronRight,
  Star,
  CheckCircle,
  Play,
  ChevronLeft,
  Smartphone,
  Users,
  Award,
  Clock,
} from 'lucide-react';

import heroImage from '@/assets/hero-lifestyle.jpg';
import premiumCard from '@/assets/premium-card.png';
import wealthImage from '@/assets/wealth-management.jpg';

const Index = () => {
  const { t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const heroSlides = [
    {
      title: t('hero.slide1.title'),
      subtitle: t('hero.slide1.subtitle'),
      cta: t('hero.slide1.cta'),
      ctaLink: "/register",
    },
    {
      title: t('hero.slide2.title'),
      subtitle: t('hero.slide2.subtitle'),
      cta: t('hero.slide2.cta'),
      ctaLink: "/features",
    },
    {
      title: t('hero.slide3.title'),
      subtitle: t('hero.slide3.subtitle'),
      cta: t('hero.slide3.cta'),
      ctaLink: "/register",
    },
  ];

  const quickServices = [
    { icon: CreditCard, label: t('services.cards'), href: '/features' },
    { icon: Building2, label: t('services.accounts'), href: '/features' },
    { icon: Send, label: t('services.transfers'), href: '/features' },
    { icon: TrendingUp, label: t('services.investments'), href: '/features' },
    { icon: Wallet, label: t('services.savings'), href: '/features' },
    { icon: Globe, label: t('services.international'), href: '/features' },
    { icon: Shield, label: t('services.insurance'), href: '/features' },
    { icon: Headphones, label: t('services.support'), href: '/contact' },
  ];

  const stats = [
    { value: '2M+', label: t('stats.clients') },
    { value: '$50B+', label: t('stats.assets') },
    { value: '180+', label: t('stats.countries') },
    { value: '99.9%', label: t('stats.uptime') },
  ];

  const features = [
    { 
      icon: BarChart3, 
      title: t('features.dashboard.title'), 
      desc: t('features.dashboard.desc') 
    },
    { 
      icon: Send, 
      title: t('features.transfers.title'), 
      desc: t('features.transfers.desc') 
    },
    { 
      icon: PiggyBank, 
      title: t('features.savings.title'), 
      desc: t('features.savings.desc') 
    },
    { 
      icon: Lock, 
      title: t('features.security.title'), 
      desc: t('features.security.desc') 
    },
    { 
      icon: FileText, 
      title: t('features.statements.title'), 
      desc: t('features.statements.desc') 
    },
    { 
      icon: Smartphone, 
      title: t('features.mobile.title'), 
      desc: t('features.mobile.desc') 
    },
  ];

  const testimonials = [
    { 
      name: 'Alexander Chen', 
      role: 'CEO, TechVentures', 
      rating: 5, 
      text: 'Snel Roi has transformed how we handle international transactions. The speed and reliability are unmatched.',
      image: 'AC'
    },
    { 
      name: 'Dr. Sarah Mitchell', 
      role: 'Private Client', 
      rating: 5, 
      text: 'The private banking experience is exceptional. My dedicated manager understands my unique financial needs.',
      image: 'SM'
    },
    { 
      name: 'Marcus Weber', 
      role: 'Entrepreneur', 
      rating: 5, 
      text: 'From startup to scale-up, Snel Roi has been our trusted banking partner. Their business solutions are outstanding.',
      image: 'MW'
    },
  ];

  const awards = [
    'Best Digital Bank 2024',
    'Excellence in Private Banking',
    'Most Innovative Bank',
  ];

  return (
    <div className="overflow-hidden bg-background">
      {/* Hero Section - Full Screen with Slider */}
      <section className="relative min-h-[100vh] flex items-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Premium banking" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/40" />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -50 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-white"
            >
              {/* Slide Indicator */}
              <div className="flex gap-2 mb-8">
                {heroSlides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      currentSlide === idx ? 'w-12 bg-accent' : 'w-6 bg-white/30'
                    }`}
                  />
                ))}
              </div>

              <motion.h1 
                key={currentSlide}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-display font-bold mb-6 leading-tight"
              >
                {heroSlides[currentSlide].title}
              </motion.h1>
              
              <motion.p 
                key={`subtitle-${currentSlide}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-lg sm:text-xl text-white/80 mb-10 max-w-xl leading-relaxed"
              >
                {heroSlides[currentSlide].subtitle}
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link to={heroSlides[currentSlide].ctaLink}>
                  <Button 
                    size="xl" 
                    className="bg-accent hover:bg-accent/90 text-white font-semibold px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
                  >
                    {heroSlides[currentSlide].cta}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button 
                    size="xl" 
                    variant="outline"
                    className="border-2 border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-6 text-lg rounded-xl backdrop-blur-sm"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    {t('hero.cta.demo')}
                  </Button>
                </Link>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mt-12 flex flex-wrap items-center gap-6"
              >
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-accent" />
                  <span className="text-sm text-white/70">{t('trust.security')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-accent" />
                  <span className="text-sm text-white/70">{t('trust.support')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-accent" />
                  <span className="text-sm text-white/70">{t('trust.global')}</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Floating Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
              animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.8, rotateY: isVisible ? 0 : -15 }}
              transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
              className="hidden lg:flex justify-center items-center"
            >
              <div className="relative">
                <motion.img 
                  src={premiumCard}
                  alt="Snel Roi Premium Card"
                  className="w-[400px] drop-shadow-2xl"
                  animate={{ 
                    y: [0, -15, 0],
                    rotateZ: [-2, 2, -2],
                  }}
                  transition={{ 
                    duration: 6, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                />
                {/* Floating Elements */}
                <motion.div 
                  className="absolute -top-6 -right-6 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Portfolio</p>
                      <p className="font-semibold text-foreground">+12.4%</p>
                    </div>
                  </div>
                </motion.div>
                <motion.div 
                  className="absolute -bottom-4 -left-4 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl"
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Transfer Complete</p>
                      <p className="font-semibold text-foreground">$2,500.00</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Hero Navigation Arrows */}
        <div className="absolute bottom-8 right-8 z-20 hidden md:flex items-center gap-2">
          <button 
            onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
            className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button 
            onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
            className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <span className="ml-4 text-white/60 text-sm">
            {String(currentSlide + 1).padStart(2, '0')} / {String(heroSlides.length).padStart(2, '0')}
          </span>
        </div>
      </section>

      {/* Quick Services Bar */}
      <section className="bg-card border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-4 md:grid-cols-8 -mx-4">
            {quickServices.map((service, index) => (
              <Link 
                key={index}
                to={service.href}
                className="flex flex-col items-center gap-2 py-6 px-4 hover:bg-muted/50 transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                  <service.icon className="h-6 w-6 text-muted-foreground group-hover:text-accent transition-colors" />
                </div>
                <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors text-center">
                  {service.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <p className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-accent mb-2">
                  {stat.value}
                </p>
                <p className="text-white/70 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-2 bg-accent/10 text-accent text-sm font-semibold rounded-full mb-4">
              {t('features.subtitle')}
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
              {t('features.title')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('features.description')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative p-8 rounded-3xl bg-card border border-border hover:border-accent/30 hover:shadow-xl transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-7 w-7 text-accent" />
                </div>
                <h3 className="text-xl font-display font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
                <Link 
                  to="/features" 
                  className="inline-flex items-center text-accent font-medium mt-4 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {t('common.learnMore')} <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Wealth Management Section */}
      <section className="py-20 lg:py-32 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="aspect-[4/3] rounded-3xl overflow-hidden">
                <img 
                  src={wealthImage}
                  alt="Wealth Management"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Overlay Card */}
              <div className="absolute -bottom-8 -right-8 bg-card rounded-2xl p-6 shadow-2xl border border-border max-w-xs hidden md:block">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{t('wealth.privateBanking')}</p>
                    <p className="text-sm text-muted-foreground">{t('wealth.advisor')}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('wealth.advisorDescription')}
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <span className="inline-block px-4 py-2 bg-accent/10 text-accent text-sm font-semibold rounded-full mb-4">
                {t('wealth.badge')}
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mb-6">
                {t('wealth.title')}
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                {t('wealth.subtitle')}
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  t('wealth.feature1'),
                  t('wealth.feature2'),
                  t('wealth.feature3'),
                  t('wealth.feature4'),
                  t('wealth.feature5'),
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-4 w-4 text-accent" />
                    </div>
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <Link to="/features">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
                  {t('wealth.cta')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 lg:py-32 bg-primary text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block px-4 py-2 bg-accent/20 text-accent text-sm font-semibold rounded-full mb-4">
                {t('security.badge')}
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mb-6">
                {t('security.title')}
              </h2>
              <p className="text-lg text-white/70 mb-8">
                {t('security.subtitle')}
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  t('security.feature1'),
                  t('security.feature2'),
                  t('security.feature3'),
                  t('security.feature4'),
                  t('security.feature5'),
                  t('security.feature6'),
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                    <span className="text-white/90">{item}</span>
                  </li>
                ))}
              </ul>
              <Link to="/security">
                <Button 
                  size="lg" 
                  className="bg-accent hover:bg-accent/90 text-white"
                >
                  {t('security.cta')}
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex justify-center"
            >
              <div className="relative">
                <div className="w-72 h-72 lg:w-80 lg:h-80 bg-gradient-to-br from-accent/30 to-accent/10 rounded-full flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-4 border-2 border-dashed border-accent/30 rounded-full"
                  />
                  <Shield className="h-32 w-32 text-accent" />
                </div>
                <motion.div 
                  className="absolute -top-4 left-0 bg-white/10 backdrop-blur-sm rounded-2xl p-4"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Lock className="h-8 w-8 text-accent" />
                </motion.div>
                <motion.div 
                  className="absolute -bottom-4 right-0 bg-white/10 backdrop-blur-sm rounded-2xl p-4"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                >
                  <Lock className="h-8 w-8 text-accent" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 lg:py-32 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-2 bg-accent/10 text-accent text-sm font-semibold rounded-full mb-4">
              {t('testimonials.badge')}
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
              {t('testimonials.title')}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t('testimonials.subtitle')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card border border-border rounded-3xl p-8 hover:shadow-xl transition-shadow"
              >
                <div className="flex gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-foreground text-lg mb-8 leading-relaxed">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                    {testimonial.image}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Awards Bar */}
      <section className="py-12 bg-secondary/50 border-y border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
            {awards.map((award, index) => (
              <div key={index} className="flex items-center gap-3">
                <Award className="h-8 w-8 text-accent" />
                <span className="font-semibold text-foreground">{t(`awards.${index + 1}`)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 lg:py-32 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative bg-primary rounded-3xl p-12 lg:p-20 text-center overflow-hidden"
          >
            {/* Background Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />

            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white mb-6">
                {t('cta.title')}
              </h2>
              <p className="text-lg text-white/70 max-w-2xl mx-auto mb-10">
                {t('cta.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register">
                  <Button 
                    size="xl" 
                    className="bg-accent hover:bg-accent/90 text-white font-semibold px-10 py-6 text-lg rounded-xl"
                  >
                    {t('cta.primary')}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button 
                    size="xl" 
                    variant="outline"
                    className="border-2 border-white/30 text-white hover:bg-white/10 font-semibold px-10 py-6 text-lg rounded-xl"
                  >
                    {t('cta.secondary')}
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-white/50 mt-8">
                {t('cta.disclaimer')}
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Index;
