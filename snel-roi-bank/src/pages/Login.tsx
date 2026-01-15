import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/Logo';
import { LanguageSwitch } from '@/components/LanguageSwitch';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Login = () => {
  const { t } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast({
        title: t('common.success'),
        description: t('login.welcomeBack'),
      });
      navigate('/app/dashboard');
    } catch (error) {
      const message = (error as Error).message;
      if (message === 'Email not verified') {
        toast({
          title: 'Verify your email',
          description: 'Enter the 4-digit code we sent to activate your account.',
          variant: 'destructive',
        });
        navigate('/verify-email', { state: { email } });
        return;
      }
      toast({
        title: t('common.error'),
        description: message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 xl:px-12 bg-background">
        <div className="w-full max-w-md mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Logo />
            <LanguageSwitch variant="compact" />
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              {t('auth.welcome')}
            </h1>
            <p className="text-muted-foreground">
              {t('login.enterCredentials')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder="alex@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t('auth.password')}</Label>
                <Link to="/reset-password" className="text-sm text-accent hover:underline">
                  {t('auth.forgot')}
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              {t('auth.login')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            {t('auth.noAccount')}{' '}
            <Link to="/register" className="text-accent font-medium hover:underline">
              {t('auth.signUp')}
            </Link>
          </p>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            {t('auth.terms')}
          </p>
        </div>
      </div>

      {/* Right Panel - Visual */}
      <div className="hidden lg:flex flex-1 gradient-primary items-center justify-center p-12">
        <div className="max-w-lg text-primary-foreground">
          <div className="h-20 w-fit bg-accent rounded-2xl inline-flex items-center justify-center px-6 mb-8">
            <Logo variant="light" size="lg" />
          </div>
          <h2 className="text-4xl font-display font-bold mb-6">
            {t('login.welcomeBack')}
          </h2>
          <p className="text-lg text-primary-foreground/70 leading-relaxed">
            {t('login.accessAccounts')}
          </p>
          <div className="mt-12 flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <span className="text-sm text-primary-foreground/70">Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <span className="text-sm text-primary-foreground/70">Fast</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <span className="text-sm text-primary-foreground/70">Reliable</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
