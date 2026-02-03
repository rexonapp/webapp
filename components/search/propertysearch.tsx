'use client'

import { useState } from 'react'
import { MapPin, Search, Building2, IndianRupee, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

interface City {
  city: string;
  state: string;
}

interface PropertyType {
  id: string;
  label: string;
}

interface PriceBudget {
  id: string;
  label: string;
  min?: number;
  max?: number;
}

export default function PropertySearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedPropertyType, setSelectedPropertyType] = useState('');
  const [selectedBudget, setSelectedBudget] = useState('');
  const router = useRouter();
  const [cities, setCities] = useState<City[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [citySuggestions, setCitySuggestions] = useState<any[]>([]);

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

  // Updated price budget ranges starting from ₹50,000
  const priceBudgets: PriceBudget[] = [
    { id: 'under-1l', label: 'Under ₹1L', max: 100000 },
    { id: '1l-5l', label: '₹1L - ₹5L', min: 100000, max: 500000 },
    { id: '5l-10l', label: '₹5L - ₹10L', min: 500000, max: 1000000 },
    { id: '10l-25l', label: '₹10L - ₹25L', min: 1000000, max: 2500000 },
    { id: '25l-50l', label: '₹25L - ₹50L', min: 2500000, max: 5000000 },
    { id: '50l-1cr', label: '₹50L - ₹1Cr', min: 5000000, max: 10000000 },
    { id: '1cr-2cr', label: '₹1Cr - ₹2Cr', min: 10000000, max: 20000000 },
    { id: '2cr-5cr', label: '₹2Cr - ₹5Cr', min: 20000000, max: 50000000 },
    { id: '5cr-10cr', label: '₹5Cr - ₹10Cr', min: 50000000, max: 100000000 },
    { id: 'above-10cr', label: 'Above ₹10Cr', min: 100000000 }
  ];
  
  // Major Indian cities for warehouse and commercial properties
  // const cities: City[] = [
  //   { city: 'Mumbai, Maharashtra', properties: '8,542' },
  //   { city: 'Delhi NCR', properties: '12,341' },
  //   { city: 'Bangalore, Karnataka', properties: '7,893' },
  //   { city: 'Hyderabad, Telangana', properties: '5,621' },
  //   { city: 'Chennai, Tamil Nadu', properties: '4,987' },
  //   { city: 'Pune, Maharashtra', properties: '5,234' },
  //   { city: 'Ahmedabad, Gujarat', properties: '3,876' },
  //   { city: 'Kolkata, West Bengal', properties: '3,456' },
  //   { city: 'Surat, Gujarat', properties: '2,341' },
  //   { city: 'Jaipur, Rajasthan', properties: '1,987' },
  //   { city: 'Lucknow, Uttar Pradesh', properties: '1,765' },
  //   { city: 'Kanpur, Uttar Pradesh', properties: '1,543' },
  //   { city: 'Nagpur, Maharashtra', properties: '1,432' },
  //   { city: 'Indore, Madhya Pradesh', properties: '1,298' },
  //   { city: 'Thane, Maharashtra', properties: '2,156' },
  //   { city: 'Bhopal, Madhya Pradesh', properties: '987' },
  //   { city: 'Visakhapatnam, Andhra Pradesh', properties: '1,123' },
  //   { city: 'Vadodara, Gujarat', properties: '1,045' },
  //   { city: 'Ghaziabad, Uttar Pradesh', properties: '876' },
  //   { city: 'Ludhiana, Punjab', properties: '765' },
  //   { city: 'Coimbatore, Tamil Nadu', properties: '654' },
  //   { city: 'Kochi, Kerala', properties: '598' },
  //   { city: 'Chandigarh', properties: '543' },
  //   { city: 'Noida, Uttar Pradesh', properties: '1,876' },
  //   { city: 'Gurugram, Haryana', properties: '2,234' }
  // ];
  
  // const filteredCities = cities.filter(city =>
  //   city.city.toLowerCase().includes(searchQuery.toLowerCase())
  // );
  
  // const fetchCities = async (query: string) => {
  //   if (query.length < 2) {
  //     setShowSuggestions(false);
  //     setCities([]);
  //     return;
  //   }
  
  //   try {
  //     setIsLoadingCities(true);
  //     const res = await fetch(`/api/cities?q=${encodeURIComponent(query)}`);
  //     const data = await res.json();
  //     setCitySuggestions(data);
  //     console.log(data, "data")
  //     setCities(data);
  //   } catch (err) {
  //     console.error("Failed to fetch cities", err);
  //     setCities([]);
  //   } finally {
  //     setIsLoadingCities(false);
  //   }
  // };


  const fetchCities = async (query: string) => {

    const res = await fetch("/api/cities");
    const cities = await res.json();
    console.log(cities);
  }
  
  
  
  const handleSearch = () => {
    // Build query parameters
    const params = new URLSearchParams();
    
    if (searchQuery.trim()) {
      params.append('location', searchQuery);
    }
    
    if (selectedPropertyType) {
      params.append('type', selectedPropertyType);
    }
    
    if (selectedBudget) {
      params.append('budget', selectedBudget);
    }
    
    // Navigate to search results page with all filters
    router.push(`/search?${params.toString()}`);
    setShowSuggestions(false);
  };
  
  // const handleCitySelect = (cityName: string) => {
  //   setSearchQuery(cityName);
  //   setShowSuggestions(false);
  // };

  const handleCitySelect = (city: City) => {
    setSearchQuery(`${city.city}, ${city.state}`);
    setShowSuggestions(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearFilter = (filterType: 'location' | 'type' | 'budget') => {
    if (filterType === 'location') setSearchQuery('');
    if (filterType === 'type') setSelectedPropertyType('');
    if (filterType === 'budget') setSelectedBudget('');
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <div className="overflow-hidden shadow-lg border border-gray-200/50 bg-white/95 backdrop-blur-sm rounded-lg">
        {/* Desktop Layout - Hidden on mobile */}
        <div className="hidden lg:flex items-center">
          {/* Location Input */}
          <div className="flex-[2] min-w-0 flex items-center gap-2.5 px-4 py-3 border-r border-gray-200 relative">
            <MapPin className="h-4 w-4 text-red-600 flex-shrink-0" />
            <Input
              type="text"
              placeholder="Search by city, locality or pincode"
              value={searchQuery}
              // onChange={(e) => {
              //   setSearchQuery(e.target.value);
              //   setShowSuggestions(true);
              // }}
              onChange={(e) => {
                const value = e.target.value;
                setSearchQuery(value);
                setShowSuggestions(true);
                fetchCities(value);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onKeyPress={handleKeyPress}
              className="flex-1 min-w-0 border-0 p-0 h-auto text-sm font-normal placeholder:text-gray-400 placeholder:font-normal bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              aria-label="Search for properties by location"
            />
            
            {/* Location Suggestions Dropdown */}
            {showSuggestions && searchQuery && (
              <Card className="absolute top-full left-0 right-0 mt-1 shadow-xl max-h-[320px] overflow-y-auto z-50 border border-gray-200 rounded-md">
                {/* {filteredCities.length > 0 ? */}
                {isLoadingCities ? (
                  <div className="p-3 text-sm text-gray-500 text-center">
                    Loading cities...
                  </div>
                ) : cities.length > 0 ?
                  (
                    <div className="divide-y divide-gray-100">
                      {cities.map((city, index) => (
                        <Button
                          key={index}
                        variant="ghost"
                        onClick={() => handleCitySelect(city)}
                        className="w-full justify-between px-3.5 py-2.5 h-auto rounded-none hover:bg-red-50/80 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-red-600/70 flex-shrink-0" />
                          <span className="text-sm text-gray-700 font-normal">  {city.city}, {city.state}</span>
                        </div>
                        {/* <span className="text-xs text-gray-500">{city.properties}</span> */}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4">
                    <p className="text-sm text-gray-500 text-center">No cities found</p>
                  </div>
                )}
              </Card>
            )}
          </div>
          
          {/* Property Type Dropdown */}
          <div className="flex-1 min-w-0 flex items-center gap-2 px-3.5 py-3 border-r border-gray-200">
            <Building2 className="h-4 w-4 text-red-600 flex-shrink-0" />
            <Select value={selectedPropertyType} onValueChange={setSelectedPropertyType}>
              <SelectTrigger className="flex-1 min-w-0 border-0 p-0 h-auto text-sm font-normal bg-transparent focus:ring-0 focus:ring-offset-0 [&>span]:truncate">
                <SelectValue placeholder="Property Type" className="text-gray-500" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {propertyTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id} className="text-sm">
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Budget Dropdown */}
          <div className="flex-1 min-w-0 flex items-center gap-2 px-3.5 py-3 border-r border-gray-200">
            <IndianRupee className="h-4 w-4 text-red-600 flex-shrink-0" />
            <Select value={selectedBudget} onValueChange={setSelectedBudget}>
              <SelectTrigger className="flex-1 min-w-0 border-0 p-0 h-auto text-sm font-normal bg-transparent focus:ring-0 focus:ring-offset-0 [&>span]:truncate">
                <SelectValue placeholder="Budget" className="text-gray-500" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {priceBudgets.map((budget) => (
                  <SelectItem key={budget.id} value={budget.id} className="text-sm">
                    {budget.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Search Button */}
          <Button
            onClick={handleSearch}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 h-auto rounded-none rounded-r-lg font-medium text-sm shadow-none flex items-center justify-center gap-2  transition-colors"
            aria-label="Search properties"
          >
            <Search className="h-4 w-4" />
            <span>Search</span>
          </Button>
        </div>

        {/* Tablet Layout - Hidden on mobile and desktop */}
        <div className="hidden md:flex lg:hidden flex-col">
          {/* Location Search */}
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-200 relative">
            <MapPin className="h-4 w-4 text-red-600 flex-shrink-0" />
            <Input
              type="text"
              placeholder="Search by city, locality or pincode"
              value={searchQuery}
              // onChange={(e) => {
              //   setSearchQuery(e.target.value);
              //   setShowSuggestions(true);
              // }}
              onChange={(e) => {
                const value = e.target.value;
                setSearchQuery(value);
                setShowSuggestions(true);
                fetchCities(value);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onKeyPress={handleKeyPress}
              className="flex-1 border-0 p-0 h-auto text-sm font-normal placeholder:text-gray-400 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            
            {/* Tablet Location Suggestions */}
            {showSuggestions && searchQuery && (
              <Card className="absolute top-full left-0 right-0 mt-1 shadow-xl max-h-[280px] overflow-y-auto z-50 border border-gray-200 rounded-md">
                {isLoadingCities ? (
                  <div className="p-3 text-sm text-gray-500 text-center">
                    Loading cities...
                  </div>
                ) : cities.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {cities.map((city, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        onClick={() => handleCitySelect(city)}
                        className="w-full justify-between px-3.5 py-2.5 h-auto rounded-none hover:bg-red-50/80"
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-red-600/70 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{city.city}</span>
                        </div>
                        <span className="text-xs text-gray-500">{city.state}</span>
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="p-3.5">
                    <p className="text-sm text-gray-500 text-center">No cities found</p>
                  </div>
                )}
              </Card>
            )}
          </div>

          {/* Filters and Search Row */}
          <div className="flex items-center">
            <div className="flex-1 flex items-center gap-2 px-3.5 py-3 border-r border-gray-200">
              <Building2 className="h-4 w-4 text-red-600 flex-shrink-0" />
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
              <IndianRupee className="h-4 w-4 text-red-600 flex-shrink-0" />
              <Select value={selectedBudget} onValueChange={setSelectedBudget}>
                <SelectTrigger className="flex-1 border-0 p-0 h-auto text-sm font-normal bg-transparent focus:ring-0 focus:ring-offset-0">
                  <SelectValue placeholder="Budget" />
                </SelectTrigger>
                <SelectContent>
                  {priceBudgets.map((budget) => (
                    <SelectItem key={budget.id} value={budget.id} className="text-sm">
                      {budget.label}
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
          {/* Location Search */}
          <div className="flex items-center gap-2 px-3.5 py-3 border-b border-gray-200 relative">
            <MapPin className="h-4 w-4 text-red-600 flex-shrink-0" />
            <Input
              type="text"
              placeholder="Search location..."
              value={searchQuery}
              // onChange={(e) => {
              //   setSearchQuery(e.target.value);
              //   setShowSuggestions(true);
              // }}
              onChange={(e) => {
                const value = e.target.value;
                setSearchQuery(value);
                setShowSuggestions(true);
                fetchCities(value);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onKeyPress={handleKeyPress}
              className="flex-1 border-0 p-0 h-auto text-sm font-normal placeholder:text-gray-400 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            
            {/* Mobile Location Suggestions */}
            {showSuggestions && searchQuery && (
              <Card className="absolute top-full left-0 right-0 mt-1 shadow-xl max-h-[240px] overflow-y-auto z-50 border border-gray-200 rounded-md">
              {isLoadingCities ? (
                  <div className="p-3 text-sm text-gray-500 text-center">
                    Loading cities...
                  </div>
                ) : cities.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {cities.map((city, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        onClick={() => handleCitySelect(city)}
                        className="w-full justify-between px-3 py-2.5 h-auto rounded-none hover:bg-red-50/80"
                      >
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3 w-3 text-red-600/70 flex-shrink-0" />
                          <span className="text-xs text-gray-700 truncate">{city.city}</span>
                        </div>
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">{city.state}</span>
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="p-3">
                    <p className="text-xs text-gray-500 text-center">No cities found</p>
                  </div>
                )}
              </Card>
            )}
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-2 border-b border-gray-200">
            <div className="flex items-center gap-1.5 px-3 py-3 border-r border-gray-200">
              <Building2 className="h-3.5 w-3.5 text-red-600 flex-shrink-0" />
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
              <IndianRupee className="h-3.5 w-3.5 text-red-600 flex-shrink-0" />
              <Select value={selectedBudget} onValueChange={setSelectedBudget}>
                <SelectTrigger className="flex-1 border-0 p-0 h-auto text-xs font-normal bg-transparent focus:ring-0 focus:ring-offset-0">
                  <SelectValue placeholder="Budget" />
                </SelectTrigger>
                <SelectContent>
                  {priceBudgets.map((budget) => (
                    <SelectItem key={budget.id} value={budget.id} className="text-xs">
                      {budget.label}
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

      {/* Active Filters Display */}
      {/* {(searchQuery || selectedPropertyType || selectedBudget) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {searchQuery && (
            <Badge variant="secondary" className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 rounded-md transition-colors">
              <MapPin className="h-3 w-3" />
              <span className="max-w-[120px] sm:max-w-[160px] truncate">{searchQuery}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearFilter('location')}
                className="h-4 w-4 p-0 hover:bg-blue-200/60 rounded-sm ml-0.5"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {selectedPropertyType && (
            <Badge variant="secondary" className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-md transition-colors">
              <Building2 className="h-3 w-3" />
              <span className="max-w-[120px] sm:max-w-[160px] truncate">{propertyTypes.find(t => t.id === selectedPropertyType)?.label}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearFilter('type')}
                className="h-4 w-4 p-0 hover:bg-emerald-200/60 rounded-sm ml-0.5"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {selectedBudget && (
            <Badge variant="secondary" className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 rounded-md transition-colors">
              <IndianRupee className="h-3 w-3" />
              <span className="max-w-[120px] sm:max-w-[160px] truncate">{priceBudgets.find(b => b.id === selectedBudget)?.label}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearFilter('budget')}
                className="h-4 w-4 p-0 hover:bg-purple-200/60 rounded-sm ml-0.5"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )} */}
    </div>
  );
}