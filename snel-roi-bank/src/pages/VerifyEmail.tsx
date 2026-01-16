import React, { useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyEmail, resendVerification } = useAuth();
  const initialEmail =
    (location.state as { email?: string } | null)?.email ??
    localStorage.getItem('snel-roi-pending-verification') ??
    '';
  const [email, setEmail] = useState(initialEmail);
  const [digits, setDigits] = useState(['', '', '', '']);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const code = useMemo(() => digits.join(''), [digits]);

  const handleDigitChange = (index: number, value: string) => {
    const normalized = value.replace(/\D/g, '').slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = normalized;
    setDigits(nextDigits);
    if (normalized && inputsRef.current[index + 1]) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleDigitKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !digits[index] && inputsRef.current[index - 1]) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await verifyEmail(email, code);
      toast({ title: 'Email verified', description: 'Welcome to your new account.' });
      localStorage.removeItem('snel-roi-pending-verification');
      navigate('/app/dashboard');
    } catch (error) {
      toast({
        title: 'Verification failed',
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  };

  const handleResend = async () => {
    try {
      if (!email) {
        toast({
          title: 'Email required',
          description: 'Enter your email to resend the verification code.',
          variant: 'destructive',
        });
        return;
      }
      await resendVerification(email);
      toast({ title: 'Code sent', description: 'Check your inbox for the new code.' });
    } catch (error) {
      toast({
        title: 'Unable to resend',
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <Logo />
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Verify your email</h1>
          <p className="text-muted-foreground mt-2">
            Enter the 4-digit code we sent to your email to activate your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-12"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Verification code</Label>
            <div className="flex gap-3">
              {digits.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => {
                    inputsRef.current[index] = el;
                  }}
                  value={digit}
                  onChange={(event) => handleDigitChange(index, event.target.value)}
                  onKeyDown={(event) => handleDigitKeyDown(index, event)}
                  inputMode="numeric"
                  maxLength={1}
                  className="h-12 w-12 text-center text-lg"
                />
              ))}
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={code.length !== 4}>
            Verify &amp; continue
          </Button>
        </form>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <button type="button" onClick={handleResend} className="text-accent hover:underline">
            Resend code
          </button>
          <Link to="/login" className="hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
