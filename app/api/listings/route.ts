import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/session';

// Optimized GET endpoint to fetch user's property listings
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session || !session.userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.', success: false },
        { status: 401 }
      );
    }

    // Optimized query - fetch only necessary fields for listing display
    const warehousesResult = await query(
      `SELECT
        id,
        property_name,
        title,
        description,
        property_type,
        space_available,
        space_unit,
        warehouse_size,
        available_from,
        price_type,
        price_per_sqft,
        address,
        city,
        state,
        pincode,
        road_connectivity,
        contact_person_name,
        contact_person_phone,
        contact_person_email,
        latitude,
        longitude,
        amenities,
        is_verified,
        is_featured,
        status,
        created_at,
        updated_at
       FROM warehouses
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [session.userId]
    );

    // Helper function to safely parse amenities
    const parseAmenities = (amenities: any): string[] => {
      if (!amenities) return [];

      // If it's already an array, return it
      if (Array.isArray(amenities)) return amenities;

      // If it's a string, try to parse it
      if (typeof amenities === 'string') {
        try {
          const parsed = JSON.parse(amenities);
          return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          // If parsing fails, return empty array
          console.warn('Failed to parse amenities:', amenities);
          return [];
        }
      }

      return [];
    };

    // Parse amenities JSON and format response
    const properties = warehousesResult.rows.map(warehouse => ({
      ...warehouse,
      amenities: parseAmenities(warehouse.amenities),
    }));

    return NextResponse.json({
      success: true,
      count: properties.length,
      properties: properties,
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });

  } catch (error) {
    console.error('Fetch listings error:', error);
    
    // Provide more specific error details in development
    const errorMessage = process.env.NODE_ENV === 'development' && error instanceof Error
      ? error.message
      : 'Failed to fetch listings. Please try again.';
    
    return NextResponse.json(
      {
        error: errorMessage,
        success: false,
        properties: [] // Return empty array so client can handle gracefully
      },
      { status: 500 }
    );
  }
}