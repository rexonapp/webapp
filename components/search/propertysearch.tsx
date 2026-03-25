'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { MapPin, Search, Building2, Check, ChevronsUpDown, TrendingUp } from 'lucide-react'
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
} from '@/components/ui/popover'
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { cn } from "@/lib/utils"

interface City {
  id?: string;
  city: string;
  stateCode?: string;
  latitude?: number;
  longitude?: number;
  alternate_name?: string;
  all_names?: string[];
}

interface PropertyType {
  id: string;
  label: string;
}

const TOP_CITIES: City[] = [
  { id: 'bengaluru-KA', city: 'Bengaluru', stateCode: 'KA', latitude: 12.9716, longitude: 77.5946, all_names: ['Bengaluru', 'Bangalore'] },
  { id: 'chennai-TN', city: 'Chennai', stateCode: 'TN', latitude: 13.0827, longitude: 80.2707 },
  { id: 'delhi-DL', city: 'Delhi', stateCode: 'DL', latitude: 28.6139, longitude: 77.2090 },
  { id: 'hyderabad-TS', city: 'Hyderabad', stateCode: 'TS', latitude: 17.3850, longitude: 78.4867 },
  { id: 'vijayawada-AP', city: 'Vijayawada', stateCode: 'AP', latitude: 16.5062, longitude: 80.6480 },
  { id: 'visakhapatnam-AP', city: 'Visakhapatnam', stateCode: 'AP', latitude: 17.6868, longitude: 83.2185, all_names: ['Visakhapatnam', 'Vishakhapatnam', 'Vizag'] },
  { id: 'tirupati-AP', city: 'Tirupati', stateCode: 'AP', latitude: 13.6288, longitude: 79.4192 },
  { id: 'indore-MP', city: 'Indore', stateCode: 'MP', latitude: 22.7196, longitude: 75.8577 },
  { id: 'kolkata-WB', city: 'Kolkata', stateCode: 'WB', latitude: 22.5726, longitude: 88.3639, all_names: ['Kolkata', 'Calcutta'] },
  { id: 'bhopal-MP', city: 'Bhopal', stateCode: 'MP', latitude: 23.2599, longitude: 77.4126 },
  { id: 'mumbai-MH', city: 'Mumbai', stateCode: 'MH', latitude: 19.0760, longitude: 72.8777, all_names: ['Mumbai', 'Bombay'] },
  { id: 'ahmedabad-GJ', city: 'Ahmedabad', stateCode: 'GJ', latitude: 23.0225, longitude: 72.5714 },
];

