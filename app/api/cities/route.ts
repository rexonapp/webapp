export const dynamic = 'force-dynamic'; 
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

// CountryStateCity API for India
// Clean the API key by removing quotes and whitespace that might cause header issues
const API_KEY = process.env.CSC_API_KEY?.trim().replace(/^["']|["']$/g, ''); // Store your key in .env.local

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
    console.log('🔍 Cities API called at:', new Date().toISOString());

    if (!API_KEY) {
      console.error(' CSC_API_KEY is not set in environment variables');
      throw new Error("CSC_API_KEY is not set in environment variables");
    }

    // Check if cache is valid
    const now = Date.now();
    if (citiesCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
      const cacheAge = Math.floor((now - cacheTimestamp) / (60 * 1000)); // in minutes
      console.log(`s Returning ${citiesCache.length} cities from server cache (age: ${cacheAge} minutes)`);
      return NextResponse.json(citiesCache);
    }

    console.log('⚠️ Cache miss or expired, fetching cities from CountryStateCity API...');
    console.log(` Fetching cities for ${INDIAN_STATES.length} Indian states...`);

    const allCities: { id?: string; city: string; stateCode: string; latitude?: number; longitude?: number }[] = [];
    let successfulStates = 0;
    let failedStates = 0;

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
            timeout: 10000, // 10 second timeout per request
          }
        );

        const stateCities: { id?: string; name?: string; latitude?: string; longitude?: string }[] = response.data;
        console.log(`s [${i + 1}/${INDIAN_STATES.length}] Fetched ${stateCities.length} cities for state: ${stateCode}`);
        successfulStates++;

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
          console.log(`⏳ Rate limit pause after ${i + 1} requests...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (stateError: any) {
        failedStates++;
        console.error(` [${i + 1}/${INDIAN_STATES.length}] Failed to fetch cities for state ${stateCode}:`,
          stateError.message || stateError.response?.status || stateError);
        // Continue with other states
      }
    }

    console.log(` Summary: ${successfulStates} successful, ${failedStates} failed out of ${INDIAN_STATES.length} states`);

    // Only update cache if we got at least some cities
    if (allCities.length > 0) {
      citiesCache = allCities;
      cacheTimestamp = Date.now();

      // Count cities with valid geocodes
      const citiesWithGeocodes = allCities.filter(c => c.latitude && c.longitude).length;
      console.log(` Successfully fetched ${allCities.length} total cities with state codes (${citiesWithGeocodes} with geocodes)`);
      console.log(` Cached ${allCities.length} cities in server memory for ${CACHE_DURATION / (60 * 60 * 1000)} hours`);
      return NextResponse.json(allCities);
    } else {
      console.error(' No cities were fetched from any state');
      throw new Error('Failed to fetch cities from any state');
    }
  } catch (error: any) {
    console.error("Cities API error:", error.message || error);
    console.error("s Full error:", error);

    // If we have cached data (even expired), return it instead of erroring out
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
