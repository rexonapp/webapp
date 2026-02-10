'use client'

import { useState, useEffect, useMemo } from 'react'
import { MapPin, Search, Building2, Ruler, Check, ChevronsUpDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
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
  const [openDesktop, setOpenDesktop] = useState(false);
  const [openTablet, setOpenTablet] = useState(false);
  const [openMobile, setOpenMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [selectedPropertyType, setSelectedPropertyType] = useState('');
  const [selectedDistance, setSelectedDistance] = useState('');
  const router = useRouter();
  const [cities, setCities] = useState<City[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  

  // Fetch cities from API on component mount with localStorage caching
  useEffect(() => {
    const CACHE_KEY = 'cities_cache';
    const CACHE_EXPIRY_KEY = 'cities_cache_expiry';
    const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

    const fetchCities = async () => {
      try {
        setIsLoadingCities(true);
        setError(null);

        // Try to load from localStorage first
        const cachedData = localStorage.getItem(CACHE_KEY);
        const cacheExpiry = localStorage.getItem(CACHE_EXPIRY_KEY);

        if (cachedData && cacheExpiry) {
          const now = Date.now();
          const expiryTime = parseInt(cacheExpiry, 10);

          // If cache is still valid, use it immediately
          if (now < expiryTime) {
            const parsedData = JSON.parse(cachedData);
            if (Array.isArray(parsedData) && parsedData.length > 0) {
              setCities(parsedData);
              setIsLoadingCities(false);
              console.log(`✅ Loaded ${parsedData.length} cities from localStorage cache`);
              return; // Use cached data, don't fetch from API
            }
          }
        }

        // Fetch from API if no valid cache
        const res = await fetch("/api/cities");

        if (!res.ok) {
          throw new Error('Failed to fetch cities');
        }

        const data = await res.json();

        // Validate data structure
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format');
        }

        // Store in localStorage for future use
        if (data.length > 0) {
          localStorage.setItem(CACHE_KEY, JSON.stringify(data));
          localStorage.setItem(CACHE_EXPIRY_KEY, (Date.now() + CACHE_DURATION).toString());
          console.log(`✅ Loaded ${data.length} cities from API and cached in localStorage`);
        }

        setCities(data);
      } catch (error) {
        console.error("❌ Error fetching cities:", error);

        // Try to fallback to localStorage even if expired
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
          try {
            const parsedData = JSON.parse(cachedData);
            if (Array.isArray(parsedData) && parsedData.length > 0) {
              setCities(parsedData);
              setError('Using cached cities data. Some information may be outdated.');
              console.log(`⚠️ API failed, using ${parsedData.length} cities from expired localStorage cache`);
              return;
            }
          } catch (parseError) {
            console.error("Failed to parse cached data:", parseError);
          }
        }

        // If no cache available, show error
        setError('Unable to load cities. Please refresh the page.');
        setCities([]);
      } finally {
        setIsLoadingCities(false);
      }
    };

    fetchCities();
  }, []);

  // Filter cities based on search query with limit to prevent performance issues
  const filteredCities = useMemo(() => {
    if (!cities || cities.length === 0) {
      return [];
    }

    const query = searchQuery.toLowerCase().trim();

    // If no query, return top 50 cities
    if (!query) {
      return cities.slice(0, 50);
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
    // Close all dropdowns
    setOpenDesktop(false);
    setOpenTablet(false);
    setOpenMobile(false);
  };

  const handleCitySelect = (city: City) => {
    if (!city || !city.city) return; // Safety check

    setSelectedCity(city);
    // Update search query to show selected city
    const displayText = city.stateCode
      ? `${city.city}, ${city.stateCode}`
      : city.city;
    setSearchQuery(displayText);
    // Close all dropdowns
    setOpenDesktop(false);
    setOpenTablet(false);
    setOpenMobile(false);
  };

  // Clear selected city when user types something different
  useEffect(() => {
    if (selectedCity && searchQuery) {
      const currentDisplay = selectedCity.stateCode
        ? `${selectedCity.city}, ${selectedCity.stateCode}`
        : selectedCity.city;
      if (searchQuery !== currentDisplay) {
        setSelectedCity(null);
      }
    }
  }, [searchQuery, selectedCity]);

  // Get display text for selected city
  const getDisplayText = () => {
    if (selectedCity) {
      return selectedCity.stateCode
        ? `${selectedCity.city}, ${selectedCity.stateCode}`
        : selectedCity.city;
    }
    return '';
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <div className="relative shadow-lg border border-gray-200/50 bg-white/95 backdrop-blur-sm rounded-lg">
        {/* Desktop Layout - Hidden on mobile */}
        <div className="hidden lg:flex items-stretch h-14">
          {/* City Typeahead */}
          <Popover open={openDesktop} onOpenChange={setOpenDesktop}>
            <PopoverAnchor asChild>
              <div className="flex-[2] min-w-0 flex items-center gap-2.5 px-4 border-r border-gray-200 relative h-full">
                <MapPin className="h-4 w-4 text-red-600 flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setOpenDesktop(true)}
                  placeholder="Type to search cities..."
                  className="flex-1 text-sm font-normal bg-transparent focus:outline-none placeholder:text-gray-500"
                  autoComplete="off"
                />
                <ChevronsUpDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
              </div>
            </PopoverAnchor>
            <PopoverContent
              className="w-[400px] p-0"
              align="start"
              sideOffset={4}
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <Command shouldFilter={false}>
                <CommandList>
                  {error ? (
                    <div className="px-4 py-3 text-sm text-red-600">
                      <div className="font-semibold">Error loading cities</div>
                      <div className="text-xs mt-1">{error}</div>
                    </div>
                  ) : isLoadingCities ? (
                    <div className="px-4 py-3 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full"></div>
                        Loading cities...
                      </div>
                    </div>
                  ) : cities.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-600">
                      No cities loaded. Please refresh the page.
                    </div>
                  ) : filteredCities.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-600">
                      {searchQuery ? `No cities found matching "${searchQuery}"` : 'Start typing to search cities...'}
                    </div>
                  ) : (
                    <CommandGroup>
                      {filteredCities.map((city) => (
                        <CommandItem
                          key={city.id || city.city}
                          value={`${city.city}-${city.stateCode || ''}`}
                          onSelect={() => handleCitySelect(city)}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Check
                            className={cn(
                              "h-4 w-4 text-red-600",
                              selectedCity?.city === city.city &&
                              (selectedCity?.stateCode === city.stateCode || (!selectedCity?.stateCode && !city.stateCode))
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          <MapPin className="h-4 w-4 text-red-600/70" />
                          <span>{city.stateCode ? `${city.city}, ${city.stateCode}` : city.city}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Property Type Dropdown */}
          <div className="flex-1 min-w-0 flex items-center gap-2 px-3.5 border-r border-gray-200 h-full">
            <Building2 className="h-4 w-4 text-red-600 flex-shrink-0" />
            <Select value={selectedPropertyType} onValueChange={setSelectedPropertyType}>
              <SelectTrigger className="flex-1 min-w-0 !border-0 border-transparent p-0 h-auto text-sm font-normal bg-transparent shadow-none focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=open]:ring-0 data-[state=open]:ring-offset-0 [&>span]:truncate">
                <SelectValue placeholder="Property Type" className="text-gray-500" />
              </SelectTrigger>
              {/* Position dropdown so its left edge starts roughly under the Property Type icon on desktop */}
              <SelectContent
                position="popper"
                align="start"
                sideOffset={4}
                className="max-h-[250px] -translate-x-10 mt-1.5"
              >
                {propertyTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id} className="text-sm ">
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Distance Dropdown */}
          <div className="flex-1 min-w-0 flex items-center gap-2 px-3.5 border-r border-gray-200 h-full">
            <Ruler className="h-4 w-4 text-red-600 flex-shrink-0" />
            <Select value={selectedDistance} onValueChange={setSelectedDistance}>
              <SelectTrigger className="flex-1 min-w-0 !border-0 border-transparent p-0 h-auto text-sm font-normal bg-transparent shadow-none focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=open]:ring-0 data-[state=open]:ring-offset-0 [&>span]:truncate">
                <SelectValue placeholder="Distance" className="text-gray-500" />
              </SelectTrigger>
              {/* Position dropdown so its left edge starts roughly under the Distance icon on desktop */}
              <SelectContent
                position="popper"
                align="start"
                sideOffset={4}
                className="max-h-[250px] -translate-x-10 mt-1.5"
              >
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
            className="bg-red-600 hover:bg-red-700 text-white px-6 !h-full rounded-none rounded-r-lg font-medium text-sm shadow-none flex items-center justify-center gap-2 transition-colors"
            aria-label="Search properties"
          >
            <Search className="h-4 w-4" />
            <span>Search</span>
          </Button>
        </div>

        {/* Tablet Layout - Hidden on mobile and desktop */}
        <div className="hidden md:flex lg:hidden flex-col">
          {/* City Typeahead */}
          <Popover open={openTablet} onOpenChange={setOpenTablet}>
            <PopoverAnchor asChild>
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-200 relative">
                <MapPin className="h-4 w-4 text-red-600 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setOpenTablet(true)}
                  placeholder="Type to search cities..."
                  className="flex-1 text-sm font-normal bg-transparent focus:outline-none placeholder:text-gray-500"
                  autoComplete="off"
                />
                <ChevronsUpDown className="h-4 w-4 text-gray-400 shrink-0" />
              </div>
            </PopoverAnchor>
            <PopoverContent
              className="w-[calc(100vw-2rem)] max-w-md p-0"
              align="start"
              sideOffset={4}
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <Command shouldFilter={false}>
                <CommandList>
                  {error ? (
                    <div className="px-4 py-3 text-sm text-red-600">
                      <div className="font-semibold">Error loading cities</div>
                      <div className="text-xs mt-1">{error}</div>
                    </div>
                  ) : isLoadingCities ? (
                    <div className="px-4 py-3 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full"></div>
                        Loading cities...
                      </div>
                    </div>
                  ) : cities.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-600">
                      No cities loaded. Please refresh the page.
                    </div>
                  ) : filteredCities.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-600">
                      {searchQuery ? `No cities found matching "${searchQuery}"` : 'Start typing to search cities...'}
                    </div>
                  ) : (
                    <CommandGroup>
                      {filteredCities.map((city) => (
                        <CommandItem
                          key={city.id || city.city}
                          value={`${city.city}-${city.stateCode || ''}`}
                          onSelect={() => handleCitySelect(city)}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Check
                            className={cn(
                              "h-4 w-4 text-red-600",
                              selectedCity?.city === city.city &&
                              (selectedCity?.stateCode === city.stateCode || (!selectedCity?.stateCode && !city.stateCode))
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          <MapPin className="h-4 w-4 text-red-600/70" />
                          <span>{city.stateCode ? `${city.city}, ${city.stateCode}` : city.city}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Filters and Search Row */}
          <div className="flex items-center">
            <div className="flex-1 flex items-center gap-2 px-3.5 py-3 border-r border-gray-200">
              <Building2 className="h-4 w-4 text-red-600 shrink-0" />
              <Select value={selectedPropertyType} onValueChange={setSelectedPropertyType}>
                <SelectTrigger className="flex-1 !border-0 border-transparent p-0 h-auto text-sm font-normal bg-transparent shadow-none focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=open]:ring-0 data-[state=open]:ring-offset-0">
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
                <SelectTrigger className="flex-1 !border-0 border-transparent p-0 h-auto text-sm font-normal bg-transparent shadow-none focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=open]:ring-0 data-[state=open]:ring-offset-0">
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
          <Popover open={openMobile} onOpenChange={setOpenMobile}>
            <PopoverAnchor asChild>
              <div className="flex items-center gap-2 px-3.5 py-3 border-b border-gray-200 relative">
                <MapPin className="h-4 w-4 text-red-600 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setOpenMobile(true)}
                  placeholder="Type to search..."
                  className="flex-1 text-sm font-normal bg-transparent focus:outline-none placeholder:text-gray-500"
                  autoComplete="off"
                />
                <ChevronsUpDown className="h-4 w-4 text-gray-400 shrink-0" />
              </div>
            </PopoverAnchor>
            <PopoverContent
              className="w-[var(--radix-popover-trigger-width)] max-w-[calc(100vw-2rem)] p-0"
              align="start"
              sideOffset={4}
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <Command shouldFilter={false}>
                <CommandList>
                  {error ? (
                    <div className="px-3.5 py-3 text-xs text-red-600">
                      <div className="font-semibold">Error loading cities</div>
                      <div className="text-[10px] mt-1">{error}</div>
                    </div>
                  ) : isLoadingCities ? (
                    <div className="px-3.5 py-3 text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin h-3 w-3 border-2 border-red-500 border-t-transparent rounded-full"></div>
                        Loading cities...
                      </div>
                    </div>
                  ) : cities.length === 0 ? (
                    <div className="px-3.5 py-3 text-xs text-gray-600">
                      No cities loaded. Refresh page.
                    </div>
                  ) : filteredCities.length === 0 ? (
                    <div className="px-3.5 py-3 text-xs text-gray-600">
                      {searchQuery ? `No cities found matching "${searchQuery}"` : 'Start typing to search...'}
                    </div>
                  ) : (
                    <CommandGroup>
                      {filteredCities.map((city) => (
                        <CommandItem
                          key={city.id || city.city}
                          value={`${city.city}-${city.stateCode || ''}`}
                          onSelect={() => handleCitySelect(city)}
                          className="flex items-center gap-2 text-xs cursor-pointer"
                        >
                          <Check
                            className={cn(
                              "h-3.5 w-3.5 text-red-600",
                              selectedCity?.city === city.city &&
                              (selectedCity?.stateCode === city.stateCode || (!selectedCity?.stateCode && !city.stateCode))
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          <MapPin className="h-3.5 w-3.5 text-red-600/70" />
                          <span className="font-medium text-gray-800">
                            {city.stateCode ? `${city.city}, ${city.stateCode}` : city.city}
                          </span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Filters Row */}
          <div className="grid grid-cols-2 border-b border-gray-200">
            <div className="flex items-center gap-1.5 px-3 py-3 border-r border-gray-200">
              <Building2 className="h-3.5 w-3.5 text-red-600 shrink-0" />
              <Select value={selectedPropertyType} onValueChange={setSelectedPropertyType}>
                <SelectTrigger className="flex-1 !border-0 border-transparent p-0 h-auto text-xs font-normal bg-transparent shadow-none focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=open]:ring-0 data-[state=open]:ring-offset-0">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                {/* Mobile: position dropdown so it starts under the Type icon */}
                <SelectContent
                  position="popper"
                  align="start"
                  sideOffset={4}
                  className="max-h-[250px] -translate-x-6"
                >
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
                <SelectTrigger className="flex-1 !border-0 border-transparent p-0 h-auto text-xs font-normal bg-transparent shadow-none focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=open]:ring-0 data-[state=open]:ring-offset-0">
                  <SelectValue placeholder="Distance" />
                </SelectTrigger>
                {/* Mobile: position dropdown so it starts under the Distance icon */}
                <SelectContent
                  position="popper"
                  align="start"
                  sideOffset={4}
                  className="max-h-[250px] -translate-x-6"
                >
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
  );
}