'use client'
import React, { useState, useEffect } from 'react';
import { Home, Building2, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import PropertySearch from '../search/propertysearch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

// Default fallback images
const DEFAULT_IMAGES = [
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&q=80',
  'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1200&q=80',
  'https://images.unsplash.com/photo-1565008576549-57569a49371d?w=1200&q=80',
  'https://images.unsplash.com/photo-1553413077-190dd305871c?w=1200&q=80'
];

export default function HeroWithBanner() {
  const [bannerImages, setBannerImages] = useState<string[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const router= useRouter();

  useEffect(() => {
    fetchBannerImages();
  }, []);

  useEffect(() => {
    if (bannerImages.length === 0) return;
    
    const timer = setInterval(() => {
      handleSlideChange((currentSlide + 1) % bannerImages.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, [bannerImages.length, currentSlide]);

  const fetchBannerImages = async () => {
    try {
      const response = await fetch('/api/banner-images');
      if (response.ok) {
        const data = await response.json();
        if (data.images && data.images.length > 0) {
          setBannerImages(data.images);
          return;
        }
      }
      setBannerImages(DEFAULT_IMAGES);
    } catch (error) {
      console.log('API fetch failed, using default images');
      setBannerImages(DEFAULT_IMAGES);
    }
  };

  const handleSlideChange = (index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 1000);
  };

  const nextSlide = () => {
    handleSlideChange((currentSlide + 1) % bannerImages.length);
  };

  const prevSlide = () => {
    handleSlideChange((currentSlide - 1 + bannerImages.length) % bannerImages.length);
  };

  const goToSlide = (index: number) => {
    handleSlideChange(index);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white">
      <div className="relative min-h-screen sm:min-h-0 sm:h-[650px] md:h-[700px] lg:h-[750px] overflow-hidden">
        <div className="absolute inset-0">
          {bannerImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                index === currentSlide
                  ? 'opacity-100 scale-100 z-10'
                  : 'opacity-0 scale-110 z-0'
              }`}
            >
              <div className="relative w-full h-full">
                <img
                  src={image}
                  alt={`Property ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80"></div>
              </div>
            </div>
          ))}
        </div>

        {bannerImages.length > 1 && (
          <>
            <Button
              onClick={prevSlide}
              disabled={isTransitioning}
              variant="ghost"
              size="icon"
              className="hidden md:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-30 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full transition-all duration-300 hover:scale-110 shadow-lg disabled:opacity-50 border border-white/20 h-12 w-12"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button
              onClick={nextSlide}
              disabled={isTransitioning}
              variant="ghost"
              size="icon"
              className="hidden md:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-30 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full transition-all duration-300 hover:scale-110 shadow-lg disabled:opacity-50 border border-white/20 h-12 w-12"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </>
        )}

        <div className="absolute inset-0 z-20 flex flex-col justify-between sm:justify-center">
          <div className="w-full flex-1 sm:flex-none flex flex-col justify-center px-4 sm:px-6 lg:px-8 pt-16 pb-8 sm:py-0">
            <div className="w-full max-w-6xl mx-auto text-center space-y-4 sm:space-y-6 md:space-y-8">
              <div className="space-y-2 sm:space-y-3">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight text-white drop-shadow-2xl animate-fade-in">
                  List. Discover. Connect.
                </h1>
                <p className="text-xs sm:text-sm md:text-base lg:text-lg max-w-2xl mx-auto text-white/95 drop-shadow-lg px-2">
                  Properties by Owners, Agents & Builders – All in One Place
                </p>
              </div>

              <div className="w-full px-2 sm:px-0">
                <PropertySearch />
              </div>
            </div>
          </div>

          <div className="w-full px-4 sm:px-6 lg:px-8 pb-20 sm:pb-0 sm:mt-6 md:mt-8">
            <div className="w-full max-w-6xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
                {/* Property Owner Card */}
                <Card onClick={()=>router.push('/property')} className="bg-white/95 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group border-gray-200 hover:border-red-300 transform hover:-translate-y-1">
                  <CardHeader className="pb-2 pt-4 px-4 sm:px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-md flex-shrink-0">
                        <Home className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <CardTitle className="text-sm sm:text-base lg:text-lg font-bold group-hover:text-red-600 transition-colors text-left">
                        Property Owner
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4 px-4 sm:px-5 space-y-2">
                    <CardDescription className="text-xs sm:text-sm leading-relaxed text-left">
                      List your warehouse or commercial property and connect with verified buyers
                    </CardDescription>
                    <div className="flex items-center text-red-600 font-semibold text-xs sm:text-sm group-hover:gap-2 transition-all pt-1">
                      <span>Get Started</span>
                      <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>

                {/* Real Estate Agent Card */}
                <Card onClick={()=>router.push('/agent/join')} className="bg-white/95 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group border-gray-200 hover:border-red-300 transform hover:-translate-y-1">
                  <CardHeader className="pb-2 pt-4 px-4 sm:px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-md flex-shrink-0">
                        <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <CardTitle className="text-sm sm:text-base lg:text-lg font-bold group-hover:text-red-600 transition-colors text-left">
                        Real Estate Agent
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4 px-4 sm:px-5 space-y-2">
                    <CardDescription className="text-xs sm:text-sm leading-relaxed text-left">
                      Manage multiple properties and connect with potential clients efficiently
                    </CardDescription>
                    <div className="flex items-center text-red-600 font-semibold text-xs sm:text-sm group-hover:gap-2 transition-all pt-1">
                      <span>Join Now</span>
                      <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>

                {/* Company/Customer Card */}
                <Card className="bg-white/95 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group border-gray-200 hover:border-red-300 transform hover:-translate-y-1 sm:col-span-2 lg:col-span-1">
                  <CardHeader className="pb-2 pt-4 px-4 sm:px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-md flex-shrink-0">
                        <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <CardTitle className="text-sm sm:text-base lg:text-lg font-bold group-hover:text-red-600 transition-colors text-left">
                        Company / Customer
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4 px-4 sm:px-5 space-y-2">
                    <CardDescription className="text-xs sm:text-sm leading-relaxed text-left">
                      Find the perfect warehouse or commercial space for your business needs
                    </CardDescription>
                    <div className="flex items-center text-red-600 font-semibold text-xs sm:text-sm group-hover:gap-2 transition-all pt-1">
                      <span>Find Space</span>
                      <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Slide Indicators - Better positioned */}
        {bannerImages.length > 1 && (
          <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-40 flex gap-1.5 bg-black/30 backdrop-blur-sm px-3 py-1.5 sm:py-2 rounded-full">
            {bannerImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                disabled={isTransitioning}
                className={`transition-all duration-500 rounded-full disabled:cursor-not-allowed h-1 ${
                  index === currentSlide
                    ? 'w-6 sm:w-8 bg-white'
                    : 'w-4 sm:w-6 bg-white/50'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
      `}</style>
    </section>
  );
}