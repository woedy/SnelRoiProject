import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { loanService, type LoanApplication } from '@/services/loanService';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Calculator, DollarSign, Calendar, TrendingUp, AlertCircle } from 'lucide-react';

const loanApplicationSchema = z.object({
  loan_type: z.enum(['PERSONAL', 'BUSINESS', 'MORTGAGE', 'AUTO', 'EDUCATION']),
  requested_amount: z.string().min(1, 'Amount is required').refine(
    (val) => {
      const num = parseFloat(val);
      return num >= 1000 && num <= 500000;
    },
    'Amount must be between $1,000 and $500,000'
  ),
  term_months: z.string().min(1, 'Term is required').refine(
    (val) => {
      const num = parseInt(val);
      return num >= 6 && num <= 360;
    },
    'Term must be between 6 and 360 months'
  ),
  purpose: z.string().min(10, 'Please provide a detailed purpose (minimum 10 characters)'),
  employment_status: z.string().min(1, 'Employment status is required'),
  annual_income: z.string().optional(),
  monthly_expenses: z.string().optional(),
  repayment_frequency: z.enum(['MONTHLY', 'QUARTERLY', 'SEMI_ANNUAL', 'ANNUAL']).default('MONTHLY'),
});

type LoanApplicationForm = z.infer<typeof loanApplicationSchema>;

const LoanApplication = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [estimatedPayment, setEstimatedPayment] = useState<number | null>(null);

  const form = useForm<LoanApplicationForm>({
    resolver: zodResolver(loanApplicationSchema),
    defaultValues: {
      loan_type: 'PERSONAL',
      repayment_frequency: 'MONTHLY',
    },
  });

  const loanTypes = loanService.getLoanTypes();
  const repaymentFrequencies = loanService.getRepaymentFrequencies();

  const watchedValues = form.watch(['requested_amount', 'term_months']);

  React.useEffect(() => {
    const [amount, term] = watchedValues;
    if (amount && term) {
      const principal = parseFloat(amount);
      const termMonths = parseInt(term);
      if (!isNaN(principal) && !isNaN(termMonths) && principal > 0 && termMonths > 0) {
        // Use estimated interest rate of 8% for calculation
        const estimated = loanService.calculateMonthlyPayment(principal, 8, termMonths);
        setEstimatedPayment(estimated);
      } else {
        setEstimatedPayment(null);
      }
    } else {
      setEstimatedPayment(null);
    }
  }, [watchedValues]);

  const onSubmit = async (data: LoanApplicationForm) => {
    if (isSubmitting) return;
    
    // Check KYC status
    if (user?.profile?.kyc_status !== 'VERIFIED') {
      toast({
        title: 'KYC Verification Required',
        description: 'Please complete your KYC verification before applying for a loan.',
        variant: 'destructive',
      });
      navigate('/app/profile');
      return;
    }

    setIsSubmitting(true);
    try {
      const application: LoanApplication = {
        ...data,
        requested_amount: data.requested_amount,
        term_months: parseInt(data.term_months),
        annual_income: data.annual_income || undefined,
        monthly_expenses: data.monthly_expenses || undefined,
      };

      const loan = await loanService.apply(application);
      
      toast({
        title: 'Application Submitted',
        description: 'Your loan application has been submitted for review. You will be notified of the decision.',
      });
      
      navigate(`/app/loans/${loan.id}`);
    } catch (error: any) {
      toast({
        title: 'Application Failed',
        description: error.message || 'Failed to submit loan application',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/app/loans')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Apply for Loan</h1>
          <p className="text-muted-foreground">Complete the application form to apply for a loan</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Loan Application</CardTitle>
              <CardDescription>
                Please provide accurate information for your loan application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="loan_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loan Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select loan type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {loanTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                <div>
                                  <div className="font-medium">{type.label}</div>
                                  <div className="text-sm text-muted-foreground">{type.description}</div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="requested_amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Requested Amount</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                {...field}
                                type="number"
                                placeholder="10000"
                                className="pl-9"
                                min="1000"
                                max="500000"
                                step="100"
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Amount between $1,000 and $500,000
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="term_months"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Loan Term (Months)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                {...field}
                                type="number"
                                placeholder="36"
                                className="pl-9"
                                min="6"
                                max="360"
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Term between 6 and 360 months
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="repayment_frequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Repayment Frequency</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select repayment frequency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {repaymentFrequencies.map((freq) => (
                              <SelectItem key={freq.value} value={freq.value}>
                                <div>
                                  <div className="font-medium">{freq.label}</div>
                                  <div className="text-sm text-muted-foreground">{freq.description}</div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="purpose"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Purpose of Loan</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Please describe how you plan to use the loan funds..."
                            className="min-h-[100px]"
                          />
                        </FormControl>
                        <FormDescription>
                          Provide a detailed explanation of how you plan to use the loan
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="employment_status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employment Status</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g., Full-time employed, Self-employed, Student"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="annual_income"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Annual Income (Optional)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                {...field}
                                type="number"
                                placeholder="50000"
                                className="pl-9"
                                min="0"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="monthly_expenses"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monthly Expenses (Optional)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                {...field}
                                type="number"
                                placeholder="2000"
                                className="pl-9"
                                min="0"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/app/loans')}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Submitting...' : 'Submit Application'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {estimatedPayment && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Payment Estimate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Estimated Monthly Payment:</span>
                    <span className="font-semibold">
                      ${estimatedPayment.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Estimated Rate:</span>
                    <span className="text-sm">8.0% APR</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    * This is an estimate. Actual rates and terms will be determined during underwriting.
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Important Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <strong>KYC Required:</strong> You must have verified KYC status to apply for loans.
              </div>
              <div>
                <strong>Processing Time:</strong> Applications are typically reviewed within 2-3 business days.
              </div>
              <div>
                <strong>Documentation:</strong> Additional documents may be requested during the review process.
              </div>
              <div>
                <strong>Credit Check:</strong> A credit check will be performed as part of the application review.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoanApplication;