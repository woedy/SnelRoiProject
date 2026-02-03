import React from 'react';
import { FileText, Shield, Scale, Clock } from 'lucide-react';

const TermsOfService = () => {
    return (
        <div className="py-20 bg-background">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-4">Terms of Service</h1>
                    <p className="text-muted-foreground">Last updated: January 2026</p>
                </div>

                <div className="prose prose-slate max-w-none dark:prose-invert">
                    <div className="flex items-center gap-4 mb-8 p-6 bg-accent/5 border border-accent/20 rounded-2xl">
                        <Scale className="h-8 w-8 text-accent" />
                        <p className="m-0 text-sm italic">Please read these terms carefully before using our banking services. By using Snel ROI, you agree to follow these guidelines.</p>
                    </div>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <FileText className="h-6 w-6 text-primary" />
                            1. Acceptance of Terms
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            By accessing and using Snel ROI Banking services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <Shield className="h-6 w-6 text-primary" />
                            2. User Eligibility
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            To use Snel ROI, you must be at least 18 years old, have the legal capacity to enter into a binding agreement, and provide accurate, current, and complete information during the registration process.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <Clock className="h-6 w-6 text-primary" />
                            3. Account Security
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify Snel ROI immediately of any unauthorized use of your account.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-4">4. Banking Services</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Our banking services are provided subject to the specific account agreements and regulatory requirements in your jurisdiction. We reserve the right to modify or discontinue any aspect of our services at any time.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-4">5. Fees and Charges</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Fees for our services are disclosed in our Fee Schedule. You agree to pay all applicable fees associated with your use of Snel ROI services.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
