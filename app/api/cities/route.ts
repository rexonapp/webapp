import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

// CountryStateCity API for India
const API_KEY = process.env.CSC_API_KEY; // Store your key in .env.local
const EXTERNAL_API = "https://api.countrystatecity.in/v1/countries/IN/cities";


//API to fetch using stat codes
//https://api.countrystatecity.in/v1/countries/IN/states/MH/cities
export async function GET(request: NextRequest) {
  try {
    if (!API_KEY) {
      throw new Error("CSC_API_KEY is not set in environment variables");
    }

    // Fetch all cities using axios
    const response = await axios.get(EXTERNAL_API, {
      headers: {
        "X-CSCAPI-KEY": API_KEY,
      },
    });

    const allCities: { id: string; name: string; state_code: string }[] = response.data;

    // Map to a simpler format if you want
    const result = allCities.map(item => ({
      id: item.id,
      city: item.name,
      stateCode: item.state_code,
    }));
console.log(result, "result")
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Cities API error:", error.message || error);
    return NextResponse.json(
      { error: "Failed to load cities" },
      { status: 500 }
    );
  }
}
