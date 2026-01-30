import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  HelpCircle, 
  MessageCircle, 
  Phone, 
  Mail, 
  Clock,
  Search,
  FileText,
  Shield,
  CreditCard,
  ArrowUpDown
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Help = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: '',
    category: 'general'
  });

  const handleSubmitContact = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the form data to your API
    toast({
      title: 'Message Sent',
      description: 'We\'ve received your message and will get back to you soon.',
    });
    setContactForm({ subject: '', message: '', category: 'general' });
  };

  const faqItems = [
    {
      category: 'Account',
      questions: [
        {
          question: 'How do I verify my account?',
          answer: 'To verify your account, go to your Profile page and complete the KYC verification process by uploading your ID and proof of address documents.'
        },
        {
          question: 'How do I change my password?',
          answer: 'You can change your password by going to Settings > Security and clicking on "Change Password".'
        },
        {
          question: 'What are the different account tiers?',
          answer: 'We offer Standard, Premium, and VIP account tiers. Higher tiers provide increased transaction limits and additional features.'
        }
      ]
    },
    {
      category: 'Transactions',
      questions: [
        {
          question: 'How long do transfers take?',
          answer: 'Internal transfers are instant. External transfers typically take 1-3 business days depending on the receiving bank.'
        },
        {
          question: 'What are the transaction limits?',
          answer: 'Transaction limits vary by account tier. Standard accounts have a $5,000 daily limit, Premium accounts have $25,000, and VIP accounts have $100,000.'
        },
        {
          question: 'How do I cancel a pending transaction?',
          answer: 'Pending transactions can be cancelled from your Transactions page by clicking the "Cancel" button next to the transaction.'
        }
      ]
    },
    {
      category: 'Virtual Cards',
      questions: [
        {
          question: 'How do I request a virtual card?',
          answer: 'Go to the Virtual Cards page and click "Request New Card". Your application will be reviewed and approved within 24 hours.'
        },
        {
          question: 'Can I freeze my virtual card?',
          answer: 'Yes, you can instantly freeze and unfreeze your virtual cards from the Virtual Cards page for security purposes.'
        },
        {
          question: 'What are the virtual card fees?',
          answer: 'Virtual cards are free for Premium and VIP accounts. Standard accounts have a $5 monthly fee per active card.'
        }
      ]
    }
  ];

  const filteredFAQs = faqItems.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => 
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="max-w-4xl mx-auto pb-20 lg:pb-0 space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
          Help & Support
        </h1>
        <p className="text-muted-foreground mt-1">Get help with your account and transactions</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <MessageCircle className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Live Chat</h3>
            <p className="text-sm text-muted-foreground">Chat with our support team</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <Phone className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Call Us</h3>
            <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <Mail className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Email Support</h3>
            <p className="text-sm text-muted-foreground">support@snelroi.com</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="faq" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="contact">Contact Us</TabsTrigger>
        </TabsList>

        <TabsContent value="faq" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Frequently Asked Questions
              </CardTitle>
              <CardDescription>
                Find answers to common questions about your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search FAQ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* FAQ Categories */}
              <div className="space-y-6">
                {filteredFAQs.map((category, categoryIndex) => (
                  <div key={categoryIndex}>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      {category.category === 'Account' && <Shield className="h-5 w-5" />}
                      {category.category === 'Transactions' && <ArrowUpDown className="h-5 w-5" />}
                      {category.category === 'Virtual Cards' && <CreditCard className="h-5 w-5" />}
                      {category.category}
                    </h3>
                    <Accordion type="single" collapsible className="w-full">
                      {category.questions.map((faq, faqIndex) => (
                        <AccordionItem key={faqIndex} value={`${categoryIndex}-${faqIndex}`}>
                          <AccordionTrigger className="text-left">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                ))}
              </div>

              {filteredFAQs.length === 0 && searchQuery && (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No FAQ found matching your search.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Contact Support
              </CardTitle>
              <CardDescription>
                Send us a message and we'll get back to you as soon as possible
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitContact} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={contactForm.category}
                    onChange={(e) => setContactForm({ ...contactForm, category: e.target.value })}
                    className="w-full h-12 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="account">Account Issues</option>
                    <option value="transactions">Transaction Problems</option>
                    <option value="technical">Technical Support</option>
                    <option value="billing">Billing Questions</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="Brief description of your issue"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Please provide details about your issue..."
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    rows={6}
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  Send Message
                </Button>
              </form>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Response Time</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  We typically respond within 2-4 hours during business hours (9 AM - 6 PM EST, Monday - Friday).
                  For urgent issues, please call our support line.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Help;