import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session || !session.userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.', success: false },
        { status: 401 }
      );
    }

    // Validate that userId looks like a UUID before querying
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(String(session.userId))) {
      console.error('Invalid userId format in session:', session.userId);
      return NextResponse.json(
        { error: 'Invalid session. Please sign out and sign in again.', success: false },
        { status: 401 }
      );
    }

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
       WHERE user_id = $1::uuid
       ORDER BY created_at DESC`,
      [session.userId]
    );

    const parseAmenities = (amenities: any): string[] => {
      if (!amenities) return [];
      if (Array.isArray(amenities)) return amenities;
      if (typeof amenities === 'string') {
        try {
          const parsed = JSON.parse(amenities);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      }
      return [];
    };

    const properties = warehousesResult.rows.map(warehouse => ({
      ...warehouse,
      is_featured: warehouse.is_featured,
      amenities: parseAmenities(warehouse.amenities),
    }));

    return NextResponse.json({
      success: true,
      count: properties.length,
      properties,
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });

  } catch (error) {
    console.error('Fetch listings error:', error);
    const errorMessage = process.env.NODE_ENV === 'development' && error instanceof Error
      ? error.message
      : 'Failed to fetch listings. Please try again.';
    
    return NextResponse.json(
      { error: errorMessage, success: false, properties: [] },
      { status: 500 }
    );
  }
}