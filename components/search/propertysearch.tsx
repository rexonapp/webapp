'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { MapPin, Search, Building2, Ruler, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { cn } from "@/lib/utils"

interface City {
  id?: string;
  city: string;
  stateCode?: string; // Optional since API might not always provide it
  latitude?: number;
  longitude?: number;
}

interface PropertyType {
  id: string;
  label: string;
}

interface Distance {
  id: string;
  label: string;
  value: number; // in metres
}

export default function PropertySearch() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [selectedPropertyType, setSelectedPropertyType] = useState('');
  const [selectedDistance, setSelectedDistance] = useState('');
  const router = useRouter();
  const [cities, setCities] = useState<City[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // Separate refs for each layout since all are rendered but hidden with CSS
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const desktopDropdownRef = useRef<HTMLDivElement>(null);
  const tabletInputRef = useRef<HTMLInputElement>(null);
  const tabletDropdownRef = useRef<HTMLDivElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Property types for commercial real estate
  const propertyTypes: PropertyType[] = [
    { id: 'warehouse', label: 'Warehouse' },
    { id: 'factory', label: 'Factory' },
    { id: 'industrial-shed', label: 'Industrial Shed' },
    { id: 'cold-storage', label: 'Cold Storage' },
    { id: 'commercial-land', label: 'Commercial Land' },
    { id: 'office-space', label: 'Office Space' },
    { id: 'showroom', label: 'Showroom' },
    { id: 'retail-space', label: 'Retail Space' },
    { id: 'manufacturing-unit', label: 'Manufacturing Unit' },
    { id: 'godown', label: 'Godown' }
  ];

  // Distance options in metres
  const distanceOptions: Distance[] = [
    { id: '500', label: '500 metres or less', value: 500 },
    { id: '1000', label: '1000 metres or less', value: 1000 },
    { id: '2000', label: '2000 metres or less', value: 2000 },
    { id: '5000', label: '5000 metres or less', value: 5000 },
    { id: '10000', label: '10000 metres or above', value: 10000 }
  ];
  

  // Fetch cities from API on component mount
  useEffect(() => {
    const fetchCities = async () => {
      try {
        setIsLoadingCities(true);
        setError(null);
        const res = await fetch("/api/cities");

        if (!res.ok) {
          throw new Error('Failed to fetch cities');
        }

        const data = await res.json();

        // Validate data structure
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format');
        }

        setCities(data);
        console.log(`✅ Loaded ${data.length} cities successfully`);
      } catch (error) {
        console.error("❌ Error fetching cities:", error);
        setError('Unable to load cities. Please refresh the page.');
        setCities([]); // Prevent breaking the site
      } finally {
        setIsLoadingCities(false);
      }
    };

    fetchCities();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // If click is outside the container entirely, close dropdown
      if (containerRef.current && !containerRef.current.contains(target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter cities based on search query with limit to prevent performance issues
  const filteredCities = useMemo(() => {
    if (!cities || cities.length === 0) {
      console.log('⚠️ No cities available for filtering');
      return [];
    }

    const query = searchQuery.toLowerCase().trim();

    // Don't show any cities if query is empty
    if (!query) {
      return [];
    }

    const filtered = cities
      .filter((city) => {
        // Skip invalid cities
        if (!city || !city.city) return false;

        // Safe toLowerCase with null checks
        const cityName = city.city?.toLowerCase() || '';
        const stateCode = city.stateCode?.toLowerCase() || '';

        return (
          cityName.includes(query) ||
          (stateCode && stateCode.includes(query))
        );
      })
      .slice(0, 50); // Limit to 50 results for performance

    console.log(`📊 Filtered ${filtered.length} cities (query: "${searchQuery}")`);
    return filtered;
  }, [cities, searchQuery]);

  const handleSearch = () => {
    // Build query parameters
    const params = new URLSearchParams();

    if (selectedCity && selectedCity.city) {
      params.append('city', selectedCity.city);
      // Only append state if it exists
      if (selectedCity.stateCode) {
        params.append('state', selectedCity.stateCode);
      }
      // Append geocodes if they exist - important for location-based search
      if (selectedCity.latitude !== undefined && selectedCity.longitude !== undefined) {
        params.append('lat', selectedCity.latitude.toString());
        params.append('lng', selectedCity.longitude.toString());
      }
    }

    if (selectedPropertyType) {
      params.append('type', selectedPropertyType);
    }

    if (selectedDistance) {
      params.append('distance', selectedDistance);
    }

    // Navigate to search results page with all filters
    router.push(`/search?${params.toString()}`);
    setShowDropdown(false);
  };

  const handleCitySelect = (city: City) => {
    if (!city || !city.city) return; // Safety check

    setSelectedCity(city);
    // Safe display with fallback
    const displayText = city.stateCode
      ? `${city.city}, ${city.stateCode}`
      : city.city;
    setSearchQuery(displayText);
    setShowDropdown(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowDropdown(true);
    setHighlightedIndex(-1); // Reset highlight when typing
    console.log('🔍 Search query:', value, 'Dropdown:', true);

    // Clear selected city if user is typing something different
    if (selectedCity) {
      const currentDisplay = selectedCity.stateCode
        ? `${selectedCity.city}, ${selectedCity.stateCode}`
        : selectedCity.city;
      if (value !== currentDisplay) {
        setSelectedCity(null);
      }
    }
  };

  const handleInputFocus = () => {
    console.log('👆 Input focused');
    // Only show dropdown if user has typed something
    if (searchQuery.trim().length > 0) {
      setShowDropdown(true);
    }
    setHighlightedIndex(-1);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || filteredCities.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredCities.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredCities.length) {
          handleCitySelect(filteredCities[highlightedIndex]);
        } else if (filteredCities.length === 1) {
          // Auto-select if only one result
          handleCitySelect(filteredCities[0]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowDropdown(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0) {
      const dropdowns = [desktopDropdownRef, tabletDropdownRef, mobileDropdownRef];
      dropdowns.forEach((ref) => {
        if (ref.current) {
          const highlightedElement = ref.current.children[highlightedIndex] as HTMLElement;
          if (highlightedElement) {
            highlightedElement.scrollIntoView({
              block: 'nearest',
              behavior: 'smooth',
            });
          }
        }
      });
    }
  }, [highlightedIndex]);
  
  return (
    <>
      <style jsx>{`
        @keyframes dropdown-enter {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-dropdown-enter {
          animation: dropdown-enter 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
      <div className="w-full max-w-4xl mx-auto px-4">
        <div ref={containerRef} className="relative shadow-lg border border-gray-200/50 bg-white/95 backdrop-blur-sm rounded-lg">
        {/* Desktop Layout - Hidden on mobile */}
        <div className="hidden lg:flex items-center">
          {/* City Typeahead */}
          <div className="flex-[2] min-w-0 flex items-center gap-2.5 px-4 py-3 border-r border-gray-200 relative">
            <MapPin className="h-4 w-4 text-red-600 flex-shrink-0" />
            <input
              ref={desktopInputRef}
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onKeyDown={handleKeyDown}
              placeholder="Search city..."
              className="flex-1 text-sm font-normal bg-transparent focus:outline-none placeholder:text-gray-500"
              autoComplete="off"
            />
            {showDropdown && (
              <div
                ref={desktopDropdownRef}
                className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl border border-white/60 rounded-xl shadow-2xl z-50 max-h-[250px] overflow-y-auto animate-dropdown-enter"
                style={{
                  boxShadow: '0 20px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
                }}
              >
                {error ? (
                  <div className="px-4 py-3 text-sm text-red-600 bg-red-50/80 backdrop-blur-sm m-2 rounded-lg">
                    <div className="font-semibold">Error loading cities</div>
                    <div className="text-xs mt-1">{error}</div>
                  </div>
                ) : isLoadingCities ? (
                  <div className="px-4 py-3 text-sm text-gray-600 m-2">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full"></div>
                      Loading cities...
                    </div>
                  </div>
                ) : cities.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-600 m-2">
                    No cities loaded. Please refresh the page.
                  </div>
                ) : filteredCities.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-600 m-2">
                    {searchQuery
                      ? `No city found matching "${searchQuery}".`
                      : 'Type city name to search...'}
                  </div>
                ) : (
                  filteredCities.map((city, index) => (
                    <div
                      key={city.id || index}
                      onClick={() => handleCitySelect(city)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={cn(
                        "mx-2 my-1 px-3 py-2.5 cursor-pointer flex items-center gap-2.5 text-sm transition-all duration-200 rounded-lg",
                        highlightedIndex === index
                          ? "bg-gradient-to-r from-red-50 to-red-100/80 backdrop-blur-sm shadow-md scale-[1.02] border border-red-200/50"
                          : "hover:bg-gray-50/80 hover:backdrop-blur-sm hover:scale-[1.01]"
                      )}
                    >
                      <Check
                        className={cn(
                          "h-4 w-4 text-red-600 flex-shrink-0 transition-all duration-200",
                          selectedCity?.city === city.city &&
                          (selectedCity?.stateCode === city.stateCode || (!selectedCity?.stateCode && !city.stateCode))
                            ? "opacity-100 scale-110"
                            : "opacity-0 scale-90"
                        )}
                      />
                      <MapPin className="h-4 w-4 text-red-600/70 flex-shrink-0" />
                      <span className="font-medium text-gray-800">{city.stateCode ? `${city.city}, ${city.stateCode}` : city.city}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Property Type Dropdown */}
          <div className="flex-1 min-w-0 flex items-center gap-2 px-3.5 py-3 border-r border-gray-200">
            <Building2 className="h-4 w-4 text-red-600 flex-shrink-0" />
            <Select value={selectedPropertyType} onValueChange={setSelectedPropertyType}>
              <SelectTrigger className="flex-1 min-w-0 border-0 p-0 h-auto text-sm font-normal bg-transparent focus:ring-0 focus:ring-offset-0 [&>span]:truncate">
                <SelectValue placeholder="Property Type" className="text-gray-500" />
              </SelectTrigger>
              <SelectContent className="max-h-[250px]">
                {propertyTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id} className="text-sm">
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Distance Dropdown */}
          <div className="flex-1 min-w-0 flex items-center gap-2 px-3.5 py-3 border-r border-gray-200">
            <Ruler className="h-4 w-4 text-red-600 flex-shrink-0" />
            <Select value={selectedDistance} onValueChange={setSelectedDistance}>
              <SelectTrigger className="flex-1 min-w-0 border-0 p-0 h-auto text-sm font-normal bg-transparent focus:ring-0 focus:ring-offset-0 [&>span]:truncate">
                <SelectValue placeholder="Distance" className="text-gray-500" />
              </SelectTrigger>
              <SelectContent className="max-h-[250px]">
                {distanceOptions.map((distance) => (
                  <SelectItem key={distance.id} value={distance.id} className="text-sm">
                    {distance.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search Button */}
          <Button
            onClick={handleSearch}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 h-auto rounded-none rounded-r-lg font-medium text-sm shadow-none flex items-center justify-center gap-2 transition-colors"
            aria-label="Search properties"
          >
            <Search className="h-4 w-4" />
            <span>Search</span>
          </Button>
        </div>

        {/* Tablet Layout - Hidden on mobile and desktop */}
        <div className="hidden md:flex lg:hidden flex-col">
          {/* City Typeahead */}
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-200 relative">
            <MapPin className="h-4 w-4 text-red-600 shrink-0" />
            <input
              ref={tabletInputRef}
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onKeyDown={handleKeyDown}
              placeholder="Search city..."
              className="flex-1 text-sm font-normal bg-transparent focus:outline-none placeholder:text-gray-500"
              autoComplete="off"
            />
            {showDropdown && (
              <div
                ref={tabletDropdownRef}
                className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl border border-white/60 rounded-xl shadow-2xl z-50 max-h-[250px] overflow-y-auto animate-dropdown-enter"
                style={{
                  boxShadow: '0 20px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
                }}
              >
                {error ? (
                  <div className="px-4 py-3 text-sm text-red-600 bg-red-50/80 backdrop-blur-sm m-2 rounded-lg">
                    <div className="font-semibold">Error loading cities</div>
                    <div className="text-xs mt-1">{error}</div>
                  </div>
                ) : isLoadingCities ? (
                  <div className="px-4 py-3 text-sm text-gray-600 m-2">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full"></div>
                      Loading cities...
                    </div>
                  </div>
                ) : cities.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-600 m-2">
                    No cities loaded. Please refresh the page.
                  </div>
                ) : filteredCities.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-600 m-2">
                    {searchQuery
                      ? `No city found matching "${searchQuery}".`
                      : 'Type city name to search...'}
                  </div>
                ) : (
                  filteredCities.map((city, index) => (
                    <div
                      key={city.id || index}
                      onClick={() => handleCitySelect(city)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={cn(
                        "mx-2 my-1 px-3 py-2.5 cursor-pointer flex items-center gap-2.5 text-sm transition-all duration-200 rounded-lg",
                        highlightedIndex === index
                          ? "bg-gradient-to-r from-red-50 to-red-100/80 backdrop-blur-sm shadow-md scale-[1.02] border border-red-200/50"
                          : "hover:bg-gray-50/80 hover:backdrop-blur-sm hover:scale-[1.01]"
                      )}
                    >
                      <Check
                        className={cn(
                          "h-4 w-4 text-red-600 flex-shrink-0 transition-all duration-200",
                          selectedCity?.city === city.city &&
                          (selectedCity?.stateCode === city.stateCode || (!selectedCity?.stateCode && !city.stateCode))
                            ? "opacity-100 scale-110"
                            : "opacity-0 scale-90"
                        )}
                      />
                      <MapPin className="h-4 w-4 text-red-600/70 flex-shrink-0" />
                      <span className="font-medium text-gray-800">{city.stateCode ? `${city.city}, ${city.stateCode}` : city.city}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Filters and Search Row */}
          <div className="flex items-center">
            <div className="flex-1 flex items-center gap-2 px-3.5 py-3 border-r border-gray-200">
              <Building2 className="h-4 w-4 text-red-600 shrink-0" />
              <Select value={selectedPropertyType} onValueChange={setSelectedPropertyType}>
                <SelectTrigger className="flex-1 border-0 p-0 h-auto text-sm font-normal bg-transparent focus:ring-0 focus:ring-offset-0">
                  <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent>
                  {propertyTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id} className="text-sm">
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 flex items-center gap-2 px-3.5 py-3 border-r border-gray-200">
              <Ruler className="h-4 w-4 text-red-600 shrink-0" />
              <Select value={selectedDistance} onValueChange={setSelectedDistance}>
                <SelectTrigger className="flex-1 border-0 p-0 h-auto text-sm font-normal bg-transparent focus:ring-0 focus:ring-offset-0">
                  <SelectValue placeholder="Distance" />
                </SelectTrigger>
                <SelectContent>
                  {distanceOptions.map((distance) => (
                    <SelectItem key={distance.id} value={distance.id} className="text-sm">
                      {distance.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleSearch}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-none rounded-br-lg font-medium text-sm shadow-none flex items-center justify-center gap-2"
            >
              <Search className="h-4 w-4" />
              <span>Search</span>
            </Button>
          </div>
        </div>

        {/* Mobile Layout - Visible only on mobile */}
        <div className="md:hidden">
          {/* City Typeahead */}
          <div className="flex items-center gap-2 px-3.5 py-3 border-b border-gray-200 relative">
            <MapPin className="h-4 w-4 text-red-600 shrink-0" />
            <input
              ref={mobileInputRef}
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onKeyDown={handleKeyDown}
              placeholder="Search city..."
              className="flex-1 text-sm font-normal bg-transparent focus:outline-none placeholder:text-gray-500"
              autoComplete="off"
            />
            {showDropdown && (
              <div
                ref={mobileDropdownRef}
                className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl border border-white/60 rounded-xl shadow-2xl z-50 max-h-[250px] overflow-y-auto animate-dropdown-enter"
                style={{
                  boxShadow: '0 20px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
                }}
              >
                {error ? (
                  <div className="px-3.5 py-3 text-xs text-red-600 bg-red-50/80 backdrop-blur-sm m-2 rounded-lg">
                    <div className="font-semibold">Error loading cities</div>
                    <div className="text-[10px] mt-1">{error}</div>
                  </div>
                ) : isLoadingCities ? (
                  <div className="px-3.5 py-3 text-xs text-gray-600 m-2">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-3 w-3 border-2 border-red-500 border-t-transparent rounded-full"></div>
                      Loading cities...
                    </div>
                  </div>
                ) : cities.length === 0 ? (
                  <div className="px-3.5 py-3 text-xs text-gray-600 m-2">
                    No cities loaded. Refresh page.
                  </div>
                ) : filteredCities.length === 0 ? (
                  <div className="px-3.5 py-3 text-xs text-gray-600 m-2">
                    {searchQuery
                      ? `No city found matching "${searchQuery}".`
                      : 'Type to search...'}
                  </div>
                ) : (
                  filteredCities.map((city, index) => (
                    <div
                      key={city.id || index}
                      onClick={() => handleCitySelect(city)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={cn(
                        "mx-2 my-1 px-3 py-2.5 cursor-pointer flex items-center gap-2 text-xs transition-all duration-200 rounded-lg",
                        highlightedIndex === index
                          ? "bg-gradient-to-r from-red-50 to-red-100/80 backdrop-blur-sm shadow-md scale-[1.02] border border-red-200/50"
                          : "hover:bg-gray-50/80 hover:backdrop-blur-sm hover:scale-[1.01]"
                      )}
                    >
                      <Check
                        className={cn(
                          "h-3.5 w-3.5 text-red-600 flex-shrink-0 transition-all duration-200",
                          selectedCity?.city === city.city &&
                          (selectedCity?.stateCode === city.stateCode || (!selectedCity?.stateCode && !city.stateCode))
                            ? "opacity-100 scale-110"
                            : "opacity-0 scale-90"
                        )}
                      />
                      <MapPin className="h-3.5 w-3.5 text-red-600/70 flex-shrink-0" />
                      <span className="font-medium text-gray-800">{city.stateCode ? `${city.city}, ${city.stateCode}` : city.city}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-2 border-b border-gray-200">
            <div className="flex items-center gap-1.5 px-3 py-3 border-r border-gray-200">
              <Building2 className="h-3.5 w-3.5 text-red-600 shrink-0" />
              <Select value={selectedPropertyType} onValueChange={setSelectedPropertyType}>
                <SelectTrigger className="flex-1 border-0 p-0 h-auto text-xs font-normal bg-transparent focus:ring-0 focus:ring-offset-0">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  {propertyTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id} className="text-xs">
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-3">
              <Ruler className="h-3.5 w-3.5 text-red-600 shrink-0" />
              <Select value={selectedDistance} onValueChange={setSelectedDistance}>
                <SelectTrigger className="flex-1 border-0 p-0 h-auto text-xs font-normal bg-transparent focus:ring-0 focus:ring-offset-0">
                  <SelectValue placeholder="Distance" />
                </SelectTrigger>
                <SelectContent>
                  {distanceOptions.map((distance) => (
                    <SelectItem key={distance.id} value={distance.id} className="text-xs">
                      {distance.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Mobile Search Button */}
          <Button
            onClick={handleSearch}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-none rounded-b-lg font-medium text-sm shadow-none flex items-center justify-center gap-2"
          >
            <Search className="h-4 w-4" />
            <span>Search Properties</span>
          </Button>
        </div>
      </div>
    </div>
    </>
  );
}