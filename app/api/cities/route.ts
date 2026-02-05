export const dynamic = 'force-dynamic'; 
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

// CountryStateCity API for India
const API_KEY = process.env.CSC_API_KEY; // Store your key in .env.local

// State codes for all Indian states
const INDIAN_STATES = [
  'AP', 'AR', 'AS', 'BR', 'CG', 'GA', 'GJ', 'HR', 'HP', 'JH', 'KA', 'KL',
  'MP', 'MH', 'MN', 'ML', 'MZ', 'NL', 'OD', 'PB', 'RJ', 'SK', 'TN', 'TS',
  'TR', 'UP', 'UK', 'WB', 'AN', 'CH', 'DN', 'DL', 'JK', 'LA', 'LD', 'PY'
];

// In-memory cache for cities data with geocodes
let citiesCache: { id?: string; city: string; stateCode: string; latitude?: number; longitude?: number }[] | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export async function GET(request: NextRequest) {
  try {
    if (!API_KEY) {
      throw new Error("CSC_API_KEY is not set in environment variables");
    }

    // Check if cache is valid
    const now = Date.now();
    if (citiesCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
      console.log(`Returning ${citiesCache.length} cities from cache`);
      return NextResponse.json(citiesCache);
    }

    console.log('Cache miss or expired, fetching cities from API...');
    const allCities: { id?: string; city: string; stateCode: string; latitude?: number; longitude?: number }[] = [];

    // Fetch cities for each state to get proper state codes and geocodes (with batching to avoid rate limits)
    for (let i = 0; i < INDIAN_STATES.length; i++) {
      const stateCode = INDIAN_STATES[i];
      try {
        const response = await axios.get(
          `https://api.countrystatecity.in/v1/countries/IN/states/${stateCode}/cities`,
          {
            headers: {
              "X-CSCAPI-KEY": API_KEY,
            },
          }
        );

        const stateCities: { id?: string; name?: string; latitude?: string; longitude?: string }[] = response.data;
        console.log(`✅ Fetched ${stateCities.length} cities for state: ${stateCode}`);

        // Map cities with their state code and geocodes
        stateCities.forEach(item => {
          if (item && item.name) {
            // Parse latitude and longitude as numbers, handle cases where they might be missing
            const latitude = item.latitude ? parseFloat(item.latitude) : undefined;
            const longitude = item.longitude ? parseFloat(item.longitude) : undefined;

            allCities.push({
              id: item.id || `${item.name}-${stateCode}`,
              city: item.name,
              stateCode: stateCode,
              latitude: !isNaN(latitude as number) ? latitude : undefined,
              longitude: !isNaN(longitude as number) ? longitude : undefined,
            });
          }
        });

        // Add a small delay to avoid rate limiting (every 10 requests)
        if ((i + 1) % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (stateError) {
        console.warn(`Failed to fetch cities for state ${stateCode}:`, stateError);
        // Continue with other states
      }
    }

    // Update cache
    citiesCache = allCities;
    cacheTimestamp = Date.now();

    // Count cities with valid geocodes
    const citiesWithGeocodes = allCities.filter(c => c.latitude && c.longitude).length;
    console.log(`✅ Fetched ${allCities.length} cities from API with state codes (${citiesWithGeocodes} with geocodes)`);
    return NextResponse.json(allCities);
  } catch (error: any) {
    console.error("Cities API error:", error.message || error);
    return NextResponse.json(
      { error: "Failed to load cities" },
      { status: 500 }
    );
  }
}
