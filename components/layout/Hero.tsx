'use client'
import React, { useState, useEffect } from 'react';
import { Home, Building2, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import PropertySearch from '../search/propertysearch';

// Default fallback images (high-quality warehouse/commercial property images)
const DEFAULT_IMAGES = [
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&q=80',
  'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1200&q=80',
  'https://images.unsplash.com/photo-1565008576549-57569a49371d?w=1200&q=80',
  'https://images.unsplash.com/photo-1553413077-190dd305871c?w=1200&q=80'
];

export default function HeroWithBanner() {
  const [bannerImages, setBannerImages] = useState<string[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Fetch images from S3 on mount
  useEffect(() => {
    fetchBannerImages();
  }, []);

  // Auto-rotate slides only when images are loaded
  useEffect(() => {
    if (bannerImages.length === 0) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerImages.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, [bannerImages.length]);

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
      // If API fails or returns empty, use default images
      setBannerImages(DEFAULT_IMAGES);
    } catch (error) {
      console.log('API fetch failed, using default images');
      setBannerImages(DEFAULT_IMAGES);
    } finally {
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + bannerImages.length) % bannerImages.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

 
  

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white">
      {/* Animated Banner Container - Increased height to accommodate cards */}
      <div className="relative h-[600px] md:h-[650px] lg:h-[700px] overflow-hidden">
        {/* Banner Images with Carousel */}
        <div className="absolute inset-0">
          {bannerImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                index === currentSlide
                  ? 'opacity-100 scale-100'
                  : 'opacity-0 scale-105'
              }`}
            >
              <div className="relative w-full h-full">
                <img
                  src={image}
                  alt={`Property ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
                {/* Gradient Overlay - Extended to cover cards area */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/80"></div>
                {/* Animated Pattern Overlay */}
                <div className="absolute inset-0 opacity-10">
                  <div
                    className="absolute inset-0 animate-pulse"
                    style={{
                      backgroundImage:
                        'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        {bannerImages.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/3 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110 shadow-lg"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/3 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110 shadow-lg"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Slide Indicators */}
        {bannerImages.length > 1 && (
          <div className="absolute top-[45%] left-1/2 -translate-x-1/2 z-30 flex gap-2">
            {bannerImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 ${
                  index === currentSlide
                    ? 'w-8 h-2 bg-white'
                    : 'w-2 h-2 bg-white/50 hover:bg-white/75'
                } rounded-full`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Hero Content Overlay - Positioned in upper portion */}
        <div className="absolute top-0 left-0 right-0 z-20 pt-16 md:pt-20 lg:pt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Main Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white drop-shadow-2xl animate-fade-in">
              List. Discover. Connect.
            </h1>

            {/* Sub-text */}
            <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto text-white drop-shadow-lg">
              Properties by Owners, Agents & Builders – All in One Place
            </p>

            {/* Search Bar */}
           <PropertySearch/>
          </div>
        </div>

        {/* User Type Cards Section - Inside banner, positioned at bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-20 pb-8">
          <div className="max-w-5xl mx-auto ">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Property Owner Card */}
              <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group border border-gray-100 hover:border-red-200 transform hover:-translate-y-2">
                <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Home className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-red-600 transition-colors">
                  Property Owner
                </h3>
                <p className="text-gray-600 text-base leading-relaxed mb-4">
                  List your warehouse or commercial property and connect with verified buyers and tenants
                </p>
                <div className="flex items-center text-red-600 font-semibold group-hover:gap-2 transition-all">
                  <span>Get Started</span>
                  <ChevronRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Real Estate Agent Card */}
              <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group border border-gray-100 hover:border-red-200 transform hover:-translate-y-2">
                <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-red-600 transition-colors">
                  Real Estate Agent
                </h3>
                <p className="text-gray-600 text-base leading-relaxed mb-4">
                  Manage multiple properties and connect with potential clients efficiently
                </p>
                <div className="flex items-center text-red-600 font-semibold group-hover:gap-2 transition-all">
                  <span>Join Now</span>
                  <ChevronRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Company/Customer Card */}
              <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group border border-gray-100 hover:border-red-200 transform hover:-translate-y-2">
                <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-red-600 transition-colors">
                  Company / Customer
                </h3>
                <p className="text-gray-600 text-base leading-relaxed mb-4">
                  Find the perfect warehouse or commercial space for your business needs
                </p>
                <div className="flex items-center text-red-600 font-semibold group-hover:gap-2 transition-all">
                  <span>Find Space</span>
                  <ChevronRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </div>
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