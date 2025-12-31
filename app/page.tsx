import Footer from '@/components/layout/Footer';
import Hero from '@/components/layout/Hero';
import { Building2, Users, Award, Clock, TrendingUp, Shield } from 'lucide-react';
import Link from 'next/link';

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
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1">
        {/* Hero Section with Banner */}
        <Hero />
        
        {/* Stats Section */}
        <section className="py-16 bg-white border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-red-50 rounded-xl mb-3">
                      <Icon className="h-7 w-7 text-red-500" />
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                      {stat.value}
                    </div>
                    <div className="text-gray-600 font-medium text-sm">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                Why Choose Rexon?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                We're changing the way people find and list commercial properties in India with technology and service you can trust
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="bg-white p-7 rounded-xl border border-gray-200 hover:border-red-200 hover:shadow-md transition-all duration-300">
                    <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center mb-5">
                      <Icon className="h-6 w-6 text-red-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* User Type Cards Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                Get Started Today
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Join thousands of property owners, agents, and businesses who trust Rexon
              </p>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-red-50 to-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Ready to Find Your Ideal Commercial Space?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied property owners and businesses who found their perfect match with Rexon
            </p>
            <Link href="/properties">
              <button className="bg-red-500 text-white px-10 py-3.5 rounded-lg hover:bg-red-600 transition-colors font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                Browse Properties Now
              </button>
            </Link>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}