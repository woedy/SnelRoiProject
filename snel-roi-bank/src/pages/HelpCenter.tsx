import React from 'react';
import { Search, HelpCircle, Book, MessageSquare, Shield, CreditCard, Send, PlusCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const HelpCenter = () => {
    const { t } = useLanguage();

    const categories = [
        { icon: HelpCircle, title: t('help.cat.gettingStarted'), count: 12 },
        { icon: Shield, title: t('help.cat.security'), count: 8 },
        { icon: CreditCard, title: t('help.cat.cards'), count: 15 },
        { icon: Send, title: t('help.cat.transfers'), count: 10 },
        { icon: Book, title: t('help.cat.account'), count: 14 },
        { icon: MessageSquare, title: t('help.cat.support'), count: 5 },
    ];

    const popularFaqs = [
        'How do I reset my password?',
        'What are the transaction limits?',
        'How long do international transfers take?',
        'Is Snel ROI available in my country?',
        'How do I order a physical card?',
    ];

    return (
        <div className="py-20 bg-background">
            <div className="container mx-auto px-4 sm:px-6">
                {/* Search Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-6">{t('help.title')}</h1>
                    <div className="max-w-2xl mx-auto relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder={t('help.searchPlaceholder')}
                            className="pl-12 h-14 text-lg rounded-xl shadow-sm border-border"
                        />
                    </div>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                    {categories.map((cat, i) => (
                        <div key={i} className="p-8 rounded-2xl bg-card border border-border hover:border-accent/30 hover:shadow-md transition-all group cursor-pointer">
                            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors">
                                <cat.icon className="h-6 w-6 text-accent" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">{cat.title}</h3>
                            <p className="text-muted-foreground">{cat.count} articles</p>
                        </div>
                    ))}
                </div>

                {/* Popular Questions & Contact */}
                <div className="grid lg:grid-cols-3 gap-12 items-start">
                    <div className="lg:col-span-2">
                        <h2 className="text-2xl font-bold mb-6">{t('help.faq.title')}</h2>
                        <div className="space-y-4">
                            {popularFaqs.map((faq, i) => (
                                <div key={i} className="p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors cursor-pointer flex items-center justify-between">
                                    <span className="font-medium text-foreground">{faq}</span>
                                    <PlusCircle className="h-5 w-5 text-muted-foreground" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-primary text-white p-8 rounded-2xl">
                        <h2 className="text-2xl font-bold mb-4">{t('help.contact.title')}</h2>
                        <p className="text-white/80 mb-8">{t('help.contact.desc')}</p>
                        <div className="space-y-4">
                            <Button className="w-full bg-accent hover:bg-accent/90 text-white border-0 py-6 text-lg">
                                {t('help.contact.btn.contact')}
                            </Button>
                            <Button variant="outline" className="w-full border-white/30 text-white hover:bg-white/10 py-6 text-lg">
                                {t('help.contact.btn.chat')}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpCenter;
