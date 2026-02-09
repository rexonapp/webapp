'use client'

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Building2, MapPin, IndianRupee, Loader2, Filter, Ruler, Phone, ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import Link from 'next/link';

interface PropertyImage {
  id: number;
  file_name: string;
  file_type: string;
  s3_url: string;
  is_primary: boolean;
  image_order: number;
}

interface Property {
  id: number;
  property_name: string;
  title: string;
  description: string;
  property_type: string;
  space_available: number;
  space_unit: string;
  warehouse_size: number;
  available_from: string;
  price_type: string;
  price_per_sqft: number;
  address: string;
  city: string;
  state: string;
  pincode: string;
  road_connectivity: string;
  contact_person_name: string;
  contact_person_phone: string;
  contact_person_email: string;
  latitude: number;
  longitude: number;
  amenities: string[];
  is_verified: boolean;
  is_featured: boolean;
  status: string;
  created_at: string;
  updated_at: string;
  images?: PropertyImage[];
}

const ITEMS_PER_PAGE = 12;

// Enhanced Glassmorphic Property Card Component
function PropertyCard({ property }: { property: Property }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const hasImages = property.images && property.images.length > 0;
  const currentImage = hasImages ? (property.images ?? [])[currentImageIndex] : null;

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    if (hasImages && property.images && property.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % property.images!.length);
      setImageError(false);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    if (hasImages && property.images && property.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + property.images!.length) % property.images!.length);
      setImageError(false);
    }
  };

  const getPriceTypeBadge = (priceType: string) => {
    const colorMap: Record<string, string> = {
      'Rent': 'bg-gradient-to-r from-blue-500/90 to-blue-600/90 backdrop-blur-sm border border-white/20',
      'Sale': 'bg-gradient-to-r from-emerald-500/90 to-emerald-600/90 backdrop-blur-sm border border-white/20',
      'Lease': 'bg-gradient-to-r from-purple-500/90 to-purple-600/90 backdrop-blur-sm border border-white/20',
    };

    return (
      <Badge className={`${colorMap[priceType] || 'bg-gray-500/90 backdrop-blur-sm border border-white/20'} text-white text-xs font-semibold shadow-lg`}>
        {priceType}
      </Badge>
    );
  };

  return (
    <div 
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glassmorphic Card with Shadow */}
      <div className="relative overflow-hidden rounded-lg bg-white/40 backdrop-blur-md border border-white/60 shadow-lg hover:shadow-xl transition-all duration-500 h-full flex flex-col">
        
        {/* Enhanced Image Section - Landscape rectangular */}
        <div className="relative h-44 bg-gradient-to-br from-slate-100/50 to-slate-200/50 overflow-hidden">
          {hasImages && currentImage && !imageError ? (
            <>
              <Image
                src={currentImage.s3_url}
                alt={property.title}
                fill
                className={`object-cover transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                onError={() => setImageError(true)}
                priority={currentImageIndex === 0}
                quality={95}
                unoptimized
              />

              {/* Gradient Overlay for better text visibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />

              {/* Image Navigation */}
              {property.images && property.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className={`absolute left-2 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white p-1 rounded-full border border-white/30 transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'} shadow-md`}
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white p-1 rounded-full border border-white/30 transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'} shadow-md`}
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                  
                  {/* Image Counter */}
                  <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] px-2 py-0.5 rounded-full border border-white/20 font-medium shadow-md">
                    {currentImageIndex + 1}/{property.images.length}
                  </div>
                </>
              )}

              {/* Image Dots Indicator */}
              {property.images && property.images.length > 1 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {property.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentImageIndex(index);
                        setImageError(false);
                      }}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        index === currentImageIndex 
                          ? 'w-4 bg-white shadow-md' 
                          : 'w-1 bg-white/50 hover:bg-white/70'
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-200/50 to-slate-300/50 backdrop-blur-sm">
              <div className="bg-white/30 backdrop-blur-md p-4 rounded-lg border border-white/40 shadow-lg">
                <ImageIcon className="h-8 w-8 text-slate-400/70 mb-1 mx-auto" />
                <p className="text-[10px] font-medium text-slate-500">No Image</p>
              </div>
            </div>
          )}

          {/* Badges Overlay */}
          <div className="absolute top-2 left-2 right-2 flex justify-between items-start z-10">
            {property.is_featured && (
              <Badge className="bg-gradient-to-r from-amber-400/90 to-amber-500/90 backdrop-blur-sm text-white text-[9px] font-semibold shadow-md border border-white/20 px-2 py-0.5">
                ⭐ Featured
              </Badge>
            )}
            <div className="ml-auto">
              {getPriceTypeBadge(property.price_type)}
            </div>
          </div>
        </div>

        {/* Glassmorphic Content Section */}
        <div className="flex-1 flex flex-col bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-lg border-t border-white/60">
          <CardHeader className="pb-1.5 pt-3 px-4">
            <CardTitle className="text-sm font-bold text-slate-900 line-clamp-1 leading-tight mb-1">
              {property.title}
            </CardTitle>
            <div className="flex items-center gap-1.5">
              <Badge variant="secondary" className="bg-slate-100/80 backdrop-blur-sm text-slate-700 text-[9px] font-medium border border-slate-200/50 px-1.5 py-0">
                {property.property_type}
              </Badge>
              {property.is_verified && (
                <Badge className="bg-green-100/80 backdrop-blur-sm text-green-700 text-[9px] font-medium border border-green-200/50 px-1.5 py-0">
                  ✓ Verified
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="px-4 pb-3 flex-1 flex flex-col justify-between space-y-2">
            {/* Property Details - Horizontal Layout */}
            <div className="flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-700 flex-1 min-w-0">
                <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0" />
                <span className="truncate">
                  {property.city}, {property.state}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-slate-700 shrink-0">
                <Ruler className="h-3.5 w-3.5 text-blue-500" />
                <span className="font-semibold whitespace-nowrap">
                  {property.space_available?.toLocaleString('en-IN')} {property.space_unit || 'sqft'}
                </span>
              </div>
            </div>

            {/* Price Section - Horizontal */}
            <div className="bg-gradient-to-br from-slate-50/90 to-white/90 backdrop-blur-sm rounded-lg p-2 border border-slate-200/50 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-1">
                  <IndianRupee className="h-3.5 w-3.5 text-slate-700 shrink-0" />
                  <span className="text-lg font-bold text-slate-900">
                    {property.price_per_sqft?.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">/sqft</span>
                </div>
              </div>
            </div>

            {/* Contact Section */}
            <div className="">
              {property.contact_person_phone && (
                <a 
                  href={`tel:${property.contact_person_phone}`}
                  className="flex items-center justify-center gap-1.5 w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <Phone className="h-3.5 w-3.5" />
                  Contact Now
                </a>
              )}
            </div>
          </CardContent>
        </div>
      </div>
    </div>
  );
}

// Simple Loading Spinner Component
function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-red-600 mx-auto" />
        <p className="text-lg font-medium text-slate-700">Loading properties...</p>
      </div>
    </div>
  );
}

