import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Phone, MapPin } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';

const Contact = () => {
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: t('contact.successMessage'), description: t('contact.successDesc') });
  };

  return (
    <div className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-4">{t('contact.title')}</h1>
          <p className="text-lg text-muted-foreground mb-4">{t('contact.subtitle')}</p>
          <p className="text-sm text-muted-foreground">
            Have a quick question? Check our <Link to="/help" className="text-accent font-medium hover:underline">Help Center</Link> first.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{t('contact.email')}</h3>
                <p className="text-muted-foreground">support@snelroi.com</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{t('contact.phone')}</h3>
                <p className="text-muted-foreground">+49 30 123 456 789</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{t('contact.address')}</h3>
                <p className="text-muted-foreground">Friedrichstraße 123, 10117 Berlin, Germany</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-8 shadow-card space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('contact.name')}</Label>
                <Input id="name" placeholder={t('contact.namePlaceholder')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('contact.email')}</Label>
                <Input id="email" type="email" placeholder={t('contact.emailPlaceholder')} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">{t('contact.message')}</Label>
              <Textarea id="message" placeholder={t('contact.messagePlaceholder')} rows={5} />
            </div>
            <Button type="submit" size="lg" className="w-full">{t('contact.sendButton')}</Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
