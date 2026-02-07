import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { ShieldCheck, Eye, Lock } from 'lucide-react';

const PrivacyPolicy = () => {
    const { t } = useLanguage();

    return (
        <div className="py-20 bg-background">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-4">{t('privacy.title')}</h1>
                    <p className="text-muted-foreground">{t('privacy.lastUpdated')}</p>
                </div>

                <div className="space-y-12">
                    <section className="p-8 rounded-3xl bg-card border border-border shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                                <Eye className="h-6 w-6" />
                            </div>
                            <h2 className="text-2xl font-bold">{t('privacy.section1.title')}</h2>
                        </div>
                        <p className="text-muted-foreground leading-relaxed mb-6">
                            {t('privacy.section1.desc')}
                        </p>
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">{t('privacy.section1.subtitle1')}</h3>
                                <ul className="list-disc list-inside text-muted-foreground space-y-2 pl-4">
                                    <li><strong>{t('privacy.section1.list1.1').split(': ')[0]}:</strong> {t('privacy.section1.list1.1').split(': ')[1]}</li>
                                    <li><strong>{t('privacy.section1.list1.2').split(': ')[0]}:</strong> {t('privacy.section1.list1.2').split(': ')[1]}</li>
                                    <li><strong>{t('privacy.section1.list1.3').split(': ')[0]}:</strong> {t('privacy.section1.list1.3').split(': ')[1]}</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">{t('privacy.section1.subtitle2')}</h3>
                                <ul className="list-disc list-inside text-muted-foreground space-y-2 pl-4">
                                    <li><strong>{t('privacy.section1.list2.1').split(': ')[0]}:</strong> {t('privacy.section1.list2.1').split(': ')[1]}</li>
                                    <li><strong>{t('privacy.section1.list2.2').split(': ')[0]}:</strong> {t('privacy.section1.list2.2').split(': ')[1]}</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            <Lock className="h-6 w-6 text-primary" />
                            {t('privacy.section2.title')}
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                            {[
                                { title: t('privacy.section2.item1.title'), desc: t('privacy.section2.item1.desc') },
                                { title: t('privacy.section2.item2.title'), desc: t('privacy.section2.item2.desc') },
                                { title: t('privacy.section2.item3.title'), desc: t('privacy.section2.item3.desc') },
                                { title: t('privacy.section2.item4.title'), desc: t('privacy.section2.item4.desc') },
                            ].map((item, i) => (
                                <div key={i} className="p-6 rounded-2xl bg-muted/30 border border-border/50">
                                    <h3 className="font-semibold mb-2">{item.title}</h3>
                                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                            <strong>{t('privacy.section2.sharing')}</strong> {t('privacy.section2.sharingDesc')}
                        </p>
                    </section>

                    <section className="p-8 rounded-3xl bg-primary text-white">
                        <div className="flex items-center gap-4 mb-6">
                            <ShieldCheck className="h-8 w-8 text-accent" />
                            <h2 className="text-2xl font-bold">{t('privacy.section3.title')}</h2>
                        </div>
                        <p className="text-white/90 leading-relaxed mb-4">
                            {t('privacy.section3.desc')}
                        </p>
                        <ul className="grid md:grid-cols-2 gap-4 text-white/80 list-none">
                            {[t('privacy.section3.list1'), t('privacy.section3.list2'), t('privacy.section3.list3'), t('privacy.section3.list4')].map((item, i) => (
                                <li key={i} className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent" /> {item}</li>
                            ))}
                        </ul>
                    </section>

                    <section className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h2 className="text-2xl font-bold mb-4">{t('privacy.section4.title')}</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                {t('privacy.section4.desc')}
                            </p>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold mb-4">{t('privacy.section5.title')}</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                {t('privacy.section5.desc')}
                            </p>
                        </div>
                    </section>

                    <section className="p-8 rounded-3xl bg-muted/20 border border-dashed border-border">
                        <h2 className="text-xl font-bold mb-4">{t('privacy.contact.title')}</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            {t('privacy.contact.desc')} <span className="text-primary font-semibold">privacy@snelroi.bank</span>.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
