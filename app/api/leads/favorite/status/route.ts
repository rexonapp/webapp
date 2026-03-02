import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json(
        { favoriteIds: [] },
        { status: 200 }
      );
    }

    const { propertyIds } = await request.json();
    if (!propertyIds || propertyIds.length === 0) {
      return NextResponse.json({ favoriteIds: [] });
    }

    const result = await query(
        `SELECT property_id
         FROM lead_activity
         WHERE user_id = $1
         AND property_id = ANY($2)
         AND is_active = true`,
        [session.userId, propertyIds]
      ); 
    const favoriteIds = result.rows.map(
      (row: any) => row.property_id
    );
    return NextResponse.json({ favoriteIds });

  } catch (error) {
    console.error("Favorite status error:", error);
    return NextResponse.json(
      { favoriteIds: [] },
      { status: 500 }
    );
  }
}