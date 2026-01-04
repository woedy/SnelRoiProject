import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/Logo';
import { LanguageSwitch } from '@/components/LanguageSwitch';
import { Eye, EyeOff, ArrowRight, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Register = () => {
  const { t } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login();
    toast({
      title: t('common.success'),
      description: t('auth.accountCreated'),
    });
    navigate('/app/dashboard');
  };

  const benefits = [
    t('register.benefit1'),
    t('register.benefit2'),
    t('register.benefit3'),
    t('register.benefit4'),
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Visual */}
      <div className="hidden lg:flex flex-1 gradient-primary items-center justify-center p-12">
        <div className="max-w-lg text-primary-foreground">
          <h2 className="text-4xl font-display font-bold mb-6">
            {t('register.startJourney')}
          </h2>
          <p className="text-lg text-primary-foreground/70 leading-relaxed mb-8">
            {t('register.joinMillions')}
          </p>
          <ul className="space-y-4">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                  <Check className="h-4 w-4 text-accent-foreground" />
                </div>
                <span className="text-primary-foreground/90">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 xl:px-12 bg-background">
        <div className="w-full max-w-md mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Logo />
            <LanguageSwitch variant="compact" />
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              {t('auth.create')}
            </h1>
            <p className="text-muted-foreground">
              {t('register.fillDetails')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">{t('auth.name')}</Label>
              <Input
                id="name"
                type="text"
                placeholder="Alex Johnson"
                value={formData.name}
                onChange={handleChange}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder="alex@example.com"
                value={formData.email}
                onChange={handleChange}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{t('auth.phone')}</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+49 170 123 4567"
                value={formData.phone}
                onChange={handleChange}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="h-12 pr-12"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full">
              {t('auth.register')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            {t('auth.hasAccount')}{' '}
            <Link to="/login" className="text-accent font-medium hover:underline">
              {t('auth.signIn')}
            </Link>
          </p>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            {t('auth.terms')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
