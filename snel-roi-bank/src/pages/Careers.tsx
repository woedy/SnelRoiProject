import React from 'react';
import { Briefcase, Heart, Rocket, Zap, Users, Coffee } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';

const Careers = () => {
    const { t } = useLanguage();

    const openPositions = [
        { title: 'Senior Frontend Engineer', dept: 'Engineering', location: 'Remote / London' },
        { title: 'Product Designer', dept: 'Design', location: 'New York' },
        { title: 'Compliance Manager', dept: 'Legal', location: 'Frankfurt' },
        { title: 'Customer Success lead', dept: 'Support', location: 'Remote' },
        { title: 'Data Scientist', dept: 'Analytics', location: 'London' },
    ];

    return (
        <div className="bg-background">
            {/* Hero */}
            <section className="py-24 bg-accent text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-64 h-64 border-4 border-white/20 rounded-full animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 border-4 border-white/10 rounded-full animate-pulse delay-700" />
                </div>
                <div className="container mx-auto px-4 text-center relative z-10">
                    <h1 className="text-4xl md:text-7xl font-display font-bold mb-6">{t('careers.hero.title')}</h1>
                    <p className="text-xl text-white/90 max-w-2xl mx-auto mb-10 leading-relaxed">
                        {t('careers.hero.desc')}
                    </p>
                    <Button size="xl" className="bg-white text-accent hover:bg-white/90 font-bold px-10 rounded-xl">
                        {t('careers.cta.view')}
                    </Button>
                </div>
            </section>

            {/* Perks */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">{t('careers.why.title')}</h2>
                        <p className="text-muted-foreground">{t('careers.why.desc')}</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { icon: Rocket, title: t('careers.perks.impact'), desc: t('careers.perks.impactDesc') },
                            { icon: Zap, title: t('careers.perks.growth'), desc: t('careers.perks.growthDesc') },
                            { icon: Heart, title: t('careers.perks.wellbeing'), desc: t('careers.perks.wellbeingDesc') },
                            { icon: Users, title: t('careers.perks.inclusion'), desc: t('careers.perks.inclusionDesc') },
                            { icon: Coffee, title: t('careers.perks.flexibility'), desc: t('careers.perks.flexibilityDesc') },
                            { icon: Briefcase, title: t('careers.perks.ownership'), desc: t('careers.perks.ownershipDesc') },
                        ].map((perk, i) => (
                            <div key={i} className="p-8 rounded-3xl border border-border bg-card hover:bg-muted/50 transition-colors">
                                <perk.icon className="h-8 w-8 text-accent mb-6" />
                                <h3 className="text-xl font-bold mb-2">{perk.title}</h3>
                                <p className="text-muted-foreground">{perk.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Openings */}
            <section className="py-20 bg-secondary/30">
                <div className="container mx-auto px-4 max-w-4xl">
                    <h2 className="text-3xl font-display font-bold mb-12 text-center">{t('careers.openings.title')}</h2>
                    <div className="space-y-4">
                        {openPositions.map((pos, i) => (
                            <div key={i} className="p-6 rounded-2xl bg-card border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-accent/50 transition-all">
                                <div>
                                    <h3 className="text-xl font-bold group-hover:text-accent transition-colors">{pos.title}</h3>
                                    <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                                        <span>{pos.dept}</span>
                                        <span>•</span>
                                        <span>{pos.location}</span>
                                    </div>
                                </div>
                                <Button variant="ghost" className="text-accent font-semibold p-0 hover:bg-transparent">
                                    {t('careers.openings.apply')} →
                                </Button>
                            </div>
                        ))}
                    </div>
                    <div className="mt-16 text-center">
                        <p className="text-muted-foreground mb-6">{t('careers.noRole.text')}</p>
                        <Button variant="outline" className="border-accent text-accent hover:bg-accent/10">
                            {t('careers.noRole.btn')}
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Careers;
