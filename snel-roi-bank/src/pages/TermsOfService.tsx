import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { FileText, Shield, Scale, Clock } from 'lucide-react';

const TermsOfService = () => {
    const { t } = useLanguage();

    return (
        <div className="py-20 bg-background">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-4">{t('terms.title')}</h1>
                    <p className="text-muted-foreground">{t('terms.lastUpdated')}</p>
                </div>

                <div className="prose prose-slate max-w-none dark:prose-invert">
                    <div className="flex items-center gap-4 mb-8 p-6 bg-accent/5 border border-accent/20 rounded-2xl">
                        <Scale className="h-8 w-8 text-accent" />
                        <p className="m-0 text-sm italic">{t('terms.agreement')}</p>
                    </div>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <FileText className="h-6 w-6 text-primary" />
                            {t('terms.section1.title')}
                        </h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            {t('terms.section1.desc')}
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                            <strong>{t('terms.section1.compliance')}</strong> {t('terms.section1.complianceDesc')}
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-primary">
                            <Shield className="h-6 w-6" />
                            {t('terms.section2.title')}
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            {t('terms.section2.desc')}
                        </p>
                    </section>

                    <section className="mb-12 p-8 bg-muted/30 rounded-3xl border border-border">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <Clock className="h-6 w-6 text-primary" />
                            {t('terms.section3.title')}
                        </h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            {t('terms.section3.desc')} <span className="font-semibold text-foreground">{t('terms.section3.timeframe')}</span> {t('terms.section3.desc2')}
                        </p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-2">
                            <li>{t('terms.section3.list1')}</li>
                            <li>{t('terms.section3.list2')}</li>
                        </ul>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-4">{t('terms.section4.title')}</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            {t('terms.section4.desc')}
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-4 border border-border rounded-xl">
                                <h4 className="font-bold mb-1">{t('terms.section4.availability')}</h4>
                                <p className="text-sm text-muted-foreground">{t('terms.section4.availabilityDesc')}</p>
                            </div>
                            <div className="p-4 border border-border rounded-xl">
                                <h4 className="font-bold mb-1">{t('terms.section4.limits')}</h4>
                                <p className="text-sm text-muted-foreground">{t('terms.section4.limitsDesc')}</p>
                            </div>
                        </div>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-4">{t('terms.section5.title')}</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            {t('terms.section5.desc')}
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-4 text-destructive">{t('terms.section6.title')}</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            {t('terms.section6.desc')}
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
