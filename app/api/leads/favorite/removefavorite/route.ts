import { query } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  try {
    const { user_id, property_id } = await req.json();
    console.log(user_id, property_id, "removefavorite")
    if (!user_id || !property_id) {
      return NextResponse.json(
        { success: false, message: "Missing params" },
        { status: 400 }
      );
    }

    await query(
      `UPDATE lead_activity 
       SET is_active = false 
       WHERE user_id = $1 AND property_id = $2`,
      [user_id, property_id]
    );

    return NextResponse.json({
      success: true,
      message: "Removed from favorites",
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}