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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get('city');
    const state = searchParams.get('state');
    const propertyType = searchParams.get('type');
    const distance = searchParams.get('distance');

    // alternate_names is a comma-separated list of alternate spellings
    // for the same city (same lat/long), e.g. "Bengaluru,Bangalore Rural"
    const alternateCityNames = searchParams.get('alternate_names');

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

    // Build city matching clause
    // Matches: exact city name OR any of the provided alternate names
    // (all representing the same physical location — same lat/long)
    if (city && city.trim() !== '') {
      // Collect all name variants to match against
      const cityVariants: string[] = [city.trim()];

      if (alternateCityNames && alternateCityNames.trim() !== '') {
        const extras = alternateCityNames
          .split(',')
          .map((n) => n.trim())
          .filter((n) => n.length > 0);
        cityVariants.push(...extras);
      }

      // Build: LOWER(TRIM(city)) = ANY($N)
      // Using PostgreSQL ANY with an array is clean and handles N variants
      const variantsLower = cityVariants.map((v) => v.toLowerCase());

      queryText += ` AND (
        LOWER(TRIM(city)) = ANY($${paramCounter}::text[])
        OR LEFT(LOWER(TRIM(city)), 7) = LEFT(LOWER(TRIM($${paramCounter + 1})), 7)
      )`;

      queryParams.push(variantsLower);           // $N  — array of all variants
      queryParams.push(city.trim().toLowerCase()); // $N+1 — for prefix fuzzy match on primary name
      paramCounter += 2;
    }

    // State filter — handle both codes and full names
    if (state && state.trim() !== '') {
      const stateValue =
        state.length <= 3 && STATE_MAP[state.toUpperCase()]
          ? STATE_MAP[state.toUpperCase()]
          : state;

      queryText += ` AND LOWER(TRIM(state)) = LOWER(TRIM($${paramCounter}))`;
      queryParams.push(stateValue);
      paramCounter++;
    }

    // Property type filter
    if (propertyType && propertyType !== 'all') {
      queryText += ` AND LOWER(TRIM(property_type)) = LOWER(TRIM($${paramCounter}))`;
      queryParams.push(propertyType);
      paramCounter++;
    }
    // Distance/size filter
    if (distance) {
      const distanceValue = parseInt(distance);
      if (distanceValue === 10000) {
        queryText += ` AND warehouse_size >= $${paramCounter}`;
        queryParams.push(distanceValue);
      } else {
        queryText += ` AND warehouse_size <= $${paramCounter}`;
        queryParams.push(distanceValue);
      }
      paramCounter++;
    }

    queryText += ` ORDER BY is_featured DESC, created_at DESC`;

    const warehousesResult = await query(queryText, queryParams);
    console.log(
      `Search: Found ${warehousesResult.rows.length} properties for filters:`,
      { city, state, propertyType, distance, alternateCityNames }
    );

    const parseAmenities = (amenities: any): string[] => {
      if (!amenities) return [];
      if (Array.isArray(amenities)) return amenities;
      if (typeof amenities === 'string') {
        try {
          const parsed = JSON.parse(amenities);
          return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          return [];
        }
      }
      return [];
    };

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

    return NextResponse.json(
      {
        success: true,
        count: properties.length,
        properties,
        filters: { city, state, propertyType, distance, alternateCityNames },
      },
      {
        headers: { 'Cache-Control': 'no-store, must-revalidate' },
      }
    );
  } catch (error) {
    console.error('Search warehouses error:', error);
    return NextResponse.json(
      { error: 'Failed to search warehouses. Please try again.', success: false },
      { status: 500 }
    );
  }
}