import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSession();

    if (!session || !session.userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const result = await query(
        `
        SELECT 
          w.id,
          w.property_name,
          w.property_type,
          w.city,
          w.state,
          w.price_per_sqft,
          w.space_available,
          w.space_unit,
          w.status,
          w.is_verified,
          w.is_featured,
          w.title,
          w.state_code,
          w.property_code,
          la.price_at_favorite,
          la.created_at,
          la.user_id

      
        FROM lead_activity la
        JOIN warehouses w ON w.id::varchar = la.property_id
        WHERE la.user_id = $1
          AND la.is_active = TRUE
        ORDER BY la.created_at DESC
        `,
        [session.userId]
      );
      
    return NextResponse.json(result.rows);

  } catch (error) {
    console.error("Favorites Fetch Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
