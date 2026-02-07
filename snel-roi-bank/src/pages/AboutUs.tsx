import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Target, Users, Globe, Award, TrendingUp, ShieldCheck } from 'lucide-react';

const AboutUs = () => {
    const { t } = useLanguage();

    return (
        <div className="bg-background">
            {/* Hero Section */}
            <section className="py-24 bg-primary text-white text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-accent rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
                </div>
                <div className="container mx-auto px-4 relative z-10">
                    <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">{t('about.hero.title')}</h1>
                    <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
                        {t('about.hero.desc')}
                    </p>
                </div>
            </section>

            {/* Stats/Values Section */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-12 text-center">
                        {[
                            { icon: Target, title: t('about.vision.title'), desc: t('about.vision.desc') },
                            { icon: Users, title: t('about.customer.title'), desc: t('about.customer.desc') },
                            { icon: Globe, title: t('about.global.title'), desc: t('about.global.desc') },
                        ].map((item, i) => (
                            <div key={i} className="p-8 rounded-3xl bg-card border border-border">
                                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <item.icon className="h-8 w-8 text-accent" />
                                </div>
                                <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                                <p className="text-muted-foreground">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Our Story */}
            <section className="py-20 bg-secondary/30">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <span className="inline-block px-4 py-2 bg-accent/10 text-accent text-sm font-semibold rounded-full mb-4">{t('about.story.badge')}</span>
                            <h2 className="text-3xl md:text-5xl font-display font-bold mb-8">{t('about.story.title')}</h2>
                            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                                <p>{t('about.story.p1')}</p>
                                <p>{t('about.story.p2')}</p>
                                <p>{t('about.story.p3')}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-4 pt-12">
                                <div className="aspect-square bg-accent rounded-3xl flex flex-col items-center justify-center text-white p-6 text-center">
                                    <Award className="h-10 w-10 mb-2" />
                                    <p className="text-xs uppercase tracking-widest font-bold">{t('about.stats.innovation')}</p>
                                </div>
                                <div className="aspect-video bg-muted rounded-3xl"></div>
                            </div>
                            <div className="space-y-4">
                                <div className="aspect-video bg-muted rounded-3xl"></div>
                                <div className="aspect-square bg-primary rounded-3xl flex flex-col items-center justify-center text-white p-6 text-center">
                                    <ShieldCheck className="h-10 w-10 mb-2" />
                                    <p className="text-xs uppercase tracking-widest font-bold">{t('about.stats.security')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default AboutUs;
