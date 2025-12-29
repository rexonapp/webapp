'use client'

import { useState } from 'react'
import { MapPin, Search, Building2, IndianRupee } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface City {
  name: string;
  properties: string;
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

  // Price budget ranges in Indian Rupees (lakhs and crores)
  const priceBudgets: PriceBudget[] = [
    { id: 'under-50l', label: 'Under ₹50 Lakhs', max: 5000000 },
    { id: '50l-1cr', label: '₹50 Lakhs - ₹1 Crore', min: 5000000, max: 10000000 },
    { id: '1cr-2cr', label: '₹1 Crore - ₹2 Crore', min: 10000000, max: 20000000 },
    { id: '2cr-5cr', label: '₹2 Crore - ₹5 Crore', min: 20000000, max: 50000000 },
    { id: '5cr-10cr', label: '₹5 Crore - ₹10 Crore', min: 50000000, max: 100000000 },
    { id: '10cr-20cr', label: '₹10 Crore - ₹20 Crore', min: 100000000, max: 200000000 },
    { id: 'above-20cr', label: 'Above ₹20 Crore', min: 200000000 }
  ];
  
  // Major Indian cities for warehouse and commercial properties
  const cities: City[] = [
    { name: 'Mumbai, Maharashtra', properties: '8,542' },
    { name: 'Delhi NCR', properties: '12,341' },
    { name: 'Bangalore, Karnataka', properties: '7,893' },
    { name: 'Hyderabad, Telangana', properties: '5,621' },
    { name: 'Chennai, Tamil Nadu', properties: '4,987' },
    { name: 'Pune, Maharashtra', properties: '5,234' },
    { name: 'Ahmedabad, Gujarat', properties: '3,876' },
    { name: 'Kolkata, West Bengal', properties: '3,456' },
    { name: 'Surat, Gujarat', properties: '2,341' },
    { name: 'Jaipur, Rajasthan', properties: '1,987' },
    { name: 'Lucknow, Uttar Pradesh', properties: '1,765' },
    { name: 'Kanpur, Uttar Pradesh', properties: '1,543' },
    { name: 'Nagpur, Maharashtra', properties: '1,432' },
    { name: 'Indore, Madhya Pradesh', properties: '1,298' },
    { name: 'Thane, Maharashtra', properties: '2,156' },
    { name: 'Bhopal, Madhya Pradesh', properties: '987' },
    { name: 'Visakhapatnam, Andhra Pradesh', properties: '1,123' },
    { name: 'Vadodara, Gujarat', properties: '1,045' },
    { name: 'Ghaziabad, Uttar Pradesh', properties: '876' },
    { name: 'Ludhiana, Punjab', properties: '765' },
    { name: 'Coimbatore, Tamil Nadu', properties: '654' },
    { name: 'Kochi, Kerala', properties: '598' },
    { name: 'Chandigarh', properties: '543' },
    { name: 'Noida, Uttar Pradesh', properties: '1,876' },
    { name: 'Gurugram, Haryana', properties: '2,234' }
  ];
  
  const filteredCities = cities.filter(city =>
    city.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
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
  
  const handleCitySelect = (cityName: string) => {
    setSearchQuery(cityName);
    setShowSuggestions(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Main Search Row */}
        <div className="flex flex-col lg:flex-row">
          {/* Location Input - Large and Prominent */}
          <div className="flex-[2] flex items-center px-6 py-4 border-b lg:border-b-0 lg:border-r border-gray-200 relative">
            <MapPin className="h-5 w-5 text-gray-500 mr-3 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search by city, locality or pincode"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onKeyPress={handleKeyPress}
              className="flex-1 outline-none text-gray-900 text-base font-medium placeholder-gray-400"
              aria-label="Search for properties by location"
            />
            
            {/* Location Suggestions Dropdown */}
            {showSuggestions && searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-80 overflow-y-auto z-30">
                {filteredCities.length > 0 ? (
                  filteredCities.map((city, index) => (
                    <button
                      key={index}
                      onClick={() => handleCitySelect(city.name)}
                      className="w-full text-left px-5 py-3.5 hover:bg-gray-50 transition-colors flex items-center justify-between border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900 font-medium">{city.name}</span>
                      </div>
                      <span className="text-xs text-gray-500 font-medium">{city.properties} properties</span>
                    </button>
                  ))
                ) : (
                  <div className="p-5">
                    <p className="text-sm text-gray-600 text-center">No cities found matching "{searchQuery}"</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Compact Filters Section */}
          <div className="flex flex-col sm:flex-row lg:flex-[1.2]">
            {/* Property Type Dropdown - Compact */}
            <div className="flex-1 flex items-center px-4 py-3 border-b sm:border-b-0 sm:border-r lg:border-r border-gray-200 bg-gray-50">
              <Building2 className="h-3.5 w-3.5 text-gray-500 mr-2 flex-shrink-0" />
              <select
                value={selectedPropertyType}
                onChange={(e) => setSelectedPropertyType(e.target.value)}
                className="flex-1 outline-none text-gray-700 text-xs font-medium bg-transparent cursor-pointer pr-1"
                aria-label="Select property type"
              >
                <option value="">Property Type</option>
                {propertyTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Price Budget Dropdown - Compact */}
            <div className="flex-1 flex items-center px-4 py-3 border-b sm:border-b-0 border-gray-200 bg-gray-50">
              <IndianRupee className="h-3.5 w-3.5 text-gray-500 mr-2 flex-shrink-0" />
              <select
                value={selectedBudget}
                onChange={(e) => setSelectedBudget(e.target.value)}
                className="flex-1 outline-none text-gray-700 text-xs font-medium bg-transparent cursor-pointer pr-1"
                aria-label="Select price budget"
              >
                <option value="">Budget</option>
                {priceBudgets.map((budget) => (
                  <option key={budget.id} value={budget.id}>
                    {budget.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Search Button - Bold and Prominent */}
          <button
            onClick={handleSearch}
            className="bg-red-600 text-white px-8 py-5 lg:py-0 hover:bg-red-700 active:bg-red-800 transition-all flex items-center justify-center space-x-2 font-semibold text-base shadow-sm"
            aria-label="Search properties"
          >
            <Search className="h-5 w-5" />
            <span className="hidden sm:inline">Search</span>
          </button>
        </div>
      </div>

      {/* Active Filters Display */}
      {(searchQuery || selectedPropertyType || selectedBudget) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {searchQuery && (
            <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <MapPin className="h-3 w-3 mr-1.5" />
              {searchQuery}
            </span>
          )}
          {selectedPropertyType && (
            <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Building2 className="h-3 w-3 mr-1.5" />
              {propertyTypes.find(t => t.id === selectedPropertyType)?.label}
            </span>
          )}
          {selectedBudget && (
            <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
              <IndianRupee className="h-3 w-3 mr-1.5" />
              {priceBudgets.find(b => b.id === selectedBudget)?.label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}