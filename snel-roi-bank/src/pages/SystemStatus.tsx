import React from 'react';
import { CheckCircle2, Clock, AlertCircle, ShieldCheck, Globe, Smartphone, CreditCard, Cpu } from 'lucide-react';

const SystemStatus = () => {
    const services = [
        { name: 'Core Banking Systems', status: 'Operational', icon: ShieldCheck, time: '100% uptime' },
        { name: 'Mobile Applications (iOS/Android)', status: 'Operational', icon: Smartphone, time: '99.98% uptime' },
        { name: 'Web Banking Platform', status: 'Operational', icon: Globe, time: '100% uptime' },
        { name: 'Card Payments & Processing', status: 'Operational', icon: CreditCard, time: '99.95% uptime' },
        { name: 'International Transfers (SWIFT)', status: 'Operational', icon: Clock, time: 'Last checked: 2 min ago' },
        { name: 'Public API', status: 'Operational', icon: Cpu, time: '100% uptime' },
    ];

    return (
        <div className="py-20 bg-background">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-500 rounded-full mb-6 font-semibold">
                        <CheckCircle2 className="h-5 w-5" />
                        All Systems Operational
                    </div>
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-4">System Status</h1>
                    <p className="text-lg text-muted-foreground">Real-time status of Snel ROI Banking services and infrastructure.</p>
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
                    <h2 className="text-xl font-bold mb-6">Recent Incidents</h2>
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">No incidents reported in the last 90 days.</p>
                    </div>
                </div>

                <div className="mt-12 text-center text-sm text-muted-foreground">
                    <p>Status updates are updated every 30 seconds. For immediate assistance, please contact support.</p>
                </div>
            </div>
        </div>
    );
};

export default SystemStatus;
