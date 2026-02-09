export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { cookies } from 'next/headers';
import ListingsComponent from './Listing';

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

async function getListings(): Promise<{ properties: Property[]; error?: string }> {
  try {
    const cookieStore = await cookies();
    
    // Use absolute URL for production, relative for development
    const isProduction = process.env.NODE_ENV === 'production';
    const baseUrl = isProduction 
      ? (process.env.NEXT_PUBLIC_URL || process.env.NEXT_PUBLIC_URL 
          ? `https://${process.env.NEXT_PUBLIC_URL}` 
          : 'http://localhost:3000')
      : 'http://localhost:3000';
    
    const url = `${baseUrl}/api/listings`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieStore.toString(),
      },
      cache: 'no-store',
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      // Handle different error status codes
      if (response.status === 401) {
        return { properties: [], error: 'Please sign in to view your listings' };
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.success) {
      return { properties: data.properties || [] };
    } else {
      return { properties: [], error: data.error || 'Failed to load properties' };
    }
  } catch (error) {
    console.error('Error fetching listings:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.name === 'AbortError' || error.name === 'TimeoutError') {
        return { properties: [], error: 'Request timed out. Please refresh the page.' };
      }
      return { properties: [], error: error.message };
    }
    
    return { 
      properties: [], 
      error: 'Unable to load listings. Please try again.'
    };
  }
}

export default async function MyListingsPage() {
  const { properties, error } = await getListings();

  return <ListingsComponent initialProperties={properties} initialError={error} />;
}