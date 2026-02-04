import React from 'react';
import { ShieldCheck, Eye, Lock, FileCheck } from 'lucide-react';

const PrivacyPolicy = () => {
    return (
        <div className="py-20 bg-background">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-4">Privacy Policy</h1>
                    <p className="text-muted-foreground">Comprehensive information on how we protect and manage your data. Last updated: February 2026.</p>
                </div>

                <div className="space-y-12">
                    <section className="p-8 rounded-3xl bg-card border border-border shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                                <Eye className="h-6 w-6" />
                            </div>
                            <h2 className="text-2xl font-bold">1. Information We Collect</h2>
                        </div>
                        <p className="text-muted-foreground leading-relaxed mb-6">
                            As a financial institution, we are required by law to collect certain information to verify your identity and protect against fraud. We collect information through three primary channels:
                        </p>
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Directly from You</h3>
                                <ul className="list-disc list-inside text-muted-foreground space-y-2 pl-4">
                                    <li><strong>Identity Data:</strong> Full name, date of birth, Social Security Number (SSN) or Tax ID, and government-issued identification documentation.</li>
                                    <li><strong>Contact Data:</strong> Residential address, primary email, and verified phone number.</li>
                                    <li><strong>Financial Data:</strong> Source of funds, investment objectives, and existing bank account details for funding purposes.</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Automatically Collected</h3>
                                <ul className="list-disc list-inside text-muted-foreground space-y-2 pl-4">
                                    <li><strong>Technical Data:</strong> IP address, browser type, device identifiers, and geolocation data to prevent unauthorized access.</li>
                                    <li><strong>Usage Data:</strong> Patterns of interaction with our platform to improve security and user experience.</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            <Lock className="h-6 w-6 text-primary" />
                            2. How We Use and Share Your Data
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                            {[
                                { title: 'Compliance & Verification', desc: 'To perform KYC (Know Your Customer) and AML (Anti-Money Laundering) checks as required by federal law.' },
                                { title: 'Transaction Security', desc: 'To monitor for suspicious activity and prevent fraudulent transactions in real-time.' },
                                { title: 'Service Personalization', desc: 'To tailor our financial products and ROI strategies to your stated goals.' },
                                { title: 'Legal Disclosures', desc: 'To cooperate with law enforcement or regulatory authorities when formally requested.' },
                            ].map((item, i) => (
                                <div key={i} className="p-6 rounded-2xl bg-muted/30 border border-border/50">
                                    <h3 className="font-semibold mb-2">{item.title}</h3>
                                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                            <strong>Note on Sharing:</strong> We do not sell your personal data. We only share information with vetted third-party service providers (e.g., identity verification services and payment processors) who are contractually obligated to protect your data.
                        </p>
                    </section>

                    <section className="p-8 rounded-3xl bg-primary text-white">
                        <div className="flex items-center gap-4 mb-6">
                            <ShieldCheck className="h-8 w-8 text-accent" />
                            <h2 className="text-2xl font-bold">3. Data Security & Encryption</h2>
                        </div>
                        <p className="text-white/90 leading-relaxed mb-4">
                            Snel ROI employs industry-leading security measures to protect your assets and information:
                        </p>
                        <ul className="grid md:grid-cols-2 gap-4 text-white/80 list-none">
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent" /> AES-256 Bank-Grade Encryption</li>
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent" /> Mandatory Multi-Factor Authentication</li>
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent" /> 24/7 Security Operations Monitoring</li>
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent" /> Isolated Data Storage Environments</li>
                        </ul>
                    </section>

                    <section className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h2 className="text-2xl font-bold mb-4">4. Data Retention</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We retain your personal and financial information only for as long as necessary to fulfill the purposes outlined in this policy or to comply with statutory retention requirements (typically 5-7 years for financial records).
                            </p>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold mb-4">5. Your Privacy Rights</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Depending on your jurisdiction (e.g., GDPR, CCPA), you may have the right to access, correct, or request deletion of your data. You may also opt-out of non-essential data processing through your account settings.
                            </p>
                        </div>
                    </section>

                    <section className="p-8 rounded-3xl bg-muted/20 border border-dashed border-border">
                        <h2 className="text-xl font-bold mb-4">Contact Our Privacy Officer</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            If you have questions regarding this policy or wish to exercise your data rights, please contact our dedicated privacy team at <span className="text-primary font-semibold">privacy@snelroi.bank</span>.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
