'use client'

import { useEffect, useState } from 'react';
import { Building2, MapPin, IndianRupee, Calendar, AlertCircle, RefreshCw, Filter, X, Search, SlidersHorizontal, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
  contact_person_designation: string;
  latitude: number;
  longitude: number;
  amenities: string[];
  is_verified: boolean;
  is_featured: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

interface FilterState {
  search: string;
  propertyType: string;
  priceType: string;
  status: string;
  city: string;
  state: string;
  minPrice: string;
  maxPrice: string;
  minArea: string;
  maxArea: string;
  isVerified: string;
  isFeatured: string;
}

interface ListingsComponentProps {
  initialProperties: Property[];
  initialError?: string;
}

const ITEMS_PER_PAGE = 10;

export default function ListingsComponent({ initialProperties, initialError }: ListingsComponentProps) {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>(initialProperties);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(initialError || null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    propertyType: 'all',
    priceType: 'all',
    status: 'all',
    city: 'all',
    state: 'all',
    minPrice: '',
    maxPrice: '',
    minArea: '',
    maxArea: '',
    isVerified: 'all',
    isFeatured: 'all',
  });

  // Extract unique values for dropdowns
  const uniquePropertyTypes = Array.from(new Set(properties.map(p => p.property_type).filter(Boolean)));
  const uniquePriceTypes = Array.from(new Set(properties.map(p => p.price_type).filter(Boolean)));
  const uniqueStatuses = Array.from(new Set(properties.map(p => p.status).filter(Boolean)));
  const uniqueCities = Array.from(new Set(properties.map(p => p.city).filter(Boolean)));
  const uniqueStates = Array.from(new Set(properties.map(p => p.state).filter(Boolean)));

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Use router.refresh() to trigger server-side re-fetch
    router.refresh();
    // Reset refreshing state after a delay
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Apply filters whenever filters or properties change
  useEffect(() => {
    let filtered = [...properties];

    if (filters.search.trim()) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.title?.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower) ||
        p.property_name?.toLowerCase().includes(searchLower) ||
        p.address?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.propertyType !== 'all') {
      filtered = filtered.filter(p => p.property_type === filters.propertyType);
    }

    if (filters.priceType !== 'all') {
      filtered = filtered.filter(p => p.price_type === filters.priceType);
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(p => p.status === filters.status);
    }

    if (filters.city !== 'all') {
      filtered = filtered.filter(p => p.city === filters.city);
    }

    if (filters.state !== 'all') {
      filtered = filtered.filter(p => p.state === filters.state);
    }

    if (filters.minPrice) {
      const minPrice = parseFloat(filters.minPrice);
      filtered = filtered.filter(p => p.price_per_sqft >= minPrice);
    }
    if (filters.maxPrice) {
      const maxPrice = parseFloat(filters.maxPrice);
      filtered = filtered.filter(p => p.price_per_sqft <= maxPrice);
    }

    if (filters.minArea) {
      const minArea = parseFloat(filters.minArea);
      filtered = filtered.filter(p => p.space_available >= minArea);
    }
    if (filters.maxArea) {
      const maxArea = parseFloat(filters.maxArea);
      filtered = filtered.filter(p => p.space_available <= maxArea);
    }

    if (filters.isVerified !== 'all') {
      const isVerified = filters.isVerified === 'true';
      filtered = filtered.filter(p => p.is_verified === isVerified);
    }

    if (filters.isFeatured !== 'all') {
      const isFeatured = filters.isFeatured === 'true';
      filtered = filtered.filter(p => p.is_featured === isFeatured);
    }

    setFilteredProperties(filtered);
    setCurrentPage(1);
  }, [filters, properties]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      propertyType: 'all',
      priceType: 'all',
      status: 'all',
      city: 'all',
      state: 'all',
      minPrice: '',
      maxPrice: '',
      minArea: '',
      maxArea: '',
      isVerified: 'all',
      isFeatured: 'all',
    });
  };

  const hasActiveFilters = () => {
    return filters.search !== '' ||
      filters.propertyType !== 'all' ||
      filters.priceType !== 'all' ||
      filters.status !== 'all' ||
      filters.city !== 'all' ||
      filters.state !== 'all' ||
      filters.minPrice !== '' ||
      filters.maxPrice !== '' ||
      filters.minArea !== '' ||
      filters.maxArea !== '' ||
      filters.isVerified !== 'all' ||
      filters.isFeatured !== 'all';
  };

  const totalPages = Math.ceil(filteredProperties.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProperties = filteredProperties.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string, icon: React.ReactNode }> = {
      'Pending': { variant: 'secondary', label: 'Pending', icon: <Clock className="h-3 w-3" /> },
      'Active': { variant: 'default', label: 'Active', icon: <CheckCircle className="h-3 w-3" /> },
      'Rejected': { variant: 'destructive', label: 'Rejected', icon: <X className="h-3 w-3" /> },
      'Approved': { variant: 'default', label: 'Approved', icon: <CheckCircle className="h-3 w-3" /> },
    };

    const statusInfo = statusMap[status] || { variant: 'outline' as const, label: status, icon: null };
    return (
      <Badge variant={statusInfo.variant} className="flex items-center gap-1 w-fit">
        {statusInfo.icon}
        {statusInfo.label}
      </Badge>
    );
  };

  const getPriceTypeBadge = (priceType: string) => {
    const colorMap: Record<string, string> = {
      'Rent': 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
      'Sale': 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
      'Lease': 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
    };

    return (
      <Badge variant="outline" className={`${colorMap[priceType] || 'bg-gray-50 text-gray-700'} font-medium`}>
        {priceType}
      </Badge>
    );
  };

  if (error && properties.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <Alert variant="destructive" className="border-red-200 bg-red-50">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="text-base">{error}</AlertDescription>
          </Alert>
          <div className="flex gap-3">
            <Button onClick={handleRefresh} className="bg-red-600 hover:bg-red-700 shadow-md">
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Try Again'}
            </Button>
            <Link href="/">
              <Button variant="outline" className="border-slate-300">
                Go to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="space-y-6">
          <div className="flex items-center text-sm text-slate-500 font-medium">
            <Link href="/" className="hover:text-red-600 transition-colors duration-200">
              Home
            </Link>
            <span className="mx-2.5">/</span>
            <span className="text-slate-900">My Listings</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="space-y-3">
              <h1 className="text-5xl font-bold text-slate-900 tracking-tight">My Listings</h1>
              <p className="text-lg text-slate-600 max-w-2xl">
                Manage and track all your property listings in one unified dashboard
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                variant="outline"
                className="border-slate-300 hover:border-red-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200 h-11 px-6"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
              <Link href="/property">
                <Button className="bg-red-600 hover:bg-red-700 shadow-lg hover:shadow-xl transition-all duration-200 h-11 px-6">
                  <Building2 className="h-4 w-4 mr-2" />
                  Add Property
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Error Alert (if there's an error but still have properties) */}
        {error && properties.length > 0 && (
          <Alert variant="destructive" className="border-amber-200 bg-amber-50">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <AlertDescription className="text-base text-amber-800">
              {error} - Showing cached data
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="relative overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-red-500 to-red-600" />
            <CardContent className="pt-6 pb-6 pl-8">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-600">Total Listings</p>
                  <p className="text-4xl font-bold text-slate-900">{properties.length}</p>
                  <p className="text-xs text-slate-500">All properties</p>
                </div>
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-500 to-emerald-600" />
            <CardContent className="pt-6 pb-6 pl-8">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-600">Active</p>
                  <p className="text-4xl font-bold text-emerald-600">
                    {properties.filter((p) => p.status === 'Active').length}
                  </p>
                  <p className="text-xs text-slate-500">Currently listed</p>
                </div>
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="h-8 w-8 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-500 to-amber-600" />
            <CardContent className="pt-6 pb-6 pl-8">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-600">Pending</p>
                  <p className="text-4xl font-bold text-amber-600">
                    {properties.filter((p) => p.status === 'Pending').length}
                  </p>
                  <p className="text-xs text-slate-500">Awaiting review</p>
                </div>
                <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center">
                  <Clock className="h-8 w-8 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-blue-600" />
            <CardContent className="pt-6 pb-6 pl-8">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-600">Filtered</p>
                  <p className="text-4xl font-bold text-blue-600">{filteredProperties.length}</p>
                  <p className="text-xs text-slate-500">Current view</p>
                </div>
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <Filter className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Bar */}
        <Card className="border-slate-200 shadow-md">
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    placeholder="Search by title, description, name, or address..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-12 h-12 text-base border-slate-300 focus:border-red-500 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="hidden lg:flex gap-3">
                <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger className="w-[150px] h-12 border-slate-300">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {uniqueStatuses.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filters.priceType} onValueChange={(value) => handleFilterChange('priceType', value)}>
                  <SelectTrigger className="w-[150px] h-12 border-slate-300">
                    <SelectValue placeholder="Listing Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {uniquePriceTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filters.propertyType} onValueChange={(value) => handleFilterChange('propertyType', value)}>
                  <SelectTrigger className="w-[170px] h-12 border-slate-300">
                    <SelectValue placeholder="Property Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Properties</SelectItem>
                    {uniquePropertyTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="h-12 border-2 border-slate-300 hover:border-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 relative px-6">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Advanced Filters
                    {hasActiveFilters() && (
                      <span className="absolute -top-2 -right-2 h-6 w-6 bg-red-600 rounded-full text-white text-xs flex items-center justify-center font-semibold">
                        {Object.values(filters).filter(v => v !== '' && v !== 'all').length}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-md overflow-y-auto p-0">
                  <SheetHeader className="px-6 py-5 border-b bg-slate-50/50">
                    <SheetTitle className="flex items-center justify-between text-xl">
                      <span>Advanced Filters</span>
                      {hasActiveFilters() && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearFilters}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 -mr-2"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Clear All
                        </Button>
                      )}
                    </SheetTitle>
                    <SheetDescription className="text-sm mt-1.5">
                      Refine your property search with detailed filters
                    </SheetDescription>
                  </SheetHeader>

                  <div className="px-6 py-6 space-y-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-xs text-slate-900 uppercase tracking-wider">Property Details</h4>
                      
                      <div className="space-y-2">
                        <Label htmlFor="propertyType" className="text-sm font-medium text-slate-700">Property Type</Label>
                        <Select value={filters.propertyType} onValueChange={(value) => handleFilterChange('propertyType', value)}>
                          <SelectTrigger id="propertyType" className="h-10">
                            <SelectValue placeholder="Select property type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Properties</SelectItem>
                            {uniquePropertyTypes.map(type => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="priceType" className="text-sm font-medium text-slate-700">Listing Type</Label>
                        <Select value={filters.priceType} onValueChange={(value) => handleFilterChange('priceType', value)}>
                          <SelectTrigger id="priceType" className="h-10">
                            <SelectValue placeholder="Select listing type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            {uniquePriceTypes.map(type => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="status" className="text-sm font-medium text-slate-700">Status</Label>
                        <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                          <SelectTrigger id="status" className="h-10">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            {uniqueStatuses.map(status => (
                              <SelectItem key={status} value={status}>{status}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-3 pt-6 border-t border-slate-200">
                      <h4 className="font-semibold text-xs text-slate-900 uppercase tracking-wider">Location</h4>
                      
                      <div className="space-y-2">
                        <Label htmlFor="state" className="text-sm font-medium text-slate-700">State</Label>
                        <Select value={filters.state} onValueChange={(value) => handleFilterChange('state', value)}>
                          <SelectTrigger id="state" className="h-10">
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All States</SelectItem>
                            {uniqueStates.map(state => (
                              <SelectItem key={state} value={state}>{state}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="city" className="text-sm font-medium text-slate-700">City</Label>
                        <Select value={filters.city} onValueChange={(value) => handleFilterChange('city', value)}>
                          <SelectTrigger id="city" className="h-10">
                            <SelectValue placeholder="Select city" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Cities</SelectItem>
                            {uniqueCities.map(city => (
                              <SelectItem key={city} value={city}>{city}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-3 pt-6 border-t border-slate-200">
                      <h4 className="font-semibold text-xs text-slate-900 uppercase tracking-wider">Price Range (₹/sqft)</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="minPrice" className="text-xs text-slate-600 font-medium">Min Price</Label>
                          <Input
                            id="minPrice"
                            type="number"
                            placeholder="0"
                            value={filters.minPrice}
                            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                            className="h-10 text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="maxPrice" className="text-xs text-slate-600 font-medium">Max Price</Label>
                          <Input
                            id="maxPrice"
                            type="number"
                            placeholder="∞"
                            value={filters.maxPrice}
                            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                            className="h-10 text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 pt-6 border-t border-slate-200">
                      <h4 className="font-semibold text-xs text-slate-900 uppercase tracking-wider">Area Range (sqft)</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="minArea" className="text-xs text-slate-600 font-medium">Min Area</Label>
                          <Input
                            id="minArea"
                            type="number"
                            placeholder="0"
                            value={filters.minArea}
                            onChange={(e) => handleFilterChange('minArea', e.target.value)}
                            className="h-10 text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="maxArea" className="text-xs text-slate-600 font-medium">Max Area</Label>
                          <Input
                            id="maxArea"
                            type="number"
                            placeholder="∞"
                            value={filters.maxArea}
                            onChange={(e) => handleFilterChange('maxArea', e.target.value)}
                            className="h-10 text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 pt-6 border-t border-slate-200">
                      <h4 className="font-semibold text-xs text-slate-900 uppercase tracking-wider">Property Features</h4>
                      
                      <div className="space-y-2">
                        <Label htmlFor="isVerified" className="text-sm font-medium text-slate-700">Verification Status</Label>
                        <Select value={filters.isVerified} onValueChange={(value) => handleFilterChange('isVerified', value)}>
                          <SelectTrigger id="isVerified" className="h-10">
                            <SelectValue placeholder="Select verification" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Properties</SelectItem>
                            <SelectItem value="true">Verified Only</SelectItem>
                            <SelectItem value="false">Unverified Only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="isFeatured" className="text-sm font-medium text-slate-700">Featured Status</Label>
                        <Select value={filters.isFeatured} onValueChange={(value) => handleFilterChange('isFeatured', value)}>
                          <SelectTrigger id="isFeatured" className="h-10">
                            <SelectValue placeholder="Select featured" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Properties</SelectItem>
                            <SelectItem value="true">Featured Only</SelectItem>
                            <SelectItem value="false">Non-Featured Only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                  </div>

                  {/* Sticky bottom buttons */}
                  <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 mt-auto">
                    <div className="flex gap-3">
                      <Button
                        onClick={clearFilters}
                        variant="outline"
                        className="flex-1 h-11 border-slate-300 hover:bg-slate-50"
                      >
                        Reset Filters
                      </Button>
                      <Button
                        onClick={() => setIsFilterOpen(false)}
                        className="flex-1 h-11 bg-red-600 hover:bg-red-700 shadow-sm"
                      >
                        Apply Filters
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              {hasActiveFilters() && (
                <Button
                  onClick={clearFilters}
                  variant="ghost"
                  className="h-12 text-red-600 hover:text-red-700 hover:bg-red-50 px-6"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>

            {hasActiveFilters() && (
              <div className="mt-5 flex flex-wrap gap-2 pt-5 border-t">
                <span className="text-sm text-slate-600 font-semibold">Active filters:</span>
                {filters.search && (
                  <Badge variant="secondary" className="gap-1.5 pl-3 pr-2 py-1.5 text-sm">
                    Search: "{filters.search}"
                    <button onClick={() => handleFilterChange('search', '')} className="hover:bg-slate-300 rounded-full p-0.5">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </Badge>
                )}
                {filters.propertyType !== 'all' && (
                  <Badge variant="secondary" className="gap-1.5 pl-3 pr-2 py-1.5 text-sm">
                    Type: {filters.propertyType}
                    <button onClick={() => handleFilterChange('propertyType', 'all')} className="hover:bg-slate-300 rounded-full p-0.5">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </Badge>
                )}
                {filters.priceType !== 'all' && (
                  <Badge variant="secondary" className="gap-1.5 pl-3 pr-2 py-1.5 text-sm">
                    Listing: {filters.priceType}
                    <button onClick={() => handleFilterChange('priceType', 'all')} className="hover:bg-slate-300 rounded-full p-0.5">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </Badge>
                )}
                {filters.status !== 'all' && (
                  <Badge variant="secondary" className="gap-1.5 pl-3 pr-2 py-1.5 text-sm">
                    Status: {filters.status}
                    <button onClick={() => handleFilterChange('status', 'all')} className="hover:bg-slate-300 rounded-full p-0.5">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </Badge>
                )}
                {filters.city !== 'all' && (
                  <Badge variant="secondary" className="gap-1.5 pl-3 pr-2 py-1.5 text-sm">
                    City: {filters.city}
                    <button onClick={() => handleFilterChange('city', 'all')} className="hover:bg-slate-300 rounded-full p-0.5">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </Badge>
                )}
                {filters.state !== 'all' && (
                  <Badge variant="secondary" className="gap-1.5 pl-3 pr-2 py-1.5 text-sm">
                    State: {filters.state}
                    <button onClick={() => handleFilterChange('state', 'all')} className="hover:bg-slate-300 rounded-full p-0.5">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </Badge>
                )}
                {(filters.minPrice || filters.maxPrice) && (
                  <Badge variant="secondary" className="gap-1.5 pl-3 pr-2 py-1.5 text-sm">
                    Price: ₹{filters.minPrice || '0'} - ₹{filters.maxPrice || '∞'}
                    <button 
                      onClick={() => {
                        handleFilterChange('minPrice', '');
                        handleFilterChange('maxPrice', '');
                      }}
                      className="hover:bg-slate-300 rounded-full p-0.5"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </Badge>
                )}
                {(filters.minArea || filters.maxArea) && (
                  <Badge variant="secondary" className="gap-1.5 pl-3 pr-2 py-1.5 text-sm">
                    Area: {filters.minArea || '0'} - {filters.maxArea || '∞'} sqft
                    <button 
                      onClick={() => {
                        handleFilterChange('minArea', '');
                        handleFilterChange('maxArea', '');
                      }}
                      className="hover:bg-slate-300 rounded-full p-0.5"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Listings Table */}
        <Card className="border-slate-200 shadow-md">
          <CardHeader className="pb-6 border-b bg-slate-50/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-slate-900">Property Listings</CardTitle>
                <CardDescription className="mt-2 text-base">
                  {filteredProperties.length === properties.length 
                    ? `Showing all ${properties.length} ${properties.length === 1 ? 'listing' : 'listings'}`
                    : `Showing ${filteredProperties.length} of ${properties.length} ${properties.length === 1 ? 'listing' : 'listings'}`
                  }
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-0 sm:px-6 py-6">
            {filteredProperties.length === 0 ? (
              <div className="text-center py-20 px-4">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Filter className="h-10 w-10 text-slate-400" />
                </div>
                <h3 className="text-2xl font-semibold text-slate-900 mb-3">
                  {properties.length === 0 ? 'No listings yet' : 'No listings match your filters'}
                </h3>
                <p className="text-slate-600 mb-8 max-w-md mx-auto text-lg">
                  {properties.length === 0 
                    ? 'Start by adding your first property listing to get started with your portfolio'
                    : 'Try adjusting your filters to see more results'}
                </p>
                {properties.length === 0 ? (
                  <Link href="/property">
                    <Button className="bg-red-600 hover:bg-red-700 shadow-lg h-12 px-8">
                      <Building2 className="h-5 w-5 mr-2" />
                      Add New Property
                    </Button>
                  </Link>
                ) : (
                  <Button onClick={clearFilters} variant="outline" className="border-red-600 text-red-600 hover:bg-red-50 h-12 px-8">
                    <X className="h-5 w-5 mr-2" />
                    Clear All Filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50 border-b-2 border-slate-200">
                      <TableHead className="font-bold text-slate-900 text-sm">Property Title</TableHead>
                      <TableHead className="font-bold text-slate-900 text-sm">Type</TableHead>
                      <TableHead className="font-bold text-slate-900 text-sm">Area</TableHead>
                      <TableHead className="font-bold text-slate-900 text-sm">Price/Sqft</TableHead>
                      <TableHead className="font-bold text-slate-900 text-sm">Listing Type</TableHead>
                      <TableHead className="font-bold text-slate-900 text-sm">Location</TableHead>
                      <TableHead className="font-bold text-slate-900 text-sm">Available From</TableHead>
                      <TableHead className="font-bold text-slate-900 text-sm">Status</TableHead>
                      <TableHead className="font-bold text-slate-900 text-sm">Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentProperties.map((property) => (
                      <TableRow 
                        key={property.id} 
                        className="hover:bg-slate-50 transition-colors border-b border-slate-100"
                      >
                        <TableCell className="font-medium max-w-xs py-5">
                          <div className="flex flex-col space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-slate-900 text-base">
                                {property.title}
                              </span>
                              {property.is_verified && (
                                <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200 px-2 py-0.5">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                              {property.is_featured && (
                                <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200 px-2 py-0.5">
                                  ⭐ Featured
                                </Badge>
                              )}
                            </div>
                            {property.description && (
                              <span className="text-sm text-slate-500 line-clamp-2">
                                {property.description.substring(0, 80)}
                                {property.description.length > 80 ? '...' : ''}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-5">
                          <span className="text-sm font-medium text-slate-700">
                            {property.property_type || 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell className="py-5">
                          <div className="flex items-baseline text-sm gap-1">
                            <span className="font-semibold text-slate-900 text-base">
                              {property.space_available?.toLocaleString('en-IN') || 'N/A'}
                            </span>
                            <span className="text-slate-500 text-sm">{property.space_unit || ''}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-5">
                          <div className="flex items-center text-sm font-semibold text-slate-900">
                            <IndianRupee className="h-4 w-4 mr-0.5" />
                            <span className="text-base">{property.price_per_sqft?.toLocaleString('en-IN') || 'N/A'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-5">
                          {property.price_type ? (
                            getPriceTypeBadge(property.price_type)
                          ) : (
                            <span className="text-sm text-slate-500">N/A</span>
                          )}
                        </TableCell>
                        <TableCell className="py-5">
                          <div className="flex items-start text-sm gap-2">
                            <MapPin className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                            <div className="flex flex-col">
                              <span className="font-medium text-slate-900">{property.city || 'N/A'}</span>
                              <span className="text-xs text-slate-500">{property.state || 'N/A'}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-5">
                          <div className="flex items-center text-sm text-slate-700 gap-2">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            {property.available_from ? formatDate(property.available_from) : 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell className="py-5">
                          {property.status ? (
                            getStatusBadge(property.status)
                          ) : (
                            <span className="text-sm text-slate-500">N/A</span>
                          )}
                        </TableCell>
                        <TableCell className="py-5">
                          <span className="text-sm text-slate-600">
                            {property.created_at ? formatDate(property.created_at) : 'N/A'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {filteredProperties.length > ITEMS_PER_PAGE && (
          <div className="flex flex-col items-center space-y-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                    className={
                      currentPage === 1
                        ? 'pointer-events-none opacity-50'
                        : 'cursor-pointer hover:bg-red-50 hover:text-red-600 transition-colors'
                    }
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
                          className={
                            currentPage === page
                              ? 'bg-red-600 text-white hover:bg-red-700 font-semibold'
                              : 'cursor-pointer hover:bg-red-50 hover:text-red-600 transition-colors'
                          }
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
                    className={
                      currentPage === totalPages
                        ? 'pointer-events-none opacity-50'
                        : 'cursor-pointer hover:bg-red-50 hover:text-red-600 transition-colors'
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>

            <div className="text-center text-sm text-slate-600 bg-slate-50 px-8 py-4 rounded-xl border border-slate-200">
              Showing <span className="font-semibold text-slate-900">{startIndex + 1}</span> to{' '}
              <span className="font-semibold text-slate-900">
                {Math.min(endIndex, filteredProperties.length)}
              </span>{' '}
              of <span className="font-semibold text-slate-900">{filteredProperties.length}</span>{' '}
              {filteredProperties.length === 1 ? 'listing' : 'listings'}
              {filteredProperties.length !== properties.length && (
                <span className="text-slate-500"> (filtered from {properties.length} total)</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}