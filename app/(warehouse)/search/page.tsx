'use client'

import { Suspense } from 'react';
import { useEffect, useState, useCallback, useMemo, memo, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  Building2, 
  MapPin, 
  IndianRupee, 
  Loader2, 
  Ruler, 
  Phone, 
  ChevronLeft, 
  ChevronRight, 
  ImageIcon,
  Map as MapIcon,
  Layers,
  Search,
  Grid3x3,
  Heart,
  Share2,
  Maximize2,
  CheckCircle2,
  Star,
  TrendingUp,
  Eye,
  Navigation,
  SlidersHorizontal,
  X,
  ChevronsUpDown,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { cn } from "@/lib/utils"

const Map = dynamic(() => import('./map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
    </div>
  ),
});

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
  distance?: number;
}

interface City {
  id?: string;
  city: string;
  stateCode?: string;
  latitude?: number;
  longitude?: number;
}

// Interface for map bounds
interface MapBounds {
  ne: { lat: number; lng: number };
  sw: { lat: number; lng: number };
}

const ITEMS_PER_PAGE = 20;

// Calculate distance between two coordinates using Haversine formula
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Enhanced City Search Component
const CitySearch = memo(({ 
  initialCity, 
  onCitySelect 
}: { 
  initialCity?: string;
  onCitySelect: (city: City) => void;
}) => {
  const [searchQuery, setSearchQuery] = useState(initialCity || '');
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchCities = useCallback(async (query: string) => {
    if (query.trim().length < 1) {
      setCities([]);
      return;
    }

    try {
      setIsLoadingCities(true);
      setError(null);

      const res = await fetch(`/api/cities?search=${encodeURIComponent(query)}`);

      if (!res.ok) {
        throw new Error('Failed to fetch cities');
      }

      const data = await res.json();

      if (!Array.isArray(data)) {
        throw new Error('Invalid data format');
      }

      setCities(data);
    } catch (error) {
      console.error("Error fetching cities:", error);
      setError('Unable to load cities. Please try again.');
      setCities([]);
    } finally {
      setIsLoadingCities(false);
    }
  }, []);

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      if (searchQuery.trim().length >= 1) {
        fetchCities(searchQuery);
      } else {
        setCities([]);
      }
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchQuery, fetchCities]);

  useEffect(() => {
    if (selectedCity && searchQuery) {
      const currentDisplay = selectedCity.stateCode
        ? `${selectedCity.city}, ${selectedCity.stateCode}`
        : selectedCity.city;
      
      if (searchQuery !== currentDisplay) {
        setSelectedCity(null);
      }
    } else if (selectedCity && !searchQuery) {
      setSelectedCity(null);
    }
  }, [searchQuery, selectedCity]);

  const handleCitySelect = (city: City) => {
    if (!city || !city.city) return;

    setSelectedCity(city);
    const displayText = city.stateCode
      ? `${city.city}, ${city.stateCode}`
      : city.city;
    setSearchQuery(displayText);
    setIsOpen(false);
    onCitySelect(city);
  };

  const handleClear = () => {
    setSearchQuery('');
    setSelectedCity(null);
    setCities([]);
    setIsOpen(false);
  };

  return (
    <div ref={searchRef} className="relative flex-1 max-w-md">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => {
            setIsOpen(true);
            if (searchQuery.trim().length >= 1) {
              fetchCities(searchQuery);
            }
          }}
          placeholder="Search by city..."
          className="w-full pl-10 pr-20 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
          autoComplete="off"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {isLoadingCities && (
            <Loader2 className="h-4 w-4 animate-spin text-orange-600" />
          )}
          {searchQuery && !isLoadingCities && (
            <button
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <ChevronsUpDown className="h-4 w-4 text-gray-400" />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-80 overflow-y-auto">
          {error ? (
            <div className="px-4 py-3 text-sm text-orange-600">
              <div className="font-semibold">Error loading cities</div>
              <div className="text-xs mt-1">{error}</div>
            </div>
          ) : isLoadingCities ? (
            <div className="px-4 py-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-orange-500 border-t-transparent rounded-full"></div>
                Searching cities...
              </div>
            </div>
          ) : searchQuery.trim().length < 1 ? (
            <div className="px-4 py-3 text-sm text-gray-600">
              Start typing to search cities...
            </div>
          ) : cities.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-600">
              No cities found matching "{searchQuery}"
            </div>
          ) : (
            <div>
              {cities.map((city) => (
                <button
                  key={city.id || city.city}
                  onClick={() => handleCitySelect(city)}
                  className="w-full px-4 py-3 text-left hover:bg-orange-50 transition-colors border-b border-gray-100 last:border-b-0 flex items-center gap-3"
                >
                  <CheckCircle2
                    className={cn(
                      "h-4 w-4 text-orange-600 flex-shrink-0",
                      selectedCity?.city === city.city &&
                      (selectedCity?.stateCode === city.stateCode || (!selectedCity?.stateCode && !city.stateCode))
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  <MapPin className="h-4 w-4 text-blue-800/70 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">
                      {city.stateCode ? `${city.city}, ${city.stateCode}` : city.city}
                    </div>
                    {city.latitude && city.longitude && (
                      <div className="text-xs text-gray-500">
                        {Number(city.latitude).toFixed(4)}, {Number(city.longitude).toFixed(4)}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

CitySearch.displayName = 'CitySearch';

// Filter Panel Component
const FilterPanel = memo(({ 
  isOpen, 
  onClose,
  onApplyFilters 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onApplyFilters: (filters: any) => void;
}) => {
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sizeRange, setSizeRange] = useState({ min: '', max: '' });
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
  const [verified, setVerified] = useState(false);
  const [featured, setFeatured] = useState(false);

  const handleApply = () => {
    onApplyFilters({
      priceRange,
      sizeRange,
      propertyTypes,
      verified,
      featured
    });
    onClose();
  };

  const handleReset = () => {
    setPriceRange({ min: '', max: '' });
    setSizeRange({ min: '', max: '' });
    setPropertyTypes([]);
    setVerified(false);
    setFeatured(false);
  };

  const togglePropertyType = (type: string) => {
    setPropertyTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-orange-600 to-orange-700">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5" />
              Filters
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-orange-600" />
                Price per sqft
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Min</label>
                  <input
                    type="number"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                    placeholder="₹ 0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Max</label>
                  <input
                    type="number"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                    placeholder="₹ Any"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Ruler className="h-4 w-4 text-orange-600" />
                Space Available (sqft)
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Min</label>
                  <input
                    type="number"
                    value={sizeRange.min}
                    onChange={(e) => setSizeRange({ ...sizeRange, min: e.target.value })}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Max</label>
                  <input
                    type="number"
                    value={sizeRange.max}
                    onChange={(e) => setSizeRange({ ...sizeRange, max: e.target.value })}
                    placeholder="Any"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-orange-600" />
                Property Type
              </h3>
              <div className="space-y-2">
                {['Warehouse', 'Cold Storage', 'Industrial', 'Logistics', 'Distribution Center'].map((type) => (
                  <label key={type} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={propertyTypes.includes(type)}
                      onChange={() => togglePropertyType(type)}
                      className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <span className="text-gray-700 group-hover:text-orange-600 transition-colors">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Additional Filters</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={verified}
                    onChange={(e) => setVerified(e.target.checked)}
                    className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="text-gray-700 group-hover:text-orange-600 transition-colors flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Verified Only
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="text-gray-700 group-hover:text-orange-600 transition-colors flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    Featured Only
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 p-6 bg-gray-50 space-y-3">
            <button
              onClick={handleApply}
              className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-semibold py-3 rounded-lg shadow-lg transition-all"
            >
              Apply Filters
            </button>
            <button
              onClick={handleReset}
              className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-lg transition-all"
            >
              Reset All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

FilterPanel.displayName = 'FilterPanel';

// Compact Card for Split View
const CompactPropertyCard = memo(({ property, onHover }: { property: Property; onHover?: (property: Property | null) => void }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const hasImages = property.images && property.images.length > 0;
  const currentImage = hasImages ? property.images![currentImageIndex] : null;
  const totalImages = property.images?.length || 0;

  useEffect(() => {
    if (isHovered && hasImages && totalImages > 1) {
      const duration = 3000;
      
      const animate = (timestamp: number) => {
        if (!startTimeRef.current) {
          startTimeRef.current = timestamp;
        }

        const elapsed = timestamp - startTimeRef.current;
        const progress = (elapsed % duration) / duration;
        
        setScrollProgress(progress);

        if (elapsed >= duration) {
          setCurrentImageIndex((prev) => (prev + 1) % totalImages);
          startTimeRef.current = timestamp;
          setImageError(false);
        }

        animationFrameRef.current = requestAnimationFrame(animate);
      };

      animationFrameRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        startTimeRef.current = null;
        setScrollProgress(0);
      };
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      startTimeRef.current = null;
      setScrollProgress(0);
    }
  }, [isHovered, hasImages, totalImages]);

  const nextImage = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasImages && property.images) {
      setCurrentImageIndex((prev) => (prev + 1) % property.images!.length);
      setImageError(false);
      setScrollProgress(0);
      startTimeRef.current = null;
    }
  }, [hasImages, property.images]);

  const prevImage = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasImages && property.images) {
      setCurrentImageIndex((prev) => (prev - 1 + property.images!.length) % property.images!.length);
      setImageError(false);
      setScrollProgress(0);
      startTimeRef.current = null;
    }
  }, [hasImages, property.images]);

  const handleSave = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaved(!isSaved);
  }, [isSaved]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    onHover?.(property);
  }, [property, onHover]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    onHover?.(null);
  }, [onHover]);

  return (
    <Link href={`/property/${property.id}`}>
      <div 
        className="group bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-orange-400 hover:shadow-lg transition-all duration-300 cursor-pointer h-full flex flex-col"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="relative h-40 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
          {hasImages && currentImage && !imageError ? (
            <>
              <Image
                src={currentImage.s3_url}
                alt={property.title}
                fill
                className="object-cover transition-all duration-700 group-hover:scale-110"
                style={{
                  transform: isHovered && totalImages > 1 
                    ? `scale(1.1) translateX(-${scrollProgress * 15}%)` 
                    : undefined
                }}
                sizes="300px"
                onError={() => setImageError(true)}
                quality={90}
                unoptimized
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              
              {property.images && property.images.length > 1 && (
                <div className="absolute inset-0 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={prevImage}
                    className="bg-white/90 hover:bg-white p-1.5 rounded-full shadow-lg transition-transform hover:scale-110"
                  >
                    <ChevronLeft className="h-4 w-4 text-gray-800" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="bg-white/90 hover:bg-white p-1.5 rounded-full shadow-lg transition-transform hover:scale-110"
                  >
                    <ChevronRight className="h-4 w-4 text-gray-800" />
                  </button>
                </div>
              )}

              {property.images && property.images.length > 1 && (
                <>
                  <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-sm text-white text-xs px-2 py-1 rounded font-medium flex items-center gap-1 transition-all duration-300">
                    <ImageIcon className="h-3 w-3" />
                    {currentImageIndex + 1}/{property.images.length}
                  </div>
                  
                  {isHovered && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30">
                      <div 
                        className="h-full bg-orange-500 transition-all duration-100"
                        style={{ width: `${scrollProgress * 100}%` }}
                      />
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <ImageIcon className="h-12 w-12 text-gray-300" />
            </div>
          )}

          <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
            <div className="flex gap-1.5">
              <span className={`text-xs font-bold px-2 py-1 rounded shadow-md ${
                property.price_type === 'Sale' 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-blue-600 text-white'
              }`}>
                {property.price_type}
              </span>
              {property.is_featured && (
                <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded shadow-md flex items-center gap-0.5">
                  <Star className="h-3 w-3 inline fill-current" />
                </span>
              )}
            </div>
            <button
              onClick={handleSave}
              className="bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-md hover:bg-white transition-all"
            >
              <Heart className={`h-4 w-4 ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
            </button>
          </div>

          {property.distance !== undefined && property.distance > 0 && (
            <div className="absolute bottom-2 right-2 bg-black/75 backdrop-blur-sm text-white text-xs px-2 py-1 rounded font-medium">
              {property.distance.toFixed(1)} km
            </div>
          )}
        </div>

        <div className="p-3 flex flex-col flex-1">
          <h3 className="font-bold text-gray-900 text-sm mb-1.5 line-clamp-2 group-hover:text-orange-600 transition-colors leading-snug">
            {property.title}
          </h3>

          <div className="flex items-center gap-1 mb-2">
            <MapPin className="h-3.5 w-3.5 text-orange-500 flex-shrink-0" />
            <p className="text-xs text-gray-600 line-clamp-1">
              {property.city}, {property.state}
            </p>
          </div>

          <div className="flex items-center gap-1.5 mb-2 text-xs">
            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">
              {property.property_type}
            </span>
            {property.is_verified && (
              <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded flex items-center gap-0.5 font-medium">
                <CheckCircle2 className="h-3 w-3" />
                Verified
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-1.5 mb-2 pb-2 border-b border-gray-100">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Available</p>
              <p className="text-sm font-bold text-gray-900">
                {property.space_available?.toLocaleString('en-IN')} <span className="text-xs font-normal">sqft</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Total</p>
              <p className="text-sm font-bold text-gray-900">
                {property.warehouse_size?.toLocaleString('en-IN')} <span className="text-xs font-normal">sqft</span>
              </p>
            </div>
          </div>

          <div className="flex-1" />

          <div className="mb-2">
            <p className="text-xs text-gray-500 mb-0.5">Price per sqft</p>
            <div className="flex items-baseline gap-0.5">
              <IndianRupee className="h-4 w-4 text-orange-600" />
              <span className="text-lg font-bold text-orange-600">
                {property.price_per_sqft?.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-gray-600 font-medium">/sqft</span>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              window.location.href = `tel:${property.contact_person_phone}`;
            }}
            className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-semibold py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 text-xs shadow-md hover:shadow-lg"
          >
            <Phone className="h-3.5 w-3.5" />
            Contact Now
          </button>
        </div>
      </div>
    </Link>
  );
});

CompactPropertyCard.displayName = 'CompactPropertyCard';

// Grid Property Card
const PropertyCard = memo(({ property }: { property: Property }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const hasImages = property.images && property.images.length > 0;
  const currentImage = hasImages ? property.images![currentImageIndex] : null;
  const totalImages = property.images?.length || 0;

  useEffect(() => {
    if (isHovered && hasImages && totalImages > 1) {
      const duration = 3000;
      
      const animate = (timestamp: number) => {
        if (!startTimeRef.current) {
          startTimeRef.current = timestamp;
        }

        const elapsed = timestamp - startTimeRef.current;
        const progress = (elapsed % duration) / duration;
        
        setScrollProgress(progress);

        if (elapsed >= duration) {
          setCurrentImageIndex((prev) => (prev + 1) % totalImages);
          startTimeRef.current = timestamp;
          setImageError(false);
        }

        animationFrameRef.current = requestAnimationFrame(animate);
      };

      animationFrameRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        startTimeRef.current = null;
        setScrollProgress(0);
      };
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      startTimeRef.current = null;
      setScrollProgress(0);
    }
  }, [isHovered, hasImages, totalImages]);

  const nextImage = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasImages && property.images) {
      setCurrentImageIndex((prev) => (prev + 1) % property.images!.length);
      setImageError(false);
      setScrollProgress(0);
      startTimeRef.current = null;
    }
  }, [hasImages, property.images]);

  const prevImage = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasImages && property.images) {
      setCurrentImageIndex((prev) => (prev - 1 + property.images!.length) % property.images!.length);
      setImageError(false);
      setScrollProgress(0);
      startTimeRef.current = null;
    }
  }, [hasImages, property.images]);

  const handleSave = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaved(!isSaved);
  }, [isSaved]);

  return (
    <Link href={`/property/${property.id}`}>
      <div 
        className="group bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-orange-300 hover:shadow-xl transition-all duration-300 cursor-pointer h-full flex flex-col"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
          {hasImages && currentImage && !imageError ? (
            <>
              <Image
                src={currentImage.s3_url}
                alt={property.title}
                fill
                className="object-cover transition-all duration-700"
                style={{
                  transform: isHovered && totalImages > 1 
                    ? `scale(1.1) translateX(-${scrollProgress * 15}%)` 
                    : isHovered 
                    ? 'scale(1.1)' 
                    : 'scale(1)'
                }}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                onError={() => setImageError(true)}
                quality={90}
                unoptimized
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              
              {property.images && property.images.length > 1 && (
                <div className="absolute inset-0 flex items-center justify-between px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={prevImage}
                    className="bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-transform hover:scale-110"
                  >
                    <ChevronLeft className="h-4 w-4 text-gray-800" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-transform hover:scale-110"
                  >
                    <ChevronRight className="h-4 w-4 text-gray-800" />
                  </button>
                </div>
              )}
              
              {property.images && property.images.length > 1 && (
                <>
                  <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-sm text-white text-xs px-2 py-1 rounded font-medium">
                    {currentImageIndex + 1}/{property.images.length}
                  </div>
                  
                  {isHovered && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30">
                      <div 
                        className="h-full bg-orange-500 transition-all duration-100"
                        style={{ width: `${scrollProgress * 100}%` }}
                      />
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <ImageIcon className="h-12 w-12 text-gray-300" />
            </div>
          )}

          <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
            <div className="flex gap-2">
              <span className={`text-xs font-bold px-2.5 py-1 rounded shadow-md ${
                property.price_type === 'Sale' 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-blue-600 text-white'
              }`}>
                {property.price_type}
              </span>
              {property.is_featured && (
                <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded shadow-md flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current" />
                  Featured
                </span>
              )}
            </div>
            <button
              onClick={handleSave}
              className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white transition-all"
            >
              <Heart className={`h-4 w-4 ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
            </button>
          </div>
        </div>

        <div className="p-4 flex flex-col flex-1">
          <div className="flex items-baseline gap-1 mb-2">
            <IndianRupee className="h-5 w-5 text-orange-600" />
            <span className="text-2xl font-bold text-orange-600">
              {property.price_per_sqft?.toLocaleString('en-IN')}
            </span>
            <span className="text-sm text-gray-600 font-medium">/sqft</span>
          </div>

          <h3 className="font-bold text-gray-900 text-base mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
            {property.title}
          </h3>

          <div className="flex items-center gap-1 mb-3">
            <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <p className="text-sm text-gray-600 line-clamp-1">
              {property.city}, {property.state}
            </p>
          </div>

          <div className="flex items-center gap-2 mb-3 text-sm">
            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded font-medium">
              {property.property_type}
            </span>
            {property.is_verified && (
              <span className="bg-green-50 text-green-700 px-2 py-1 rounded flex items-center gap-1 font-medium">
                <CheckCircle2 className="h-3 w-3" />
                Verified
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3 pb-3 border-b border-gray-100">
            <div>
              <p className="text-xs text-gray-500 mb-1">Available</p>
              <p className="text-base font-bold text-gray-900">
                {property.space_available?.toLocaleString('en-IN')} <span className="text-xs font-normal">sqft</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Total Size</p>
              <p className="text-base font-bold text-gray-900">
                {property.warehouse_size?.toLocaleString('en-IN')} <span className="text-xs font-normal">sqft</span>
              </p>
            </div>
          </div>

          <div className="flex-1" />

          <button
            onClick={(e) => {
              e.preventDefault();
              window.location.href = `tel:${property.contact_person_phone}`;
            }}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Phone className="h-4 w-4" />
            Contact Now
          </button>
        </div>
      </div>
    </Link>
  );
});

PropertyCard.displayName = 'PropertyCard';

const LoadingSkeleton = () => (
  <div className="h-screen bg-white">
    <div className="animate-pulse">
      <div className="h-16 bg-gray-200"></div>
      <div className="flex">
        <div className="w-1/2 p-4 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
        <div className="w-1/2 bg-gray-200"></div>
      </div>
    </div>
  </div>
);

const ViewToggle = memo(({ layout, onLayoutChange }: { 
  layout: 'split' | 'grid' | 'map', 
  onLayoutChange: (layout: 'split' | 'grid' | 'map') => void 
}) => {
  return (
    <div className="inline-flex bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
      <button
        onClick={() => onLayoutChange('split')}
        className={`px-3 py-2 text-sm font-medium transition-colors ${
          layout === 'split'
            ? 'bg-orange-600 text-white'
            : 'text-gray-600 hover:bg-gray-50'
        }`}
        title="Split view"
      >
        <Layers className="h-4 w-4" />
      </button>
      <button
        onClick={() => onLayoutChange('grid')}
        className={`px-3 py-2 text-sm font-medium transition-colors border-l border-gray-300 ${
          layout === 'grid'
            ? 'bg-orange-600 text-white'
            : 'text-gray-600 hover:bg-gray-50'
        }`}
        title="Grid view"
      >
        <Grid3x3 className="h-4 w-4" />
      </button>
      <button
        onClick={() => onLayoutChange('map')}
        className={`px-3 py-2 text-sm font-medium transition-colors border-l border-gray-300 ${
          layout === 'map'
            ? 'bg-orange-600 text-white'
            : 'text-gray-600 hover:bg-gray-50'
        }`}
        title="Map view"
      >
        <MapIcon className="h-4 w-4" />
      </button>
    </div>
  );
});

ViewToggle.displayName = 'ViewToggle';

function SearchResults() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [layout, setLayout] = useState<'split' | 'grid' | 'map'>('split');
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high' | 'size-large' | 'size-small' | 'distance'>('newest');
  const [hoveredProperty, setHoveredProperty] = useState<Property | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Dynamic map state - ALWAYS ENABLED
  const [visiblePropertyIds, setVisiblePropertyIds] = useState<Set<number>>(new Set());
  const [isMapLoading, setIsMapLoading] = useState(false);

  const city = searchParams.get('city');
  const state = searchParams.get('state');
  const propertyType = searchParams.get('type');
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const distance = searchParams.get('distance');

  const initialCityDisplay = useMemo(() => {
    if (city && state) {
      return `${city}, ${state}`;
    } else if (city) {
      return city;
    }
    return '';
  }, [city, state]);

  // Handle map bounds change - filter visible properties
  const handleMapBoundsChange = useCallback((bounds: MapBounds) => {
    // Filter properties that are within the visible bounds
    const visibleIds = new Set<number>();
    
    properties.forEach(property => {
      if (property.latitude && property.longitude) {
        const lat = property.latitude;
        const lng = property.longitude;
        
        // Check if property is within bounds
        if (lat >= bounds.sw.lat && lat <= bounds.ne.lat &&
            lng >= bounds.sw.lng && lng <= bounds.ne.lng) {
          visibleIds.add(property.id);
        }
      }
    });
    
    setVisiblePropertyIds(visibleIds);
    setCurrentPage(1); // Reset to first page when bounds change
  }, [properties]);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (city) params.append('city', city);
        if (state) params.append('state', state);
        if (propertyType) params.append('type', propertyType);
        if (distance) params.append('distance', distance);
        if (lat) params.append('lat', lat);
        if (lng) params.append('lng', lng);

        const response = await fetch(`/api/warehouse/search?${params.toString()}`);
        if (!response.ok) {
          setProperties([]);
          setFilteredProperties([]);
          return;
        }

        const data = await response.json();
        if (data.success && data.properties) {
          let processedProperties = data.properties;
          
          if (lat && lng) {
            const searchLat = parseFloat(lat);
            const searchLng = parseFloat(lng);
            
            processedProperties = processedProperties.map((prop: Property) => ({
              ...prop,
              distance: prop.latitude && prop.longitude 
                ? calculateDistance(searchLat, searchLng, prop.latitude, prop.longitude)
                : undefined
            }));

            if (distance) {
              const maxDistance = parseFloat(distance);
              processedProperties = processedProperties.filter((p: Property) => 
                p.distance === undefined || p.distance <= maxDistance
              );
            }
          }
          
          if (city) {
            processedProperties = processedProperties.filter((p: Property) => 
              p.city.toLowerCase() === city.toLowerCase()
            );
          }

          setProperties(processedProperties);
          setFilteredProperties(processedProperties);
          
          // Initialize with all properties visible
          const allIds = new Set<number>(processedProperties.map((p: Property) => p.id));
          setVisiblePropertyIds(allIds);
        } else {
          setProperties([]);
          setFilteredProperties([]);
        }
      } catch (err) {
        console.error('Error fetching properties:', err);
        setProperties([]);
        setFilteredProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [city, state, propertyType, distance, lat, lng]);

  const handleCitySelect = useCallback((selectedCity: City) => {
    const params = new URLSearchParams();
    
    params.set('city', selectedCity.city);
    if (selectedCity.stateCode) {
      params.set('state', selectedCity.stateCode);
    }
    
    if (selectedCity.latitude !== undefined && selectedCity.longitude !== undefined) {
      params.set('lat', selectedCity.latitude.toString());
      params.set('lng', selectedCity.longitude.toString());
    }
    
    if (propertyType) {
      params.set('type', propertyType);
    }
    if (distance) {
      params.set('distance', distance);
    }
    
    router.push(`/search?${params.toString()}`);
  }, [router, propertyType, distance]);

  const handleApplyFilters = (filters: any) => {
    let filtered = [...properties];

    if (filters.priceRange.min) {
      filtered = filtered.filter(p => p.price_per_sqft >= parseFloat(filters.priceRange.min));
    }
    if (filters.priceRange.max) {
      filtered = filtered.filter(p => p.price_per_sqft <= parseFloat(filters.priceRange.max));
    }

    if (filters.sizeRange.min) {
      filtered = filtered.filter(p => p.space_available >= parseFloat(filters.sizeRange.min));
    }
    if (filters.sizeRange.max) {
      filtered = filtered.filter(p => p.space_available <= parseFloat(filters.sizeRange.max));
    }

    if (filters.propertyTypes.length > 0) {
      filtered = filtered.filter(p => filters.propertyTypes.includes(p.property_type));
    }

    if (filters.verified) {
      filtered = filtered.filter(p => p.is_verified);
    }

    if (filters.featured) {
      filtered = filtered.filter(p => p.is_featured);
    }

    setFilteredProperties(filtered);
    setCurrentPage(1);
  };

  const sortedProperties = useMemo(() => {
    const sorted = [...filteredProperties];
    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => (a.price_per_sqft || 0) - (b.price_per_sqft || 0));
      case 'price-high':
        return sorted.sort((a, b) => (b.price_per_sqft || 0) - (a.price_per_sqft || 0));
      case 'size-large':
        return sorted.sort((a, b) => (b.space_available || 0) - (a.space_available || 0));
      case 'size-small':
        return sorted.sort((a, b) => (a.space_available || 0) - (b.space_available || 0));
      case 'distance':
        return sorted.sort((a, b) => {
          if (a.distance === undefined) return 1;
          if (b.distance === undefined) return -1;
          return a.distance - b.distance;
        });
      case 'newest':
      default:
        return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  }, [filteredProperties, sortBy]);

  // Filter by visible properties when map bounds change
  const visibleProperties = useMemo(() => {
    if (visiblePropertyIds.size === 0) {
      return sortedProperties; // Show all if none visible (initial state)
    }
    return sortedProperties.filter(p => visiblePropertyIds.has(p.id));
  }, [sortedProperties, visiblePropertyIds]);

  const totalPages = Math.ceil(visibleProperties.length / ITEMS_PER_PAGE);
  const currentProperties = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return visibleProperties.slice(start, start + ITEMS_PER_PAGE);
  }, [visibleProperties, currentPage]);

  const mapProperties = useMemo(() => {
    return sortedProperties
      .filter(p => p.latitude && p.longitude)
      .map(p => ({
        ListingId: p.id.toString(),
        ListPrice: p.price_per_sqft * p.space_available,
        BedroomsTotal: 0,
        Bathrooms: 0,
        LivingArea: p.space_available,
        PropertyType: p.property_type,
        City: p.city,
        StateOrProvince: p.state,
        PostalCode: p.pincode,
        UnparsedAddress: p.address,
        ListAgentFullName: p.contact_person_name,
        PublicRemarks: p.description,
        Latitude: p.latitude,
        Longitude: p.longitude,
        ShowMapLink: "true",
        media: p.images?.map((img, idx) => ({
          url: img.s3_url,
          type: 'image',
          order: idx,
          description: p.title,
          isMain: img.is_primary
        }))
      }));
  }, [sortedProperties]);

  const mapCenter = useMemo(() => {
    if (lat && lng) {
      return { lat: parseFloat(lat), lng: parseFloat(lng) };
    }
    if (mapProperties.length > 0) {
      const avgLat = mapProperties.reduce((sum, p) => sum + p.Latitude, 0) / mapProperties.length;
      const avgLng = mapProperties.reduce((sum, p) => sum + p.Longitude, 0) / mapProperties.length;
      return { lat: avgLat, lng: avgLng };
    }
    return { lat: 19.07283, lng: 72.88261 };
  }, [lat, lng, mapProperties]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    const listContainer = document.getElementById('property-list');
    if (listContainer) {
      listContainer.scrollTop = 0;
    }
  }, []);

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {/* Top Control Bar */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-white shadow-sm z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4 flex-1 flex-wrap">
              <h1 className="text-lg font-bold text-gray-900 whitespace-nowrap">
                {visibleProperties.length.toLocaleString()} Properties
                <span className="text-sm font-normal text-gray-500 ml-2">
                  (of {sortedProperties.length.toLocaleString()} in viewport)
                </span>
              </h1>
              
              <div className="hidden lg:block h-6 w-px bg-gray-300"></div>
              
              <CitySearch 
                initialCity={initialCityDisplay}
                onCitySelect={handleCitySelect} 
              />
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 hidden md:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white hover:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent cursor-pointer transition-all"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="size-large">Largest Space</option>
                  <option value="size-small">Smallest Space</option>
                  {lat && lng && <option value="distance">Nearest First</option>}
                </select>
              </div>

              <button
                onClick={() => setShowFilters(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all shadow-sm"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="text-sm font-medium">Filters</span>
              </button>
              
              <ViewToggle layout={layout} onLayoutChange={setLayout} />
            </div>
          </div>
        </div>
      </div>

      <FilterPanel 
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        onApplyFilters={handleApplyFilters}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {visibleProperties.length === 0 ? (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center p-8">
              <div className="inline-block bg-white p-12 rounded-2xl shadow-md border border-gray-200">
                <div className="bg-gray-100 p-8 rounded-xl inline-block mb-6">
                  <Building2 className="h-16 w-16 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No Properties in View</h3>
                <p className="text-gray-600 mb-6 max-w-md">
                  Zoom out or pan the map to see more properties.
                </p>
              </div>
            </div>
          </div>
        ) : layout === 'split' ? (
          <>
            <div 
              id="property-list"
              className="w-full lg:w-1/2 overflow-y-auto bg-white"
              style={{ height: 'calc(100vh - 73px)' }}
            >
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentProperties.map((property) => (
                  <CompactPropertyCard 
                    key={property.id} 
                    property={property}
                    onHover={setHoveredProperty}
                  />
                ))}
              </div>
              
              {totalPages > 1 && (
                <div className="sticky bottom-0 bg-white border-t border-gray-200 shadow-lg">
                  <div className="flex items-center justify-center gap-2 p-4">
                    <button
                      onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`p-2.5 rounded-lg transition-all border ${
                        currentPage === 1
                          ? 'text-gray-400 cursor-not-allowed border-gray-200 bg-gray-50'
                          : 'text-gray-700 hover:bg-orange-50 border-gray-300 hover:border-orange-500 bg-white'
                      }`}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    
                    <div className="flex items-center gap-2">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`min-w-[42px] h-11 rounded-lg font-semibold transition-all border ${
                              currentPage === pageNum
                                ? 'bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-lg border-orange-700'
                                : 'text-gray-700 hover:bg-orange-50 border-gray-300 hover:border-orange-500 bg-white'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`p-2.5 rounded-lg transition-all border ${
                        currentPage === totalPages
                          ? 'text-gray-400 cursor-not-allowed border-gray-200 bg-gray-50'
                          : 'text-gray-700 hover:bg-orange-50 border-gray-300 hover:border-orange-500 bg-white'
                      }`}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div 
              className="hidden lg:block lg:w-1/2 relative bg-gray-100"
              style={{ height: 'calc(100vh - 73px)' }}
            >
              <Map 
                properties={mapProperties}
                center={mapCenter}
                zoom={11}
                onBoundsChange={handleMapBoundsChange}
              />
            </div>
          </>
        ) : layout === 'map' ? (
          <div className="flex-1 relative" style={{ height: 'calc(100vh - 73px)' }}>
            <Map 
              properties={mapProperties}
              center={mapCenter}
              zoom={11}
              onBoundsChange={handleMapBoundsChange}
            />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
            <div className="container mx-auto px-4 py-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {currentProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
              
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 py-8">
                  <button
                    onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2.5 rounded-lg transition-all border ${
                      currentPage === 1
                        ? 'text-gray-400 cursor-not-allowed border-gray-200 bg-gray-50'
                        : 'text-gray-700 hover:bg-orange-50 border-gray-300 hover:border-orange-500 bg-white'
                    }`}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  
                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`min-w-[42px] h-11 rounded-lg font-semibold transition-all border ${
                            currentPage === pageNum
                              ? 'bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-lg border-orange-700'
                              : 'text-gray-700 hover:bg-orange-50 border-gray-300 hover:border-orange-500 bg-white'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2.5 rounded-lg transition-all border ${
                      currentPage === totalPages
                        ? 'text-gray-400 cursor-not-allowed border-gray-200 bg-gray-50'
                        : 'text-gray-700 hover:bg-orange-50 border-gray-300 hover:border-orange-500 bg-white'
                    }`}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <SearchResults />
    </Suspense>
  );
}