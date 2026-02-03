import { Link } from 'react-router-dom';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useLanguage } from '@/context/LanguageContext';

const faqs = [
  { q: 'faq.q1', a: 'faq.a1' },
  { q: 'faq.q2', a: 'faq.a2' },
  { q: 'faq.q3', a: 'faq.a3' },
  { q: 'faq.q4', a: 'faq.a4' },
  { q: 'faq.q5', a: 'faq.a5' },
  { q: 'faq.q6', a: 'faq.a6' },
];

const FAQ = () => {
  const { t } = useLanguage();
  return (
    <div className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-4">{t('faq.title')}</h1>
          <p className="text-lg text-muted-foreground mb-4">{t('faq.subtitle')}</p>
          <p className="text-sm text-muted-foreground">
            Still have questions? Visit our <Link to="/help" className="text-accent font-medium hover:underline">Help Center</Link> for more articles.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="bg-card rounded-xl px-6 shadow-card border-none">
                <AccordionTrigger className="text-left font-semibold hover:no-underline">{t(faq.q)}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{t(faq.a)}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
