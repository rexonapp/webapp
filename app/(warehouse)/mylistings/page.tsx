export const dynamic = 'force-dynamic';
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
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/listings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieStore.toString(),
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch properties');
    }

    const data = await response.json();

    if (data.success) {
      return { properties: data.properties || [] };
    } else {
      return { properties: [], error: data.error || 'Failed to load properties' };
    }
  } catch (error) {
    console.error('Error fetching listings:', error);
    return { 
      properties: [], 
      error: error instanceof Error ? error.message : 'An error occurred while fetching listings'
    };
  }
}

export default async function MyListingsPage() {
  const { properties, error } = await getListings();

  return <ListingsComponent initialProperties={properties} initialError={error} />;
}