export default function PropertySearch() {
  const [openDesktop, setOpenDesktop] = useState(false);
  const [openTablet, setOpenTablet] = useState(false);
  const [openMobile, setOpenMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [selectedPropertyType, setSelectedPropertyType] = useState('');
  const router = useRouter();
  const [cities, setCities] = useState<City[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // One ref per breakpoint — only the visible one will be in the DOM, so only that focus() fires
  const cityInputDesktopRef = useRef<HTMLInputElement>(null);
  const cityInputTabletRef = useRef<HTMLInputElement>(null);
  const cityInputMobileRef = useRef<HTMLInputElement>(null);

  const propertyTypes: PropertyType[] = [
    { id: 'warehouse', label: 'Warehouse' },
    { id: 'farm land', label: 'Farm Land' },
    { id: 'factory', label: 'Factory' },
    { id: 'industrial', label: 'Industrial' },
    { id: 'cold-storage', label: 'Cold Storage' },
    { id: 'commercial-land', label: 'Commercial Land' },
    { id: 'office-space', label: 'Office Space' },
    { id: 'showroom', label: 'Showroom' },
    { id: 'retail-space', label: 'Retail Space' },
    { id: 'manufacturing-unit', label: 'Manufacturing Unit' },
    { id: 'godown', label: 'Godown' }
  ];

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const fetchCities = useCallback(async (query: string) => {
    if (query.trim().length < 1) {
      setCities([]);
      return;
    }
    try {
      setIsLoadingCities(true);
      setError(null);
      const res = await fetch(`/api/cities?search=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error('Failed to fetch cities');
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error('Invalid data format');
      setCities(data);
    } catch (error) {
      console.error("❌ Error fetching cities:", error);
      setError('Unable to load cities. Please try again.');
      setCities([]);
    } finally {
      setIsLoadingCities(false);
    }
  }, []);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      if (searchQuery.trim().length >= 1) {
        fetchCities(searchQuery);
      } else {
        setCities([]);
      }
    }, 300);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchQuery, fetchCities]);

  const handleSearch = () => {
    // Guard: no city selected → focus the visible city input (opens dropdown) and bail
    if (!selectedCity) {
      cityInputDesktopRef.current?.focus();
      cityInputTabletRef.current?.focus();
      cityInputMobileRef.current?.focus();
      return;
    }

    const params = new URLSearchParams();

    if (selectedCity.city) {
      params.append('city', selectedCity.city);
      if (selectedCity.stateCode) params.append('state', selectedCity.stateCode);
      if (selectedCity.latitude !== undefined && selectedCity.longitude !== undefined) {
        params.append('lat', selectedCity.latitude.toString());
        params.append('lng', selectedCity.longitude.toString());
      }

      const allNames = selectedCity.all_names || [];
      const alternates = allNames.filter(
        (n) => n.toLowerCase() !== selectedCity.city.toLowerCase()
      );
      if (selectedCity.alternate_name) {
        selectedCity.alternate_name.split(',').forEach((n) => {
          const trimmed = n.trim();
          if (trimmed && !alternates.map(a => a.toLowerCase()).includes(trimmed.toLowerCase())) {
            alternates.push(trimmed);
          }
        });
      }
      if (alternates.length > 0) {
        params.append('alternate_names', alternates.join(','));
      }
    }

    if (selectedPropertyType) params.append('type', selectedPropertyType);

    router.push(`/search?${params.toString()}`);
    setOpenDesktop(false);
    setOpenTablet(false);
    setOpenMobile(false);
  };

  const handleCitySelect = (city: City) => {
    if (!city || !city.city) return;
    setSelectedCity(city);
    const displayText = city.stateCode ? `${city.city}, ${city.stateCode}` : city.city;
    setSearchQuery(displayText);
    setOpenDesktop(false);
    setOpenTablet(false);
    setOpenMobile(false);
  };

  useEffect(() => {
    if (selectedCity && searchQuery) {
      const currentDisplay = selectedCity.stateCode
        ? `${selectedCity.city}, ${selectedCity.stateCode}`
        : selectedCity.city;
      if (searchQuery !== currentDisplay) setSelectedCity(null);
    } else if (selectedCity && !searchQuery) {
      setSelectedCity(null);
    }
  }, [searchQuery, selectedCity]);

  const isSearching = searchQuery.trim().length >= 1;
  const displayCities = isSearching ? cities : TOP_CITIES;

  const DropdownContent = () => (
    <Command shouldFilter={false}>
      <CommandList>
        {error && isSearching ? (
          <div className="px-4 py-3 text-sm text-orange-600">
            <div className="font-semibold">Error loading cities</div>
            <div className="text-xs mt-1">{error}</div>
          </div>
        ) : isLoadingCities ? (
          <div className="px-4 py-3 text-sm text-gray-600 flex items-center gap-2">
            <div className="animate-spin h-4 w-4 border-2 border-orange-500 border-t-transparent rounded-full" />
            Searching cities...
          </div>
        ) : isSearching && cities.length === 0 ? (
          <div className="px-4 py-3 text-sm text-gray-600">
            No cities found matching &ldquo;{searchQuery}&rdquo;
          </div>
        ) : (
          <CommandGroup
            heading={
              !isSearching ? (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-orange-600 px-1 py-1">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Popular cities
                </span>
              ) : undefined
            }
          >
            {displayCities.map((city) => (
              <CommandItem
                key={city.id || city.city}
                value={`${city.city}-${city.stateCode || ''}`}
                onSelect={() => handleCitySelect(city)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Check
                  className={cn(
                    "h-4 w-4 text-orange-600 flex-shrink-0",
                    selectedCity?.city === city.city &&
                    (selectedCity?.stateCode === city.stateCode || (!selectedCity?.stateCode && !city.stateCode))
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                />
                <MapPin className="h-4 w-4 text-blue-800/70 flex-shrink-0" />
                <span>{city.stateCode ? `${city.city}, ${city.stateCode}` : city.city}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  );

  const MobileDropdownContent = () => (
    <Command shouldFilter={false}>
      <CommandList>
        {error && isSearching ? (
          <div className="px-3.5 py-3 text-xs text-orange-600">
            <div className="font-semibold">Error loading cities</div>
            <div className="text-[10px] mt-1">{error}</div>
          </div>
        ) : isLoadingCities ? (
          <div className="px-3.5 py-3 text-xs text-gray-600 flex items-center gap-2">
            <div className="animate-spin h-3 w-3 border-2 border-orange-500 border-t-transparent rounded-full" />
            Searching...
          </div>
        ) : isSearching && cities.length === 0 ? (
          <div className="px-3.5 py-3 text-xs text-gray-600">
            No cities found matching &ldquo;{searchQuery}&rdquo;
          </div>
        ) : (
          <CommandGroup
            heading={
              !isSearching ? (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-orange-600 px-1 py-0.5">
                  <TrendingUp className="h-3 w-3" />
                  Popular cities
                </span>
              ) : undefined
            }
          >
            {displayCities.map((city) => (
              <CommandItem
                key={city.id || city.city}
                value={`${city.city}-${city.stateCode || ''}`}
                onSelect={() => handleCitySelect(city)}
                className="flex items-center gap-2 text-xs cursor-pointer"
              >
                <Check
                  className={cn(
                    "h-3.5 w-3.5 text-orange-600 flex-shrink-0",
                    selectedCity?.city === city.city &&
                    (selectedCity?.stateCode === city.stateCode || (!selectedCity?.stateCode && !city.stateCode))
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                />
                <MapPin className="h-3.5 w-3.5 text-blue-800/70 flex-shrink-0" />
                <span className="font-medium text-gray-800">
                  {city.stateCode ? `${city.city}, ${city.stateCode}` : city.city}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  );

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <div className="relative shadow-lg border border-gray-200/50 bg-white/95 backdrop-blur-sm rounded-lg">

        {/* ── Desktop Layout ── */}
        <div className="hidden lg:flex items-stretch h-14">
          <Popover open={openDesktop} onOpenChange={setOpenDesktop}>
            <PopoverAnchor asChild>
              <div className="flex-[2] min-w-0 flex items-center gap-2.5 px-4 border-r border-gray-200 relative h-full">
                <MapPin className="h-4 w-4 text-blue-800 flex-shrink-0" />
                <input
                  ref={cityInputDesktopRef}
                  type="text"
                  id="hero-search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setOpenDesktop(true)}
                  placeholder="Search city..."
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
              <DropdownContent />
            </PopoverContent>
          </Popover>

          <div className="flex-1 min-w-0 flex items-center gap-2 px-3.5 border-r border-gray-200 h-full">
            <Building2 className="h-4 w-4 text-blue-800 flex-shrink-0" />
            <Select value={selectedPropertyType} onValueChange={setSelectedPropertyType}>
              <SelectTrigger className="flex-1 min-w-0 !border-0 border-transparent p-0 h-auto text-sm font-normal bg-transparent shadow-none focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=open]:ring-0 data-[state=open]:ring-offset-0 [&>span]:truncate">
                <SelectValue placeholder="Property Type" className="text-gray-500" />
              </SelectTrigger>
              <SelectContent position="popper" align="start" sideOffset={4} className="max-h-[250px] -translate-x-10 mt-1.5">
                {propertyTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id} className="text-sm">{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleSearch}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 !h-full rounded-none rounded-r-lg font-medium text-sm shadow-none flex items-center justify-center gap-2 transition-colors"
            aria-label="Search properties"
          >
            <Search className="h-4 w-4" />
            <span>Search</span>
          </Button>
        </div>

        {/* ── Tablet Layout ── */}
        <div className="hidden md:flex lg:hidden flex-col">
          <Popover open={openTablet} onOpenChange={setOpenTablet}>
            <PopoverAnchor asChild>
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-200 relative">
                <MapPin className="h-4 w-4 text-blue-800 shrink-0" />
                <input
                  ref={cityInputTabletRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setOpenTablet(true)}
                  placeholder="Search city..."
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
              <DropdownContent />
            </PopoverContent>
          </Popover>

          <div className="flex items-center">
            <div className="flex-1 flex items-center gap-2 px-3.5 py-3 border-r border-gray-200">
              <Building2 className="h-4 w-4 text-blue-800 shrink-0" />
              <Select value={selectedPropertyType} onValueChange={setSelectedPropertyType}>
                <SelectTrigger className="flex-1 !border-0 border-transparent p-0 h-auto text-sm font-normal bg-transparent shadow-none focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=open]:ring-0 data-[state=open]:ring-offset-0">
                  <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent>
                  {propertyTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id} className="text-sm">{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleSearch}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-none rounded-br-lg font-medium text-sm shadow-none flex items-center justify-center gap-2"
            >
              <Search className="h-4 w-4" />
              <span>Search</span>
            </Button>
          </div>
        </div>

        {/* ── Mobile Layout ── */}
        <div className="md:hidden">
          <Popover open={openMobile} onOpenChange={setOpenMobile}>
            <PopoverAnchor asChild>
              <div className="flex items-center gap-2 px-3.5 py-3 border-b border-gray-200 relative">
                <MapPin className="h-4 w-4 text-blue-800 shrink-0" />
                <input
                  ref={cityInputMobileRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setOpenMobile(true)}
                  placeholder="Search city..."
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
              <MobileDropdownContent />
            </PopoverContent>
          </Popover>

          <div className="grid grid-cols-2 border-b border-gray-200">
            <div className="flex items-center gap-1.5 px-3 py-3 border-r border-gray-200">
              <Building2 className="h-3.5 w-3.5 text-blue-800 shrink-0" />
              <Select value={selectedPropertyType} onValueChange={setSelectedPropertyType}>
                <SelectTrigger className="flex-1 !border-0 border-transparent p-0 h-auto text-xs font-normal bg-transparent shadow-none focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=open]:ring-0 data-[state=open]:ring-offset-0">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent position="popper" align="start" sideOffset={4} className="max-h-[250px] -translate-x-6">
                  {propertyTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id} className="text-xs">{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleSearch}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-none rounded-b-lg font-medium text-sm shadow-none flex items-center justify-center gap-2"
          >
            <Search className="h-4 w-4" />
            <span>Search Properties</span>
          </Button>
        </div>
      </div>
    </div>
  );
}