'use client'

import { useEffect, useState } from 'react';
import { Building2, MapPin, IndianRupee, Calendar, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
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
import Link from 'next/link';

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

const ITEMS_PER_PAGE = 10;

export default function MyListingsPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/listings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch properties');
      }

      const data = await response.json();

      if (data.success) {
        setProperties(data.properties || []);
      } else {
        throw new Error(data.error || 'Failed to load properties');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  // Pagination calculations
  const totalPages = Math.ceil(properties.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProperties = properties.slice(startIndex, endIndex);

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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string } } = {
      'Pending': { variant: 'secondary', label: 'Pending' },
      'Active': { variant: 'default', label: 'Active' },
      'Rejected': { variant: 'destructive', label: 'Rejected' },
      'Approved': { variant: 'default', label: 'Approved' },
    };

    const statusInfo = statusMap[status] || { variant: 'outline' as const, label: status };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getPriceTypeBadge = (priceType: string) => {
    const colorMap: { [key: string]: string } = {
      'Rent': 'bg-blue-100 text-blue-800 border-blue-200',
      'Sale': 'bg-green-100 text-green-800 border-green-200',
      'Lease': 'bg-purple-100 text-purple-800 border-purple-200',
    };

    return (
      <Badge className={colorMap[priceType] || 'bg-gray-100 text-gray-800'}>
        {priceType}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-red-600" />
            <p className="text-gray-600 font-medium">Loading your listings...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={fetchProperties} className="bg-red-600 hover:bg-red-700">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <span>Home</span>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">My Listings</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">My Listings</h1>
              <p className="text-gray-600">
                Manage and track all your property listings
              </p>
            </div>
            <Button
              onClick={fetchProperties}
              variant="outline"
              className="border-red-600 text-red-600 hover:bg-red-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Listings</p>
                  <p className="text-3xl font-bold text-gray-900">{properties.length}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-3xl font-bold text-green-600">
                    {properties.filter(p => p.status === 'Active').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {properties.filter(p => p.status === 'Pending').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Listings Table */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Property Listings</CardTitle>
            <CardDescription>
              View and manage all your property listings in one place
            </CardDescription>
          </CardHeader>
          <CardContent>
            {properties.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No listings yet</h3>
                <p className="text-gray-600 mb-4">
                  Start by adding your first property listing
                </p>
                <Link href={'/property'}>
                <Button className="bg-red-600 hover:bg-red-700">
                  Add New Property
                </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-bold">Property Title</TableHead>
                      <TableHead className="font-bold">Type</TableHead>
                      <TableHead className="font-bold">Area</TableHead>
                      <TableHead className="font-bold">Price/Sqft</TableHead>
                      <TableHead className="font-bold">Listing Type</TableHead>
                      <TableHead className="font-bold">Location</TableHead>
                      <TableHead className="font-bold">Available From</TableHead>
                      <TableHead className="font-bold">Status</TableHead>
                      <TableHead className="font-bold">Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentProperties.map((property) => (
                      <TableRow key={property.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium max-w-xs">
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-900">
                              {property.title}
                            </span>
                            {property.description && (
                              <span className="text-sm text-gray-500 truncate">
                                {property.description.substring(0, 50)}
                                {property.description.length > 50 ? '...' : ''}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium text-gray-700">
                            {property.property_type || 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm">
                            <span className="font-semibold text-gray-900">
                              {property.space_available?.toLocaleString() || 'N/A'}
                            </span>
                            <span className="ml-1 text-gray-500">{property.space_unit || ''}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm font-semibold text-gray-900">
                            <IndianRupee className="h-3 w-3 mr-0.5" />
                            {property.price_per_sqft?.toLocaleString() || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>
                          {property.price_type ? getPriceTypeBadge(property.price_type) : <span className="text-sm text-gray-500">N/A</span>}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-start text-sm">
                            <MapPin className="h-4 w-4 mr-1 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-900">{property.city || 'N/A'}</span>
                              <span className="text-gray-500">{property.state || 'N/A'}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm text-gray-700">
                            <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                            {property.available_from ? formatDate(property.available_from) : 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>
                          {property.status ? getStatusBadge(property.status) : <span className="text-sm text-gray-500">N/A</span>}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
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
        {properties.length > ITEMS_PER_PAGE && (
          <div className="mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Show first page, last page, current page, and pages around current
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
                          className="cursor-pointer"
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
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {/* Additional Info Section */}
        {properties.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-500">
            Showing {startIndex + 1}-{Math.min(endIndex, properties.length)} of {properties.length} {properties.length === 1 ? 'listing' : 'listings'}
          </div>
        )}
      </div>
    </div>
  );
}
