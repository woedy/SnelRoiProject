import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { CheckCircle2, Clock, AlertCircle, ShieldCheck, Globe, Smartphone, CreditCard, Cpu } from 'lucide-react';

const SystemStatus = () => {
    const { t } = useLanguage();

    const services = [
        { name: t('status.service.core'), status: t('status.operational'), icon: ShieldCheck, time: t('status.uptime') },
        { name: t('status.service.mobile'), status: t('status.operational'), icon: Smartphone, time: t('status.uptime.mobile') },
        { name: t('status.service.web'), status: t('status.operational'), icon: Globe, time: t('status.uptime') },
        { name: t('status.service.cards'), status: t('status.operational'), icon: CreditCard, time: t('status.uptime.cards') },
        { name: t('status.service.swift'), status: t('status.operational'), icon: Clock, time: t('status.checked') },
        { name: t('status.service.api'), status: t('status.operational'), icon: Cpu, time: t('status.uptime') },
    ];

    return (
        <div className="py-20 bg-background">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-500 rounded-full mb-6 font-semibold">
                        <CheckCircle2 className="h-5 w-5" />
                        {t('status.allOperational')}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-4">{t('status.title')}</h1>
                    <p className="text-lg text-muted-foreground">{t('status.desc')}</p>
                </div>

                {/* Status List */}
                <div className="space-y-4 mb-12">
                    {services.map((service, i) => (
                        <div key={i} className="p-6 rounded-2xl bg-card border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                                    <service.icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground">{service.name}</h3>
                                    <p className="text-sm text-muted-foreground">{service.time}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-500 rounded-lg text-sm font-medium self-start sm:self-center">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                {service.status}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Incident History (Placeholder) */}
                <div className="p-8 rounded-2xl bg-muted/30 border border-border">
                    <h2 className="text-xl font-bold mb-6">{t('status.incidents.title')}</h2>
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">{t('status.incidents.none')}</p>
                    </div>
                </div>

                <div className="mt-12 text-center text-sm text-muted-foreground">
                    <p>{t('status.footer')}</p>
                </div>
            </div>
        </div>
    );
};

export default SystemStatus;
