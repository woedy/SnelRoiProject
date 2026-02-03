import React from 'react';
import { ShieldCheck, Eye, Lock, FileCheck } from 'lucide-react';

const PrivacyPolicy = () => {
    return (
        <div className="py-20 bg-background">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-4">Privacy Policy</h1>
                    <p className="text-muted-foreground">How we protect and manage your data. Last updated: January 2026.</p>
                </div>

                <div className="space-y-12">
                    <section className="p-8 rounded-3xl bg-card border border-border shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                                <Eye className="h-6 w-6" />
                            </div>
                            <h2 className="text-2xl font-bold">Information We Collect</h2>
                        </div>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            We collect information that you provide directly to us when you create an account, make transactions, or contact our support team.
                        </p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-2">
                            <li>Identity data (Name, Date of Birth, Tax ID)</li>
                            <li>Contact data (Email, Phone number, Address)</li>
                            <li>Financial data (Transaction history, Accounts)</li>
                            <li>Technical data (IP address, Device info)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            <Lock className="h-6 w-6 text-primary" />
                            How We Use Your Data
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            {[
                                { title: 'Service Provision', desc: 'To manage your account and process transactions.' },
                                { title: 'Security & Fraud', desc: 'To protect your money and our systems.' },
                                { title: 'Legal Compliance', desc: 'To meet regulatory and anti-money laundering requirements.' },
                                { title: 'Communication', desc: 'To send you important updates and notifications.' },
                            ].map((item, i) => (
                                <div key={i} className="p-6 rounded-2xl bg-muted/30">
                                    <h3 className="font-semibold mb-2">{item.title}</h3>
                                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="p-8 rounded-3xl bg-primary text-white">
                        <div className="flex items-center gap-4 mb-6">
                            <ShieldCheck className="h-8 w-8 text-accent" />
                            <h2 className="text-2xl font-bold">Data Security</h2>
                        </div>
                        <p className="text-white/80 leading-relaxed">
                            We use bank-grade encryption (AES-256) and multi-factor authentication to ensure your personal and financial information is always secure. Our systems are monitored 24/7 by security experts.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">Your Rights</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            You have the right to access, correct, or delete your personal data. You can also object to the processing of your data or request a portable copy of your information.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
