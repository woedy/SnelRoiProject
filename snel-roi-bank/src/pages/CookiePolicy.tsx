import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Link } from 'react-router-dom';
import { Cookie, Info, Settings, Shield } from 'lucide-react';

const CookiePolicy = () => {
    const { t } = useLanguage();

    return (
        <div className="py-20 bg-background">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-4">{t('cookies.title')}</h1>
                    <p className="text-muted-foreground">{t('cookies.subtitle')}</p>
                </div>

                <div className="space-y-12">
                    <section className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center text-accent flex-shrink-0">
                            <Cookie className="h-8 w-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold mb-4">{t('cookies.section1.title')}</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                {t('cookies.section1.desc')}
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-6">{t('cookies.section2.title')}</h2>
                        <div className="grid sm:grid-cols-2 gap-6">
                            {[
                                { icon: Shield, title: t('cookies.type.essential'), desc: t('cookies.type.essentialDesc') },
                                { icon: Settings, title: t('cookies.type.functional'), desc: t('cookies.type.functionalDesc') },
                                { icon: Info, title: t('cookies.type.analytics'), desc: t('cookies.type.analyticsDesc') },
                                { icon: Cookie, title: t('cookies.type.tailored'), desc: t('cookies.type.tailoredDesc') },
                            ].map((item, i) => (
                                <div key={i} className="p-6 rounded-2xl bg-card border border-border">
                                    <item.icon className="h-6 w-6 text-primary mb-4" />
                                    <h3 className="font-semibold mb-2">{item.title}</h3>
                                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="p-8 rounded-3xl bg-muted/30 border border-border">
                        <h2 className="text-2xl font-bold mb-4">{t('cookies.section3.title')}</h2>
                        <p className="text-muted-foreground leading-relaxed mb-6">
                            {t('cookies.section3.desc')}
                        </p>
                        <p className="text-sm text-primary font-medium">{t('cookies.section3.browser')}</p>
                        <p className="text-xs text-muted-foreground mt-4">{t('cookies.section3.moreInfo')} <Link to="/privacy" className="text-accent hover:underline">{t('privacy.title')}</Link>.</p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default CookiePolicy;
