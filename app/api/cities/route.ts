export const dynamic = 'force-dynamic'; 
import { NextRequest, NextResponse } from "next/server";

interface CityResponse {
  name: string;
  state: string;
  latitude: number;
  alternate_name: string;
  stateCode: string; 
  longitude: number;
}

// In-memory cache for cities data
let citiesCache: { id?: string; city: string; stateCode: string; alternate_name?: string; latitude?: number; longitude?: number }[] | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const searchQuery = searchParams.get('search');

    console.log('🔍 Cities API called at:', new Date().toISOString());
    if (searchQuery) {
      console.log(`🔎 Search query: "${searchQuery}"`);
    }

    if (searchQuery && searchQuery.trim().length > 0) {
      console.log('🌐 Fetching search results from Indian Cities API...');
      
      const response = await fetch(
        `https://indian-cities.vercel.app/api/cities?search=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data: CityResponse[] = await response.json();

      if (!Array.isArray(data)) {
        throw new Error('Invalid data format received from API');
      }

      console.log(`📊 Received ${data.length} cities matching "${searchQuery}"`);

      // Group cities by lat/long to deduplicate same-location cities
      // e.g. "Bangalore" and "Bengaluru" at the same coordinates = same city
      const locationMap = new Map<string, CityResponse[]>();

      data.forEach((city) => {
        if (city.latitude && city.longitude) {
          // Round to 3 decimal places (~111m precision) for grouping
          const key = `${Number(city.latitude).toFixed(3)},${Number(city.longitude).toFixed(3)}`;
          if (!locationMap.has(key)) {
            locationMap.set(key, []);
          }
          locationMap.get(key)!.push(city);
        } else {
          // No coordinates — treat as unique
          const key = `no-coords-${city.name}-${city.state}`;
          locationMap.set(key, [city]);
        }
      });

      const searchResults: {
        id: string;
        city: string;
        stateCode: string;
        alternate_name?: string;
        all_names: string[];
        latitude?: number;
        longitude?: number;
      }[] = [];

      let index = 0;
      locationMap.forEach((group) => {
        // Pick the "primary" city — prefer the one whose name matches the search query
        const primary = group.find(
          (c) => c.name.toLowerCase().includes(searchQuery.toLowerCase())
        ) || group[0];

        // Collect ALL names for this location (including alternate_name fields)
        const allNames = new Set<string>();
        group.forEach((c) => {
          if (c.name) allNames.add(c.name);
          if (c.alternate_name) allNames.add(c.alternate_name);
        });

        // Alternate names = all names except the primary one
        const alternateNames = [...allNames].filter(
          (n) => n.toLowerCase() !== primary.name.toLowerCase()
        );

        searchResults.push({
          id: `${primary.name}-${primary.state}-${index}`,
          city: primary.name,
          stateCode: primary.stateCode,
          alternate_name: alternateNames.join(',') || primary.alternate_name || undefined,
          all_names: [...allNames],
          latitude: primary.latitude,
          longitude: primary.longitude,
        });

        index++;
      });

      return NextResponse.json(searchResults);
    }

    // No search query — return cached data or fetch all cities
    const now = Date.now();
    if (citiesCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
      const cacheAge = Math.floor((now - cacheTimestamp) / (60 * 1000));
      console.log(`✅ Returning ${citiesCache.length} cities from server cache (age: ${cacheAge} minutes)`);
      return NextResponse.json(citiesCache);
    }

    console.log('⚠️ Cache miss or expired, fetching all cities from Indian Cities API...');

    const response = await fetch('https://indian-cities.vercel.app/api/cities', {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data: CityResponse[] = await response.json();

    if (!Array.isArray(data)) {
      throw new Error('Invalid data format received from API');
    }

    console.log(`📊 Received ${data.length} cities from Indian Cities API`);

    const allCities = data.map((city, index) => ({
      id: `${city.name}-${city.stateCode}-${index}`,
      city: city.name,
      stateCode: city.stateCode,
      alternate_name: city.alternate_name || undefined,
      latitude: city.latitude,
      longitude: city.longitude,
    }));

    const citiesWithGeocodes = allCities.filter(c => c.latitude && c.longitude).length;
    console.log(`✅ Successfully processed ${allCities.length} total cities (${citiesWithGeocodes} with geocodes)`);

    citiesCache = allCities;
    cacheTimestamp = Date.now();
    console.log(`💾 Cached ${allCities.length} cities in server memory`);

    return NextResponse.json(allCities);
  } catch (error: any) {
    console.error("❌ Cities API error:", error.message || error);

    if (citiesCache && citiesCache.length > 0) {
      console.log(`⚠️ Returning ${citiesCache.length} cities from expired cache due to error`);
      return NextResponse.json(citiesCache);
    }

    return NextResponse.json(
      {
        error: "Failed to load cities",
        message: error.message || "Unknown error occurred",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}