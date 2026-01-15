import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';

const ResetPassword = () => {
  const { requestPasswordReset, confirmPasswordReset } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendCode = async () => {
    if (!email) {
      toast({ title: 'Email required', description: 'Enter your email to receive a reset code.', variant: 'destructive' });
      return;
    }
    setIsSending(true);
    try {
      await requestPasswordReset(email);
      toast({ title: 'Reset code sent', description: 'Check your inbox for the 4-digit code.' });
    } catch (error) {
      toast({
        title: 'Unable to send code',
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: 'Passwords do not match', description: 'Please confirm your new password.', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    try {
      await confirmPasswordReset(email, code, newPassword);
      toast({ title: 'Password updated', description: 'You can now sign in with your new password.' });
      navigate('/login');
    } catch (error) {
      toast({
        title: 'Reset failed',
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <Logo />
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Reset your password</h1>
          <p className="text-muted-foreground mt-2">
            Request a 4-digit code and set a new password to regain access.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="reset-email">Email</Label>
            <Input
              id="reset-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-12"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reset-code">Reset code</Label>
            <div className="flex gap-3">
              <Input
                id="reset-code"
                inputMode="numeric"
                maxLength={4}
                placeholder="1234"
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 4))}
                className="h-12"
              />
              <Button type="button" variant="outline" onClick={handleSendCode} disabled={isSending}>
                {isSending ? 'Sending...' : 'Send code'}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="h-12"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm password</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="h-12"
              required
            />
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Updating...' : 'Reset password'}
          </Button>
        </form>

        <div className="text-sm text-muted-foreground">
          Remembered your password?{' '}
          <Link to="/login" className="text-accent hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
