import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db"; // adjust path
import { getSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session || !session.userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { propertyId, priceAtFavorite } = body;

    if (!propertyId) {
      return NextResponse.json(
        { error: "Property ID is required" },
        { status: 400 }
      );
    }

    // Check if favorite already exists
    const existing = await query(
      `SELECT id, is_active
       FROM lead_activity
       WHERE user_id = $1
       AND property_id = $2
       LIMIT 1`,
      [session.userId, propertyId]
    );

    let result;

    if (existing.rows.length > 0) {
      // Reactivate existing favorite
      result = await query(
        `UPDATE lead_activity
         SET is_active = TRUE,
             price_at_favorite = $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $2
         AND property_id = $3
         RETURNING *`,
        [priceAtFavorite, session.userId, propertyId]
      );
    } else {
      // Insert new favorite
      result = await query(
        `INSERT INTO lead_activity
         (user_id, property_id, price_at_favorite)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [session.userId, propertyId, priceAtFavorite]
      );
    }

    return NextResponse.json(
      { message: "Favorite saved successfully", data: result.rows[0] },
      { status: 200 }
    );

  } catch (error) {
    console.error("Favorite Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}




export async function DELETE(request: NextRequest) {
    try {
      const session = await getSession();
  
      if (!session || !session.userId) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }
  
      const body = await request.json();
      const { propertyId } = body;
  
      if (!propertyId) {
        return NextResponse.json(
          { error: "Property ID is required" },
          { status: 400 }
        );
      }
  
      await query(
        `UPDATE lead_activity
         SET is_active = FALSE,
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $1
         AND property_id = $2`,
        [session.userId, propertyId]
      );
  
      return NextResponse.json(
        { message: "Favorite removed successfully" },
        { status: 200 }
      );
  
    } catch (error) {
      console.error("Remove Favorite Error:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  }
  