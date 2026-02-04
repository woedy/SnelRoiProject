import React from 'react';
import { Briefcase, Heart, Rocket, Zap, Users, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Careers = () => {
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
                    <h1 className="text-4xl md:text-7xl font-display font-bold mb-6">Build the future of money.</h1>
                    <p className="text-xl text-white/90 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Join a global team of innovators, thinkers, and doers working together to redefine how the world interacts with finance.
                    </p>
                    <Button size="xl" className="bg-white text-accent hover:bg-white/90 font-bold px-10 rounded-xl">
                        View Openings
                    </Button>
                </div>
            </section>

            {/* Perks */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">Why join Snel ROI?</h2>
                        <p className="text-muted-foreground">We take care of our people so they can take care of our customers.</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { icon: Rocket, title: 'Impact', desc: 'Your work will affect millions of users directly from day one.' },
                            { icon: Zap, title: 'Growth', desc: 'Transparent career paths and a generous learning budget for all.' },
                            { icon: Heart, title: 'Wellbeing', desc: 'Comprehensive health coverage and mental health support.' },
                            { icon: Users, title: 'Inclusion', desc: 'A diverse workplace where everyone belongs and can thrive.' },
                            { icon: Coffee, title: 'Flexibility', desc: 'Remote-first culture with beautiful offices in global hubs.' },
                            { icon: Briefcase, title: 'Ownership', desc: 'Equity packages and a high-trust environment.' },
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
                    <h2 className="text-3xl font-display font-bold mb-12 text-center">Open Positions</h2>
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
                                    Apply Now →
                                </Button>
                            </div>
                        ))}
                    </div>
                    <div className="mt-16 text-center">
                        <p className="text-muted-foreground mb-6">Don't see a role that fits? Send us an open application!</p>
                        <Button variant="outline" className="border-accent text-accent hover:bg-accent/10">
                            Open Application
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Careers;
