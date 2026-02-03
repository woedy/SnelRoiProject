import React from 'react';
import { Link } from 'react-router-dom';
import { Cookie, Info, Settings, Shield } from 'lucide-react';

const CookiePolicy = () => {
    return (
        <div className="py-20 bg-background">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-4">Cookie Policy</h1>
                    <p className="text-muted-foreground">Understanding how we use cookies to improve your experience.</p>
                </div>

                <div className="space-y-12">
                    <section className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center text-accent flex-shrink-0">
                            <Cookie className="h-8 w-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold mb-4">What are cookies?</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Cookies are small text files that are stored on your device when you visit a website. They help the website recognize your device and remember information about your visit, like your preferred language and other settings.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-6">How we use cookies</h2>
                        <div className="grid sm:grid-cols-2 gap-6">
                            {[
                                { icon: Shield, title: 'Essential', desc: 'Required for basic site functionality and security.' },
                                { icon: Settings, title: 'Functional', desc: 'Remembering your preferences and settings.' },
                                { icon: Info, title: 'Analytics', desc: 'Understanding how visitors interact with our site.' },
                                { icon: Cookie, title: 'Tailored', desc: 'Providing you with relevant content and offers.' },
                            ].map((item, i) => (
                                <div key={i} className="p-6 rounded-2xl bg-card border border-border">
                                    <item.icon className="h-6 w-6 text-primary mb-4" />
                                    <h3 className="font-semibold mb-2">{item.title} Cookies</h3>
                                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="p-8 rounded-3xl bg-muted/30 border border-border">
                        <h2 className="text-2xl font-bold mb-4">Managing Cookies</h2>
                        <p className="text-muted-foreground leading-relaxed mb-6">
                            You can control and manage cookies in various ways. Please keep in mind that removing or blocking cookies can negatively impact your user experience and parts of our website may no longer be fully accessible.
                        </p>
                        <p className="text-sm text-primary font-medium">Most browsers allow you to change your cookie settings through their preferences or options menu.</p>
                        <p className="text-xs text-muted-foreground mt-4">For more information on how we protect your data, see our <Link to="/privacy" className="text-accent hover:underline">Privacy Policy</Link>.</p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default CookiePolicy;