// Inner component that uses useSearchParams
function SearchResults() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const city = searchParams.get('city');
  const state = searchParams.get('state');
  const propertyType = searchParams.get('type');
  const distance = searchParams.get('distance');

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (city) params.append('city', city);
        if (state) params.append('state', state);
        if (propertyType) params.append('type', propertyType);
        if (distance) params.append('distance', distance);

        const response = await fetch(`/api/warehouse/search?${params.toString()}`);

        if (!response.ok) {
          // Silently handle errors - show empty results instead of error message
          console.error('Failed to fetch properties:', response.statusText);
          setProperties([]);
          setLoading(false);
          return;
        }

        const data = await response.json();

        if (data.success) {
          setProperties(data.properties || []);
        } else {
          // Silently handle API errors
          console.error('API error:', data.error);
          setProperties([]);
        }
      } catch (err) {
        // Silently handle network errors - show empty results
        console.error('Network error:', err);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [city, state, propertyType, distance]);

  const totalPages = Math.ceil(properties.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProperties = properties.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  // Removed error UI - errors now show empty results

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50/30 to-pink-50/20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Enhanced Header with Glassmorphism */}
        <div className="bg-white/50 backdrop-blur-lg rounded-2xl p-6 border border-white/60 shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                {properties.length} {properties.length === 1 ? 'Property' : 'Properties'} Found
              </h1>
              {(city || propertyType) && (
                <p className="text-base text-slate-600 mt-2 font-medium">
                  {propertyType && `${propertyType} in `}
                  {city && state && `${city}, ${state}`}
                </p>
              )}
            </div>
            <Link href="/">
              <Button 
                variant="outline" 
                size="lg" 
                className="bg-white/60 backdrop-blur-sm hover:bg-white/80 border-slate-200 hover:border-red-600 hover:text-red-600 transition-all duration-300 shadow-md"
              >
                <Filter className="h-5 w-5 mr-2" />
                Modify Search
              </Button>
            </Link>
          </div>
        </div>

        {/* Properties Grid */}
        {properties.length === 0 ? (
          <div className="bg-white/50 backdrop-blur-lg rounded-2xl border border-white/60 shadow-xl">
            <CardContent className="py-20 text-center">
              <div className="bg-white/40 backdrop-blur-md p-10 rounded-2xl inline-block border border-white/60 shadow-lg">
                <Building2 className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-slate-900 mb-3">No properties found</h3>
                <p className="text-slate-600 mb-6 text-lg">Try adjusting your search filters or search in a different location</p>
                <Link href="/">
                  <Button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg text-base px-8 py-6">
                    New Search
                  </Button>
                </Link>
              </div>
            </CardContent>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {currentProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>

            {/* Enhanced Pagination */}
            {properties.length > ITEMS_PER_PAGE && (
              <div className="flex flex-col items-center gap-6 pt-4">
                <div className="bg-white/50 backdrop-blur-lg rounded-2xl p-4 border border-white/60 shadow-xl">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                          className={`${currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-white/60'} transition-all`}
                        />
                      </PaginationItem>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => handlePageChange(page)}
                                isActive={currentPage === page}
                                className={`cursor-pointer transition-all ${currentPage === page ? 'bg-gradient-to-r from-red-600 to-red-700 text-white' : 'hover:bg-white/60'}`}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        }
                        return null;
                      })}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                          className={`${currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-white/60'} transition-all`}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>

                <p className="text-base text-slate-600 font-medium bg-white/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/60 shadow-lg">
                  Showing {startIndex + 1}-{Math.min(endIndex, properties.length)} of {properties.length} properties
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SearchResults />
    </Suspense>
  );
}