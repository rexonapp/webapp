import Footer from '@/components/layout/Footer';
import Hero from '@/components/layout/Hero';
import { Building2, Users, Award, Clock, TrendingUp, Shield } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function HomePage() {
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1">
        {/* Full-screen Hero */}
        
        <Hero />
        
        {/* Stats Section */}
        <section className="py-20 bg-background border-y">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-xl mb-4">
                      <Icon className="h-8 w-8 text-red-500" />
                    </div>
                    <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                      {stat.value}
                    </div>
                    <div className="text-muted-foreground font-medium">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-24 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Why Choose Rexon?
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                We're changing the way people find and list commercial properties in India with technology and service you can trust
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index} className="hover:shadow-2xl transition-all duration-300 hover:border-red-200 hover:-translate-y-1">
                    <CardHeader>
                      <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center mb-3">
                        <Icon className="h-7 w-7 text-red-500" />
                      </div>
                      <CardTitle className="text-2xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-br from-red-50 via-white to-red-50/50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Ready to Find Your Ideal Commercial Space?
            </h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto">
              Join thousands of satisfied property owners and businesses who found their perfect match with Rexon
            </p>
            <Link href="/properties">
              <Button size="lg" className="bg-red-500 hover:bg-red-600 text-white px-12 py-6 text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all">
                Browse Properties Now
              </Button>
            </Link>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}