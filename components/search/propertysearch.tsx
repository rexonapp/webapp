'use client'

import { SetStateAction, useState } from 'react'
import { MapPin, Search } from 'lucide-react'

export default function PropertySearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('buy');
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const cities = [
    { name: 'San Francisco, CA', properties: '2,453' },
    { name: 'Los Angeles, CA', properties: '5,892' },
    { name: 'Seattle, WA', properties: '3,241' },
    { name: 'New York, NY', properties: '8,764' },
    { name: 'Austin, TX', properties: '2,987' },
    { name: 'Denver, CO', properties: '1,876' },
    { name: 'Boston, MA', properties: '2,134' },
    { name: 'Portland, OR', properties: '1,654' },
    { name: 'Miami, FL', properties: '3,456' },
    { name: 'Chicago, IL', properties: '4,321' }
  ];
  
  const filteredCities = cities.filter(city =>
    city.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleSearch = () => {
    if (searchQuery.trim()) {
      alert(`Searching for properties to ${searchType} in: ${searchQuery}`);
      setShowSuggestions(false);
    }
  };
  
  const handleCitySelect = (cityName: SetStateAction<string>) => {
    setSearchQuery(cityName);
    setShowSuggestions(false);
  };
  
  return (
    <div className="w-full max-w-3xl mx-auto relative">
      {/* Search Type Tabs */}
      {/* <div className="flex gap-2 mb-3">
        <button
          onClick={() => setSearchType('buy')}
          className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
            searchType === 'buy'
              ? 'bg-red-500 text-white shadow-sm'
              : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setSearchType('rent')}
          className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
            searchType === 'rent'
              ? 'bg-red-500 text-white shadow-sm'
              : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
          }`}
        >
          Rent
        </button>
        <button
          onClick={() => setSearchType('sold')}
          className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
            searchType === 'sold'
              ? 'bg-red-500 text-white shadow-sm'
              : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
          }`}
        >
          Sold
        </button>
      </div> */}
      
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="flex items-center">
          <div className="flex-1 flex items-center px-4 py-3">
            <MapPin className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Enter city, address, or ZIP code"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 outline-none text-gray-900 text-sm placeholder-gray-400"
            />
          </div>
          
          <button
            onClick={handleSearch}
            className="bg-red-500 text-white px-6 py-3 hover:bg-red-600 transition-colors flex items-center space-x-1.5 font-medium"
          >
            <Search className="h-4 w-4" />
            <span>Search</span>
          </button>
        </div>
      </div>
      
      {/* Suggestions Dropdown */}
      {showSuggestions && searchQuery && filteredCities.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-72 overflow-y-auto z-20">
          {filteredCities.map((city, index) => (
            <button
              key={index}
              onClick={() => handleCitySelect(city.name)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center justify-between border-b border-gray-100 last:border-b-0 group"
            >
              <div className="flex items-center space-x-2.5">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-900 font-medium">{city.name}</span>
              </div>
              <span className="text-xs text-gray-500">{city.properties} homes</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}