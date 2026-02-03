import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Logo } from '@/components/Logo';
import { LanguageSwitch } from '@/components/LanguageSwitch';
import { StepProgressIndicator } from '@/components/ui/progress-indicator';
import { Eye, EyeOff, ArrowRight, ArrowLeft, Check, User, Mail, CreditCard, Shield } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface FormData {
  // Personal Information
  first_name: string;
  last_name: string;
  middle_name: string;
  username: string;

  // Contact Information
  email: string;
  phone: string;
  country: string;

  // Account Setup
  currency: string;
  account_type: string;

  // Security
  password: string;
  confirm_password: string;
  terms_accepted: boolean;
}

const Register = () => {
  const { t } = useLanguage();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    middle_name: '',
    username: '',
    email: '',
    phone: '',
    country: '',
    currency: 'USD',
    account_type: 'CHECKING',
    password: '',
    confirm_password: '',
    terms_accepted: false,
  });

  const steps = [
    { id: 'personal', title: 'Personal', icon: <User className="w-5 h-5" /> },
    { id: 'contact', title: 'Contact', icon: <Mail className="w-5 h-5" /> },
    { id: 'account', title: 'Account', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'security', title: 'Security', icon: <Shield className="w-5 h-5" /> },
  ];

  const countries = [
    { value: 'US', label: 'United States of America' },
    { value: 'CA', label: 'Canada' },
    { value: 'GB', label: 'United Kingdom' },
    { value: 'DE', label: 'Germany' },
    { value: 'FR', label: 'France' },
    { value: 'AU', label: 'Australia' },
    { value: 'JP', label: 'Japan' },
    { value: 'SG', label: 'Singapore' },
    { value: 'NL', label: 'Netherlands' },
    { value: 'CH', label: 'Switzerland' },
  ];

  const currencies = [
    { value: 'USD', label: 'USD - $' },
    { value: 'EUR', label: 'EUR - €' },
    { value: 'GBP', label: 'GBP - £' },
    { value: 'CAD', label: 'CAD - C$' },
    { value: 'AUD', label: 'AUD - A$' },
    { value: 'JPY', label: 'JPY - ¥' },
  ];

  const accountTypes = [
    { value: 'CHECKING', label: 'Checking Account' },
    { value: 'SAVINGS', label: 'Savings Account' },
    { value: 'CURRENT', label: 'Current Account' },
    { value: 'BUSINESS', label: 'Business Account' },
  ];

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: // Personal
        return !!(formData.first_name && formData.last_name && formData.username);
      case 2: // Contact
        return !!(formData.email && formData.phone);
      case 3: // Account
        return !!(formData.currency && formData.account_type);
      case 4: // Security
        return !!(formData.password && formData.confirm_password && formData.terms_accepted);
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 4) {
        handleSubmit();
      } else {
        setCurrentStep(prev => prev + 1);
      }
    } else {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (formData.password !== formData.confirm_password) {
      toast({
        title: 'Password Mismatch',
        description: 'Passwords do not match.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Use the existing register function but pass the full form data
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || Object.values(data).flat().join(', '));
      }

      localStorage.setItem('snel-roi-pending-verification', data.email);
      toast({
        title: t('common.success'),
        description: 'Verification code sent to your email.',
      });
      navigate('/verify-email', { state: { email: data.email } });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Personal Information
        return (
          <div className="space-y-5">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                Personal Information
              </h2>
              <p className="text-muted-foreground">Tell us about yourself</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                type="text"
                placeholder="Bella"
                value={formData.first_name}
                onChange={(e) => handleChange('first_name', e.target.value)}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                type="text"
                placeholder="Moon"
                value={formData.last_name}
                onChange={(e) => handleChange('last_name', e.target.value)}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="middle_name">Middle Name</Label>
              <Input
                id="middle_name"
                type="text"
                placeholder="Sandy"
                value={formData.middle_name}
                onChange={(e) => handleChange('middle_name', e.target.value)}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                type="text"
                placeholder="bellamoon"
                value={formData.username}
                onChange={(e) => handleChange('username', e.target.value)}
                className="h-12"
              />
            </div>
          </div>
        );

      case 2: // Contact Information
        return (
          <div className="space-y-5">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                Contact Information
              </h2>
              <p className="text-muted-foreground">How can we reach you?</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="movepat6760@juthex.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+13875456687"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Select value={formData.country} onValueChange={(value) => handleChange('country', value)}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="United States of America" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.value} value={country.value}>
                      {country.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 3: // Account Setup
        return (
          <div className="space-y-5">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                Account Setup
              </h2>
              <p className="text-muted-foreground">Choose your account preferences</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency *</Label>
              <Select value={formData.currency} onValueChange={(value) => handleChange('currency', value)}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="account_type">Account Type *</Label>
              <Select value={formData.account_type} onValueChange={(value) => handleChange('account_type', value)}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {accountTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 4: // Security Setup
        return (
          <div className="space-y-5">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                Security Setup
              </h2>
              <p className="text-muted-foreground">Secure your account</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
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

            <div className="space-y-2">
              <Label htmlFor="confirm_password">Confirm Password *</Label>
              <div className="relative">
                <Input
                  id="confirm_password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••••"
                  value={formData.confirm_password}
                  onChange={(e) => handleChange('confirm_password', e.target.value)}
                  className="h-12 pr-12"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={formData.terms_accepted}
                onCheckedChange={(checked) => handleChange('terms_accepted', checked as boolean)}
              />
              <Label htmlFor="terms" className="text-sm">
                I agree to the <Link to="/terms" className="text-accent hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-accent hover:underline">Privacy Policy</Link>
              </Label>
            </div>
          </div>
        );

      default:
        return null;
    }
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
            Join Snel-Roi Bank
          </h2>
          <p className="text-lg text-primary-foreground/70 leading-relaxed mb-8">
            Create Your Banking Account
          </p>
          <p className="text-sm text-primary-foreground/60 mb-8">
            Start your financial journey with Snel-Roi Bank. Secure, fast, and reliable banking at your fingertips.
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

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
              <span>Create Account</span>
              <span>Step {currentStep} of 4</span>
            </div>
            <StepProgressIndicator steps={steps} currentStep={currentStep} />
          </div>

          {/* Step Content */}
          <div className="mb-8">
            {renderStepContent()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handlePrevious}
                className="flex-1"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
            )}

            <Button
              type="button"
              size="lg"
              onClick={handleNext}
              disabled={!validateStep(currentStep) || isSubmitting}
              className="flex-1"
            >
              {currentStep === 4 ? (
                isSubmitting ? 'Creating Account...' : 'Create Account'
              ) : (
                'Next'
              )}
              {currentStep < 4 && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-accent font-medium hover:underline">
              Sign In
            </Link>
          </p>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            © 2026 Snel-Roi Bank. All Rights Reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;