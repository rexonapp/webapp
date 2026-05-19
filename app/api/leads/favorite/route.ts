import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/session";
import { notifyAgentOnFavorite } from "@/lib/agent-notifications";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    let isNewFavorite = false;

    if (existing.rows.length > 0) {
      const wasInactive = !existing.rows[0].is_active;

      result = await query(
        `UPDATE lead_activity
         SET is_active        = TRUE,
             price_at_favorite = $1,
             updated_at        = CURRENT_TIMESTAMP
         WHERE user_id    = $2
           AND property_id = $3
         RETURNING *`,
        [priceAtFavorite, session.userId, propertyId]
      );

      // Only notify if the favourite was previously removed and is being re-added
      isNewFavorite = wasInactive;
    } else {
      result = await query(
        `INSERT INTO lead_activity (user_id, property_id, price_at_favorite)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [session.userId, propertyId, priceAtFavorite]
      );

      isNewFavorite = true;
    }

    // Fire-and-forget agent notification (errors are caught inside the function)
   // In route.ts — ensure all three args are the correct fields
if (isNewFavorite) {
  notifyAgentOnFavorite(
    String(propertyId),          // lead_activity.property_id varchar → warehouse UUID string
    String(session.userId),      // for leads name lookup
    String(result.rows[0].id)    // lead_activity.id which is uuid ✓
  );
}

    return NextResponse.json(
      { message: "Favorite saved successfully", data: result.rows[0] },
      { status: 200 }
    );
  } catch (error) {
    console.error("Favorite Error:", error)
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
       SET is_active  = FALSE,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id    = $1
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