import React from 'react';
import { Newspaper, Image as ImageIcon, Download, Mail, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Press = () => {
    const news = [
        { date: 'Jan 15, 2026', title: 'Snel ROI Expands Private Banking Services to South East Asia', category: 'Expansion' },
        { date: 'Dec 02, 2025', title: 'Named "Most Innovative Bank 2025" by Financial Times', category: 'Award' },
        { date: 'Oct 20, 2025', title: 'Snel ROI Reaches 2 Million Active Users Worldwide', category: 'Milestone' },
    ];

    return (
        <div className="py-20 bg-background">
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16 border-b border-border pb-12">
                    <div className="max-w-2xl">
                        <h1 className="text-4xl md:text-6xl font-display font-bold text-primary mb-6">Press Room</h1>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            Find the latest news, stories, and brand assets for Snel ROI Banking.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <Button variant="outline" className="gap-2">
                            <Download className="h-4 w-4" />
                            Media Kit
                        </Button>
                        <Button className="bg-primary text-white gap-2">
                            <Mail className="h-4 w-4" />
                            Contact PR
                        </Button>
                    </div>
                </div>

                {/* Latest News */}
                <section className="mb-20">
                    <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                        <Newspaper className="h-6 w-6 text-accent" />
                        Latest Press Releases
                    </h2>
                    <div className="space-y-6">
                        {news.map((item, i) => (
                            <div key={i} className="p-8 rounded-3xl bg-card border border-border hover:shadow-lg transition-shadow group flex flex-col md:flex-row justify-between gap-6">
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-widest text-accent mb-2 block">{item.category}</span>
                                    <p className="text-sm text-muted-foreground mb-2">{item.date}</p>
                                    <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">{item.title}</h3>
                                </div>
                                <Button variant="ghost" className="self-start md:self-center gap-2">
                                    Read Article
                                    <ExternalLink className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Brand Assets */}
                <section className="grid md:grid-cols-2 gap-8 mb-20">
                    <div className="p-10 rounded-4xl bg-secondary/30 flex flex-col justify-between">
                        <div>
                            <ImageIcon className="h-10 w-10 text-primary mb-6" />
                            <h2 className="text-3xl font-bold mb-4">Brand Identity</h2>
                            <p className="text-muted-foreground mb-8 text-lg">Download our official logos, color palettes, and typography guidelines.</p>
                        </div>
                        <Button variant="link" className="text-primary font-bold p-0 justify-start text-lg">
                            Download Logos (.zip)
                        </Button>
                    </div>
                    <div className="p-10 rounded-4xl bg-muted flex flex-col justify-between">
                        <div>
                            <ImageIcon className="h-10 w-10 text-primary mb-6" />
                            <h2 className="text-3xl font-bold mb-4">Product Imagery</h2>
                            <p className="text-muted-foreground mb-8 text-lg">High-resolution photography of our app interface and lifestyle branding.</p>
                        </div>
                        <Button variant="link" className="text-primary font-bold p-0 justify-start text-lg">
                            Download Assets (.zip)
                        </Button>
                    </div>
                </section>

                {/* Media Contact */}
                <section className="text-center p-12 bg-primary rounded-4xl text-white">
                    <h2 className="text-3xl font-bold mb-4">Media Inquiries</h2>
                    <p className="text-white/70 mb-8 max-w-xl mx-auto">Are you a journalist or member of the press? Reach out to our communications team for interviews and statements.</p>
                    <p className="text-2xl font-display font-semibold text-accent">press@snelroi.com</p>
                </section>
            </div>
        </div>
    );
};

export default Press;
