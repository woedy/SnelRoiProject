import React from 'react';
import { FileText, Shield, Scale, Clock } from 'lucide-react';

const TermsOfService = () => {
    return (
        <div className="py-20 bg-background">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-4">Terms of Service</h1>
                    <p className="text-muted-foreground">Standard Banking Agreement and Disclosure. Last updated: February 2026</p>
                </div>

                <div className="prose prose-slate max-w-none dark:prose-invert">
                    <div className="flex items-center gap-4 mb-8 p-6 bg-accent/5 border border-accent/20 rounded-2xl">
                        <Scale className="h-8 w-8 text-accent" />
                        <p className="m-0 text-sm italic">Please read this agreement carefully. By accessing the Snel ROI Banking platform, you agree to be bound by these terms, which constitute a legally binding agreement between you and Snel ROI.</p>
                    </div>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <FileText className="h-6 w-6 text-primary" />
                            1. Acceptance and Eligibility
                        </h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            By clicking "Sign Up" or accessing our services, you represent that you are at least 18 years of age and a legal resident of a supported jurisdiction. You agree to provide accurate information and undergo our mandatory Identity Verification (KYC) process.
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                            <strong>Compliance:</strong> Use of our services is subject to anti-money laundering (AML) regulations. Snel ROI reserves the right to refuse service to any individual or entity at its sole discretion.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-primary">
                            <Shield className="h-6 w-6" />
                            2. Electronic Communications Consent (E-SIGN)
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            As a digital banking platform, Snel ROI requires your consent to deliver all communications, statements, and disclosures electronically. By using our platform, you agree that all electronic communications have the same legal effect as physical paper documents.
                        </p>
                    </section>

                    <section className="mb-12 p-8 bg-muted/30 rounded-3xl border border-border">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <Clock className="h-6 w-6 text-primary" />
                            3. Unauthorized Transactions & Liability
                        </h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            You are responsible for maintaining the confidentiality of your credentials. You must notify Snel ROI <span className="font-semibold text-foreground">within two (2) business days</span> of discovering any unauthorized activity to limit your potential liability.
                        </p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-2">
                            <li>Liability for unauthorized transfers is governed by Regulation E (or local equivalent).</li>
                            <li>Losses resulting from shared credentials or negligence may not be reimbursable.</li>
                        </ul>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-4">4. Banking Services and ROI Projections</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            Funds deposited into Snel ROI accounts are managed according to the selected banking tier. While we strive for "Snel" (Fast) ROI, all financial products carry inherent risks.
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-4 border border-border rounded-xl">
                                <h4 className="font-bold mb-1">Availability</h4>
                                <p className="text-sm text-muted-foreground">Service may be interrupted for scheduled maintenance or unforeseen technical issues.</p>
                            </div>
                            <div className="p-4 border border-border rounded-xl">
                                <h4 className="font-bold mb-1">Limits</h4>
                                <p className="text-sm text-muted-foreground">Transaction and withdrawal limits apply based on account verification levels.</p>
                            </div>
                        </div>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-4">5. Limitation of Liability</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            To the maximum extent permitted by law, Snel ROI and its affiliates shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform, including but not limited to loss of data or financial loss due to market volatility.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-4 text-destructive">6. Termination and Closure</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Snel ROI reserves the right to suspend or terminate your account immediately if we suspect fraudulent activity, breach of these terms, or as required by regulatory authorities. You may close your account at any time, provided all outstanding obligations are met.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
