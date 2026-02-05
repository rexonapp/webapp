import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// State code to full name mapping
const STATE_MAP: Record<string, string> = {
  'AP': 'Andhra Pradesh',
  'AR': 'Arunachal Pradesh',
  'AS': 'Assam',
  'BR': 'Bihar',
  'CG': 'Chhattisgarh',
  'GA': 'Goa',
  'GJ': 'Gujarat',
  'HR': 'Haryana',
  'HP': 'Himachal Pradesh',
  'JH': 'Jharkhand',
  'KA': 'Karnataka',
  'KL': 'Kerala',
  'MP': 'Madhya Pradesh',
  'MH': 'Maharashtra',
  'MN': 'Manipur',
  'ML': 'Meghalaya',
  'MZ': 'Mizoram',
  'NL': 'Nagaland',
  'OD': 'Odisha',
  'PB': 'Punjab',
  'RJ': 'Rajasthan',
  'SK': 'Sikkim',
  'TN': 'Tamil Nadu',
  'TS': 'Telangana',
  'TR': 'Tripura',
  'UP': 'Uttar Pradesh',
  'UK': 'Uttarakhand',
  'WB': 'West Bengal',
  'AN': 'Andaman and Nicobar Islands',
  'CH': 'Chandigarh',
  'DN': 'Dadra and Nagar Haveli and Daman and Diu',
  'DL': 'Delhi',
  'JK': 'Jammu and Kashmir',
  'LA': 'Ladakh',
  'LD': 'Lakshadweep',
  'PY': 'Puducherry'
};

// Search endpoint to fetch warehouses based on filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get('city');
    const state = searchParams.get('state');
    const propertyType = searchParams.get('type');
    const distance = searchParams.get('distance');

    // Build the query dynamically based on filters
    let queryText = `
      SELECT
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
      WHERE status = 'Active'
    `;

    const queryParams: any[] = [];
    let paramCounter = 1;

    // Add city filter with flexible matching (handles spelling variations like Tirupati/Tirupathi)
    if (city && city.trim() !== '') {
      // Use fuzzy matching to handle slight spelling variations
      // Matches if: exact match OR first 7 characters match (handles Tirupati/Tirupathi)
      queryText += ` AND (
        LOWER(TRIM(city)) = LOWER(TRIM($${paramCounter}))
        OR LEFT(LOWER(TRIM(city)), 7) = LEFT(LOWER(TRIM($${paramCounter})), 7)
      )`;
      queryParams.push(city);
      paramCounter++;
    }

    // Add state filter - handle both state codes and full names
    if (state && state.trim() !== '') {
      // Convert state code to full name if it's a code (2-3 chars)
      const stateValue = state.length <= 3 && STATE_MAP[state.toUpperCase()]
        ? STATE_MAP[state.toUpperCase()]
        : state;

      queryText += ` AND LOWER(TRIM(state)) = LOWER(TRIM($${paramCounter}))`;
      queryParams.push(stateValue);
      paramCounter++;
    }

    // Add property type filter
    if (propertyType && propertyType !== 'all') {
      queryText += ` AND property_type = $${paramCounter}`;
      queryParams.push(propertyType);
      paramCounter++;
    }

    // Add distance filter (warehouse_size in meters)
    if (distance) {
      const distanceValue = parseInt(distance);
      if (distanceValue === 10000) {
        // 10000 metres or above
        queryText += ` AND warehouse_size >= $${paramCounter}`;
        queryParams.push(distanceValue);
      } else {
        // Less than or equal to specified distance
        queryText += ` AND warehouse_size <= $${paramCounter}`;
        queryParams.push(distanceValue);
      }
      paramCounter++;
    }

    queryText += ` ORDER BY is_featured DESC, created_at DESC`;

    // Execute the query
    const warehousesResult = await query(queryText, queryParams);
    console.log(`Search: Found ${warehousesResult.rows.length} properties for filters:`, { city, state, propertyType, distance });

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
          console.warn('Failed to parse amenities:', amenities);
          return [];
        }
      }

      return [];
    };

    // Fetch images for each warehouse from uploads table
    const properties = await Promise.all(
      warehousesResult.rows.map(async (warehouse) => {
        const mediaResult = await query(
          `SELECT id, file_name, file_type, s3_url, is_primary, image_order
           FROM uploads
           WHERE warehouse_id = $1 AND status = 'Active' AND file_type LIKE 'image/%'
           ORDER BY is_primary DESC, image_order ASC`,
          [warehouse.id]
        );

        return {
          ...warehouse,
          amenities: parseAmenities(warehouse.amenities),
          images: mediaResult.rows,
        };
      })
    );

    return NextResponse.json({
      success: true,
      count: properties.length,
      properties: properties,
      filters: {
        city,
        state,
        propertyType,
        distance
      }
    }, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
      }
    });

  } catch (error) {
    console.error('Search warehouses error:', error);
    return NextResponse.json(
      {
        error: 'Failed to search warehouses. Please try again.',
        success: false
      },
      { status: 500 }
    );
  }
}