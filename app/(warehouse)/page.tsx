'use client';

import Footer from '@/components/layout/Footer';
import Hero from '@/components/layout/Hero';
import { Building2, Users, Award, Clock, TrendingUp, Shield } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEffect, useRef, useState } from 'react';
import './homepage.css';

export default function HomePage() {
  const [isVisible, setIsVisible] = useState<{[key: string]: boolean}>({});
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Optimize IntersectionObserver with passive observation
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const updates: {[key: string]: boolean} = {};
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            updates[entry.target.id] = true;
          }
        });
        if (Object.keys(updates).length > 0) {
          setIsVisible((prev) => ({ ...prev, ...updates }));
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    // Use requestIdleCallback for non-critical observations
    const observeElements = () => {
      const elements = document.querySelectorAll('[data-animate]');
      elements.forEach((el) => observerRef.current?.observe(el));
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
    { icon: Users, value: '200+', label: 'Cities Covered' },
    { icon: Award, value: '#1', label: 'Customer Rated' },
    { icon: Clock, value: '24/7', label: 'Support Available' }
  ];

  const features = [
    {
      icon: TrendingUp,
      title: 'Real-Time Market Data',
      description: 'Access up-to-the-minute pricing, trends, and neighborhood insights powered by our proprietary algorithms tailored for the Indian market.'
    },
    {
      icon: Shield,
      title: 'Verified Listings Only',
      description: 'Every property is verified and updated daily. No fake listings, no outdated information. Trust guaranteed.'
    },
    {
      icon: Clock,
      title: 'Lightning Fast Search',
      description: 'Our advanced search technology helps you find your perfect warehouse or commercial space faster than any other platform.'
    }
  ];

  const particles = [
    { left: '10%', duration: '5s' },
    { left: '25%', duration: '4.5s' },
    { left: '40%', duration: '5.5s' },
    { left: '55%', duration: '4.8s' },
    { left: '70%', duration: '5.2s' },
    { left: '85%', duration: '4.6s' },
    { left: '15%', duration: '5.3s' },
    { left: '60%', duration: '4.9s' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-orange-50/20">

      <main className="flex-1">
        {/* Full-screen Hero */}
        <Hero />
        
        {/* Stats Section */}
        <section className="py-20 bg-white border-y border-blue-100 relative overflow-hidden">
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div 
                    key={index}
                    id={`stat-${index}`}
                    data-animate
                    className={`text-center group fade-in-up stagger-${index + 1} ${isVisible[`stat-${index}`] ? 'visible' : ''}`}
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-900 via-blue-600 to-blue-700 rounded-2xl mb-4 shadow-lg group-hover:shadow-2xl group-hover:shadow-blue-500/50 transition-all duration-500 group-hover:scale-110 relative overflow-hidden shimmer-effect ">
                      <div className="absolute inset-0 bg-gradient-to-tr from-blue-900 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <Icon className="h-8 w-8 text-white relative z-10 " style={{ animationDelay: `${index * 0.2}s` }} />
                    </div>
                    <div className={`stat-number text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent mb-2 ${isVisible[`stat-${index}`] ? 'visible' : ''}`}>
                      {stat.value}
                    </div>
                    <div className="text-slate-600 font-medium group-hover:text-blue-700 transition-colors duration-300">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-24 bg-gradient-to-br from-blue-50/50 via-white to-orange-50/30 relative overflow-hidden">
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div 
              id="features-header"
              data-animate
              className={`text-center mb-16 fade-in-up ${isVisible['features-header'] ? 'visible' : ''}`}
            >
              <div className="inline-block mb-4">
                <span className="text-sm font-semibold text-orange-600 bg-orange-100 px-5 py-2.5 rounded-full hover:bg-orange-200 hover:scale-105 transition-all duration-300 cursor-default shadow-sm hover:shadow-md">
                  Why Choose Us
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-900 via-blue-700 to-blue-900 bg-clip-text text-transparent mb-4 animated-gradient">
                Why Choose Rexon?
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                We're changing the way people find and list commercial properties in India with technology and service you can trust
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                const animationClass = index === 0 ? 'slide-in-left' : 
                                      index === 2 ? 'slide-in-right' : 
                                      'fade-in-scale';
                return (
                  <div
                    key={index}
                    id={`feature-${index}`}
                    data-animate
                    className={`${animationClass} stagger-${index + 1} ${isVisible[`feature-${index}`] ? 'visible' : ''}`}
                  >
                    <Card className="border-2 border-blue-100 hover:border-orange-300 group premium-card backdrop-card bg-white/90 h-full">
                      {/* Gradient overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-50/0 via-blue-50/0 to-orange-50/0 group-hover:from-orange-50/50 group-hover:via-blue-50/30 group-hover:to-orange-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg pointer-events-none"></div>
                      
                      <CardHeader className="relative z-10">
                        <div className="w-14 h-14 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:shadow-2xl group-hover:shadow-orange-400/50 transition-all duration-500 group-hover:scale-110 group-hover:-rotate-6 relative overflow-hidden shimmer-effect">
                          <div className="absolute inset-0 bg-gradient-to-tr from-orange-400 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          <Icon className="h-7 w-7 text-white relative z-10 group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <CardTitle className="text-2xl text-blue-900 group-hover:text-orange-600 transition-all duration-500 font-bold">
                          {feature.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="relative z-10">
                        <CardDescription className="text-base leading-relaxed text-slate-600 group-hover:text-slate-700 transition-colors duration-300">
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

        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden animated-gradient bg-blue-900">
          
          <div 
            id="cta-section"
            data-animate
            className={`max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 fade-in-scale ${isVisible['cta-section'] ? 'visible' : ''}`}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white drop-shadow-lg">
              Ready to Find Your Ideal Commercial Space?
            </h2>
            <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto leading-relaxed">
              Join thousands of satisfied property owners and businesses who found their perfect match with Rexon
            </p>
            <Link href="/properties">
              <Button size="lg" className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 text-white px-12 py-6 text-lg shadow-2xl hover:shadow-orange-500/50 transform hover:scale-110 transition-all duration-500 border-0 rounded-xl font-semibold ripple-button group relative overflow-hidden">
                <span className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                <span className="relative z-10 flex items-center gap-2">
                  Browse Properties Now
                  <svg 
                    className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-500" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Button>
            </Link>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}