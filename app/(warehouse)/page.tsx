'use client';

import Hero from '@/components/layout/Hero';
import { Building2, Users, Award, Clock, TrendingUp, Shield } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEffect, useRef, useState } from 'react';
import './homepage.css';

const AgentsSection = dynamic(() => import('@/components/layout/AgentSection'), {
  loading: () => <section className="py-20 bg-white" aria-hidden="true" />,
});
const Footer = dynamic(() => import('@/components/layout/Footer'));

export default function HomePage() {
  const [isVisible, setIsVisible] = useState<{ [key: string]: boolean }>({});
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const updates: { [key: string]: boolean } = {};
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            updates[entry.target.id] = true;
            observerRef.current?.unobserve(entry.target);
          }
        });
        if (Object.keys(updates).length > 0)
          setIsVisible((prev) => ({ ...prev, ...updates }));
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const observeElements = () => {
      document
        .querySelectorAll('[data-animate]')
        .forEach((el) => observerRef.current?.observe(el));
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(observeElements);
    } else {
      setTimeout(observeElements, 1);
    }

    return () => observerRef.current?.disconnect();
  }, []);

  const stats = [
    { icon: Building2, value: '50,000+', label: 'Active Listings' },
    { icon: Users,     value: '200+',    label: 'Cities Covered' },
    { icon: Award,     value: '#1',      label: 'Customer Rated' },
    { icon: Clock,     value: '24/7',    label: 'Support Available' },
  ];

  const features = [
    {
      icon: TrendingUp,
      title: 'Real-Time Market Data',
      description: 'Access up-to-the-minute pricing, trends, and neighborhood insights powered by our proprietary algorithms tailored for the Indian market.',
    },
    {
      icon: Shield,
      title: 'Verified Listings Only',
      description: 'Every property is verified and updated daily. No fake listings, no outdated information. Trust guaranteed.',
    },
    {
      icon: Clock,
      title: 'Lightning Fast Search',
      description: 'Our advanced search technology helps you find your perfect warehouse or commercial space faster than any other platform.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-[#13a8b4]/8 to-[#d07648]/8">
      <main className="flex-1">
        <Hero />

        {/* Stats */}
        <section className="py-14 md:py-20 bg-white border-y border-[#13a8b4]/15 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} id={`stat-${index}`} data-animate
                    className={`text-center group fade-in-up stagger-${index + 1} ${isVisible[`stat-${index}`] ? 'visible' : ''}`}
                  >
                    <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-[#13a8b4] via-[#0f8a94] to-[#0b6f78] rounded-2xl mb-3 md:mb-4 shadow-lg group-hover:shadow-2xl group-hover:shadow-[#13a8b4]/35 transition-all duration-500 group-hover:scale-105 relative overflow-hidden shimmer-effect">
                      <div className="absolute inset-0 bg-gradient-to-tr from-[#0b6f78] to-[#13a8b4] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <Icon className="h-8 w-8 text-white relative z-10" style={{ animationDelay: `${index * 0.2}s` }} />
                    </div>
                    <div className={`stat-number hp-stat-value ${isVisible[`stat-${index}`] ? 'visible' : ''}`}>
                      {stat.value}
                    </div>
                    <div className="hp-card-body text-slate-600 group-hover:text-[#0f8a94] transition-colors duration-300">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-[#13a8b4]/8 via-white to-[#d07648]/8 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div id="features-header" data-animate className={`text-center mb-16 fade-in-up ${isVisible['features-header'] ? 'visible' : ''}`}>
              <div className="inline-block mb-4">
                <span className="hp-eyebrow text-[#d07648] bg-[#d07648]/10 px-4 py-2 rounded-full hover:bg-[#d07648]/15 transition-all duration-300 cursor-default shadow-sm">
                  Why Choose Us
                </span>
              </div>
              <h2 className="hp-section-title bg-gradient-to-r from-[#0b6f78] via-[#13a8b4] to-[#0b6f78] bg-clip-text text-transparent mb-4 animated-gradient">
                Why Choose Rexon?
              </h2>
              <p className="hp-section-lead text-slate-600 max-w-3xl mx-auto">
                We're changing the way people find and list commercial properties in India with technology and service you can trust
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                const animationClass = index === 0 ? 'slide-in-left' : index === 2 ? 'slide-in-right' : 'fade-in-scale';
                return (
                  <div key={index} id={`feature-${index}`} data-animate
                    className={`${animationClass} stagger-${index + 1} ${isVisible[`feature-${index}`] ? 'visible' : ''}`}
                  >
                    <Card className="border-2 border-[#13a8b4]/15 hover:border-[#d07648]/35 group premium-card backdrop-card bg-white/90 h-full">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#d07648]/0 via-[#13a8b4]/0 to-[#d07648]/0 group-hover:from-[#d07648]/12 group-hover:via-[#13a8b4]/10 group-hover:to-[#d07648]/12 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg pointer-events-none" />
                      <CardHeader className="relative z-10">
                        <div className="w-14 h-14 bg-[#0f8a94] rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:shadow-2xl group-hover:shadow-[#d07648]/35 transition-all duration-500 group-hover:scale-105 group-hover:-rotate-3 relative overflow-hidden shimmer-effect">
                          <div className="absolute inset-0 bg-[#13a8b4] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          <Icon className="h-7 w-7 text-white relative z-10 group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <CardTitle className="hp-card-title text-[#134c52] group-hover:text-[#d07648] transition-all duration-500">
                          {feature.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="relative z-10">
                        <CardDescription className="hp-card-body text-slate-600 group-hover:text-slate-700 transition-colors duration-300">
                          {feature.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Agents — separate component */}
        <AgentsSection />

        {/* CTA */}
        <section className="py-16 md:py-24 relative overflow-hidden animated-gradient bg-[#0b6f78]">
          <div id="cta-section" data-animate
            className={`max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 fade-in-scale ${isVisible['cta-section'] ? 'visible' : ''}`}
          >
            <h2 className="hp-cta-title mb-5 text-white drop-shadow-lg">
              Ready to Find Your Ideal Commercial Space?
            </h2>
            <p className="hp-cta-body text-white/85 mb-8 md:mb-10 max-w-3xl mx-auto">
              Join thousands of satisfied property owners and businesses who found their perfect match with Rexon
            </p>
            <Button
            size="lg"
            onClick={() => {
              const heroSearch = document.querySelector('#hero-search') as HTMLElement;
              if (heroSearch) {
                heroSearch.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(() => heroSearch.focus(), 600);
              } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="bg-gradient-to-r from-[#d07648] via-[#c46b3f] to-[#a85832] hover:from-[#c46b3f] hover:via-[#b76339] hover:to-[#9e522f] text-white px-8 md:px-12 py-5 md:py-6 hp-button-label shadow-2xl hover:shadow-[#d07648]/40 transform hover:scale-105 transition-all duration-500 border-0 rounded-xl ripple-button group relative overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-[#de8b62] to-[#d07648] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <span className="relative z-10 flex items-center gap-2">
              Browse Properties Now
              <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}